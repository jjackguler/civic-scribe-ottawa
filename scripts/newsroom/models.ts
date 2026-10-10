import { appendFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { RoleName } from "../../src/lib/newsroom-types";
export type Tier = "writer" | "checker";
export type CallCtx = { id: string; attempt: number };
export interface Models {
  /** An infrastructure failure stops this run; it is not an editorial rejection. */
  readonly failure?: string;
  provider: "claude" | "gemini" | "canned";
  model(tier: Tier): string;
  json<T>(role: RoleName, tier: Tier, system: string, user: string, ctx: CallCtx, maxTokens?: number): Promise<T | null>;
  usage: { calls: number; inTokens: number; outTokens: number; usd?: number | null; capped?: number };
}
export function parseJson<T>(text: string): T | null {
  const t = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i < 0 || j <= i) return null;
  try { return JSON.parse(t.slice(i, j + 1)) as T; } catch { return null; }
}
export async function withRetry(f: () => Promise<Response>, max = 1, wait = (n: number) => new Promise<void>(r => setTimeout(r, 4000 * n))): Promise<Response> {
  let res = await f();
  for (let n = 1; n <= max && (res.status === 429 || res.status >= 500); n++) { await res.body?.cancel(); await wait(n); res = await f(); }
  return res;
}
export type Provider = "gemini" | "claude";
export type NewsroomConfig = { provider: Provider; profile: "standard" | "economy"; names: Record<Tier, string>; chain: Record<Tier, string[]>; retries: number };
/** Known illustrative prices only; unrecognised models never borrow another model's price. */
export const PRICE_PER_M: Record<string, [number, number]> = { "gemini-3.1-flash-lite": [0.25, 1.5], "gemini-3.8-flash": [0.75, 3.75] };
export function priceOf(model: string): [number, number] | null { return PRICE_PER_M[model] ?? null; }
export function resolveConfig(e: Record<string, string | undefined>): NewsroomConfig | { error: string } {
  const g = (k: string) => e[k]?.trim() || "";
  const want = (g("NEWSROOM_PROVIDER") || "auto").toLowerCase();
  if (!["auto","gemini","claude"].includes(want)) return { error: "NEWSROOM_PROVIDER must be auto, gemini or claude" };
  const has = { claude: !!g("ANTHROPIC_API_KEY"), gemini: !!g("GEMINI_API_KEY") };
  const provider = want === "auto" ? (has.claude ? "claude" : has.gemini ? "gemini" : null) : want as Provider;
  if (!provider) return { error: "no API key" };
  if (!has[provider]) return { error: "The explicitly selected provider has no API key" };
  const profile = g("NEWSROOM_PROFILE") === "economy" ? "economy" : "standard";
  const retries = Math.min(2, Math.max(0, Math.floor(Number(g("NEWSROOM_RETRIES") || "1") || 0)));
  const cheap = g("NEWSROOM_ECONOMY_MODEL") || "gemini-3.1-flash-lite";
  const names: Record<Tier, string> = provider === "claude" ? {
    writer: g("NEWSROOM_CLAUDE_WRITER") || g("CLAUDE_MODEL") || (profile === "economy" ? "claude-haiku-4-5-20251001" : "claude-sonnet-5-5"),
    checker: g("NEWSROOM_CLAUDE_CHECKER") || "claude-haiku-4-5-20251001",
  } : {
    writer: g("NEWSROOM_GEMINI_WRITER") || (profile === "economy" ? cheap : "gemini-3.8-flash"),
    checker: g("NEWSROOM_GEMINI_CHECKER") || (profile === "economy" ? cheap : "gemini-3.8-flash"),
  };
  const extra = provider === "gemini" ? g("NEWSROOM_GEMINI_FALLBACKS").split(",").map(x=>x.trim()).filter(Boolean).filter(x=>!/pro/i.test(x)||g("NEWSROOM_ALLOW_PRO")==="1") : [];
  const chain = (m: string) => [...new Set([m,...extra])].slice(0,2);
  return { provider, profile, names, chain:{ writer:chain(names.writer),checker:chain(names.checker) }, retries };
}
/** Calls are a hard per-process bound; tokens/USD are stop-after-usage thresholds,
 * can overshoot by ONE in-flight request, and are not account/monthly billing caps.
 * Unknown pricing/usage with a USD threshold fails closed. */
