import { writeFile } from "node:fs/promises";
const cam={from:[1.03,0,0],to:[1.08,0.01,0]};
const source1=[{name:"Google DeepMind · Genie 4",url:"https://deepmind.google/models/genie/"},{name:"TechCrunch · 27 Oct 2026",url:"https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/"}];
const source2=[{name:"IVADO / CRIMT · 15 Oct 2026",url:"https://ivado.ca/en/2026/10/15/ai-at-work-mass-job-displacement-is-not-imminent/"}];
const stories=[
{slug:"room-you-can-rewrite",title:"The Room You Can Rewrite",episode:14,sources:source1,shots:[
["g-door","A room appears. A door opens. Then a few words change the scene.",["THE ROOM","YOU CAN REWRITE"]],
["g-world","Google DeepMind says its new world model, Genie 4, can build interactive environments and respond to instructions while a scene is running.",["GENIE 4","COMPANY CLAIM"]],
["g-editor","For storytellers and educators, the idea is compelling: a place you can explore instead of a video you can only watch.",["EXPLORE","A NEW SCENE"]],
["g-drift","But here is the catch. Genie 4 is an early research preview. Google says details and objects can drift as a simulation continues.",["THE CATCH","DETAILS CAN DRIFT"]],
["g-check","A convincing scene is not evidence of a real place, a reliable memory, or a faithful reconstruction. The useful question is not only what a model can show. It is what a human needs to check before trusting it.",["A SCENE","IS NOT PROOF"]],
["g-close","Sources: Google DeepMind and TechCrunch. AI-assisted illustration and narration. AI news. Humans in charge.",["CHECK THE SOURCE","HUMANS IN CHARGE"]]
]},
{slug:"work-that-remains",title:"The Work That Remains",episode:15,sources:source2,shots:[
["w-desk","If AI enters the workplace, what happens to the person doing the work?",["THE WORK","THAT REMAINS"]],
["w-count","Researchers at IVADO and CRIMT asked 1,015 workers in Quebec. Forty-three percent of those surveyed said they used AI at work.",["1,015 WORKERS","QUEBEC SURVEY"]],
["w-tasks","Among people who used AI, nearly two-thirds said they relied on it for less than a quarter of their tasks.",["64% OF AI USERS","UNDER A QUARTER OF TASKS"]],
["w-voice","The researchers found concerns beyond job loss: privacy, working conditions, inequality, and who gets a say in how the tools are used.",["PRIVACY · CONDITIONS","WHO HAS A SAY?"]],
["w-limit","There is a limit to this evidence. The survey describes the workers who took part; it cannot tell us exactly what will happen to every job.",["A SNAPSHOT","NOT A FORECAST"]],
["w-close","The next step is human: ask what a tool changes, what training people need, and who remains accountable for the decision. Source: IVADO and CRIMT. AI-assisted illustration and narration. AI news. Humans in charge.",["TRAINING · ACCOUNTABILITY","HUMANS IN CHARGE"]]
]}];
for(const s of stories){
  const result={...s,series:"The Sir Jack Files",grain:0.045,narrationOnly:true,slogan:"AI NEWS. HUMANS IN CHARGE.",cta:"SOURCES + FULL STORY → AIBROADSHEET.COM",shots:s.shots.map(([id,say,lines],i)=>({id,say,cam,fx:{},ov:[{t:"kicker",at:0.2,text:`THE SIR JACK FILES · CASE ${s.episode}`},{t:"type",at:0.5,text:lines.join("\n"),y:0.13}],sfx:[]}))};
  await writeFile(new URL(`stories/${s.slug}.json`,import.meta.url),JSON.stringify(result,null,2));
}