export class RunBudget {
  calls=0; inTokens=0; outTokens=0; usd:number|null=0; capped=0;
  constructor(public limits:{calls:number;tokens:number;usd:number}) {}
  static fromEnv(e:Record<string,string|undefined>) {
    const n=(k:string,d:number)=>{const v=Number(e[k]);return Number.isFinite(v)&&v>0?v:d;};
    return new RunBudget({calls:Math.floor(n("NEWSROOM_RUN_MAX_CALLS",60)),tokens:n("NEWSROOM_RUN_MAX_TOKENS",600000),usd:n("NEWSROOM_RUN_MAX_USD",1)});
  }
  allow() {
    const ok=this.calls<this.limits.calls && this.inTokens+this.outTokens<this.limits.tokens && this.usd!==null && this.usd<this.limits.usd;
    if(!ok)this.capped++;
    return ok;
  }
  begin(model:string) {
    if(!priceOf(model)){this.usd=null;this.capped++;return false;}
    if(!this.allow())return false;
    this.calls++; // reserve before fetch: network exceptions and retries count
    return true;
  }
  usage(model:string,input:number,output:number) {
    this.inTokens+=input; this.outTokens+=output;
    const price=priceOf(model);
    if(!price){this.usd=null;return;}
    if(this.usd!==null)this.usd+=(input*price[0]+output*price[1])/1e6;
  }
  record(model:string,input:number,output:number){this.calls++;this.usage(model,input,output);}
}
export function geminiMaxOutput(maxTokens:number,e:Record<string,string|undefined>) {
  const raw=Number(e.NEWSROOM_GEMINI_THINKING_HEADROOM?.trim()||"1024");
  return Math.max(1,Math.floor(maxTokens))+Math.floor(Math.min(4096,Math.max(0,Number.isFinite(raw)?raw:1024)));
}
export function liveModels(e:Record<string,string|undefined>=process.env, transport:typeof fetch=fetch, wait:(n:number)=>Promise<void>=(n)=>new Promise(r=>setTimeout(r,4000*n))):Models|null {
  const cfg=resolveConfig(e);
  if("error" in cfg){if(cfg.error!=="no API key")report("[newsroom] "+cfg.error);return null;}
  const budget=RunBudget.fromEnv(e);
  let failure: string | undefined;
  // Prices for Claude/custom models must be supplied explicitly. Their defaults are not guessed.
  const customIn=Number(e.NEWSROOM_PRICE_INPUT_PER_M),customOut=Number(e.NEWSROOM_PRICE_OUTPUT_PER_M);
  const customValid=!!e.NEWSROOM_PRICE_INPUT_PER_M&&!!e.NEWSROOM_PRICE_OUTPUT_PER_M&&Number.isFinite(customIn)&&Number.isFinite(customOut)&&customIn>=0&&customOut>=0;
  // Scope configured rates to this instance, not global module state.
  const prices=new Map(Object.entries(PRICE_PER_M));
  if(customValid)for(const m of [...cfg.chain.writer,...cfg.chain.checker])prices.set(m,[customIn,customOut]);
  const known=()=>[...cfg.chain.writer,...cfg.chain.checker].every(m=>prices.has(m));
  if(!known()){report("[newsroom] Unknown model price: set NEWSROOM_PRICE_INPUT_PER_M and NEWSROOM_PRICE_OUTPUT_PER_M; paid calls are disabled until configured.");return null;}
  const countStart=(model:string)=>{
    if(!budget.allow())return false;
    if(!prices.has(model)){budget.usd=null;return false;}
    budget.calls++;return true;
  };
  const recordUsage=(model:string,input:number,output:number)=>{
    budget.inTokens+=input;budget.outTokens+=output;
    const p=prices.get(model)!;if(budget.usd!==null)budget.usd+=(input*p[0]+output*p[1])/1e6;
  };
  report("[newsroom] provider "+cfg.provider+", profile "+cfg.profile+", writer "+cfg.names.writer+", checker "+cfg.names.checker);
  return {
    provider:cfg.provider,usage:budget,model:t=>cfg.names[t],get failure(){return failure;},
    async json<T>(role:RoleName,tier:Tier,system:string,user:string,_ctx:CallCtx,maxTokens=8192) {
      if(failure)return null;
      for(const model of cfg.chain[tier]){
        try {
          const isGemini=cfg.provider==="gemini";
          const res=await withRetry(async()=>{
            if(!countStart(model))return new Response(null,{status:499});
            const url=isGemini ? "https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent" : "https://api.anthropic.com/v1/messages";
            const headers:Record<string,string>=isGemini ? {"x-goog-api-key":e.GEMINI_API_KEY!.trim(),"content-type":"application/json"} : {"x-api-key":e.ANTHROPIC_API_KEY!.trim(),"anthropic-version":"2023-06-01","content-type":"application/json"};
            const body=isGemini ? {
              systemInstruction:{parts:[{text:system+"\n\nReply with JSON only."}]},contents:[{role:"user",parts:[{text:user}]}],
              generationConfig:{maxOutputTokens:geminiMaxOutput(maxTokens,e),temperature:0.3,responseMimeType:"application/json"}
            } : {model,max_tokens:maxTokens,temperature:0.3,system:system+"\n\nReply with JSON only.",messages:[{role:"user",content:user}]};
            return transport(url,{method:"POST",headers,body:JSON.stringify(body),signal:AbortSignal.timeout(150000)});
          },cfg.retries,wait);
          if(res.status===499){failure="Per-run limit reached; remaining work deferred, no further request sent.";report("["+role+"] "+failure);return null;}
          if(!res.ok){
            report("["+role+"] "+cfg.provider+" "+model+" HTTP "+res.status);
            // Only a missing MODEL may use an explicitly configured fallback. No key/quota escalation.
            if(res.status===404 && model!==cfg.chain[tier].at(-1))continue;
            failure=cfg.provider+" HTTP "+res.status+"; check API access, quota and billing. Remaining calls stopped.";
            return null;
          }
          const body=await res.json() as any;
          const input=isGemini?body.usageMetadata?.promptTokenCount:body.usage?.input_tokens;
          const output=isGemini?(body.usageMetadata?.candidatesTokenCount??0)+(body.usageMetadata?.thoughtsTokenCount??0):body.usage?.output_tokens;
          if(!Number.isFinite(input)||!Number.isFinite(output)||input<0||output<0){budget.usd=null;failure="Missing provider usage; remaining paid calls stopped.";report("["+role+"] "+failure);return null;}
          recordUsage(model,input,output);
          if(isGemini){
            const c=body.candidates?.[0];if(!c||["SAFETY","MAX_TOKENS"].includes(c.finishReason))return null;
            return parseJson<T>((c.content?.parts??[]).filter((p:any)=>!p.thought).map((p:any)=>p.text??"").join(""));
          }
          if(["refusal","max_tokens"].includes(body.stop_reason))return null;
          return parseJson<T>((body.content??[]).filter((c:any)=>c.type==="text").map((c:any)=>c.text??"").join(""));
        }catch{
          // A timeout may have been billed. Unknown usage stops additional paid calls; keys/response bodies are never logged.
          budget.usd=null;
          failure="Network or response failure; usage unknown, remaining paid calls stopped.";
          report("["+role+"] "+failure);
          return null;
        }
      }
      return null;
    }
  };
}
function report(msg:string){console.warn(msg);const f=process.env.GITHUB_STEP_SUMMARY;if(f){try{appendFileSync(f,"- "+msg.replace(/[<>]/g,"")+"\n");}catch{}}}
export function cannedModels(answers:Record<string,Partial<Record<RoleName,unknown[]>>>):Models{
  const usage={calls:0,inTokens:0,outTokens:0};
  return {provider:"canned",usage,model:t=>"canned-"+t,async json<T>(role:RoleName,_tier:Tier,_system:string,user:string,ctx:CallCtx){
    usage.calls++;usage.inTokens+=Math.round(user.length/4);const list=answers[ctx.id]?.[role]??[];const a=list[Math.min(ctx.attempt,list.length-1)];
    if(a===undefined)return null;usage.outTokens+=Math.round(JSON.stringify(a).length/4);return structuredClone(a) as T;
  }};
}
/** Opt-in, separate image billing; disabled unless GEMINI_IMAGE_MODEL is set by the operator. */
export async function illustrate(apiKey:string,model:string,prompt:string,out:string):Promise<boolean>{
  try{
    const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent",{method:"POST",headers:{"x-goog-api-key":apiKey,"content-type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Abstract editorial illustration: "+prompt+". Flat geometry, deep teal and yellow. No people, faces, logos, text or news photography."}]}],generationConfig:{responseModalities:["IMAGE"]}}),signal:AbortSignal.timeout(120000)});
    if(!res.ok)return false;const body=await res.json() as any;const data=body.candidates?.[0]?.content?.parts?.find((p:any)=>p.inlineData?.data)?.inlineData?.data;
    if(!data)return false;await writeFile(out,Buffer.from(data,"base64"));return true;
  }catch{return false;}
}
