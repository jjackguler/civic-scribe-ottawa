import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MAX_HISTORY, MAX_MESSAGE, type KeeperConfig, type KeeperReply } from "./keeper";

/**
 * Public endpoints for the Keeper on /ask. Every failure returns a usable
 * answer; no endpoint returns or logs a key.
 */

const locale = z.enum(["en", "fr"]);

/** Which engines are switched on. Names only, never values. */
export const keeperConfig = createServerFn({ method: "GET" }).handler(async (): Promise<KeeperConfig> => {
  try {
    const k = await import("./keeper.server");
    const c = await import("./claude.server");
    return { convaiCharacterId: k.convaiCharacterId(), premiumVoice: k.premiumVoiceAvailable(), model: c.modelProvider() };
  } catch {
    return { convaiCharacterId: null, premiumVoice: false, model: null };
  }
});

export const askKeeper = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    // Over-long messages are refused with a friendly note, not a validation error.
    message: z.string().min(1).max(MAX_MESSAGE * 4),
    history: z.array(z.object({ role: z.enum(["reader", "keeper"]), text: z.string().max(2000) })).max(MAX_HISTORY * 2),
    locale,
  }).parse(d))
  .handler(async ({ data }): Promise<KeeperReply> => {
    const fr = data.locale === "fr";
    if (data.message.trim().length > MAX_MESSAGE) {
      return { ok: false, note: "length", citations: [], guides: [], reply: fr ? `Votre message est un peu long. Gardez-le sous ${MAX_MESSAGE} caractères, s'il vous plaît.` : `That's a long one. Please keep it under ${MAX_MESSAGE} characters.` };
    }
    try {
      const k = await import("./keeper.server");
      const ip = k.clientIp();
      if (!k.allow(`ask:${ip}`, 6, 60_000) || !k.allow(`ask-h:${ip}`, 60, 3600_000)) {
        return { ok: false, note: "rate", citations: [], guides: [], reply: fr ? "Doucement : je range encore les dossiers de votre dernière question. Réessayez dans une minute." : "Easy there: I'm still filing your last few questions. Try again in a minute." };
      }
      return await k.answer({ message: data.message, history: data.history.slice(-MAX_HISTORY), locale: data.locale });
    } catch (e) {
      console.warn("[keeper] ask", (e as Error).message);
      return { ok: false, note: "error", citations: [], guides: [], reply: fr ? "Quelque chose s'est coincé dans les archives. Réessayez dans un instant." : "Something jammed in the archive. Please try again in a moment." };
    }
  });

/**
 * One-hour Convai auth token for a voice session, plus today's headlines as
 * context. Returns null when Convai isn't configured or the limit is hit.
 */
export const keeperConvaiSession = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ locale }).parse(d))
  .handler(async ({ data }): Promise<{ authToken: string; characterId: string; context: string } | null> => {
    try {
      const k = await import("./keeper.server");
      const characterId = k.convaiCharacterId();
      if (!characterId) return null;
      if (!k.allow(`convai:${k.clientIp()}`, 4, 10 * 60_000)) return null;
      const tok = await k.mintConvaiToken();
      if (!tok) return null;
      return { authToken: tok.authToken, characterId, context: await k.headlineDigest(data.locale) };
    } catch (e) {
      console.warn("[keeper] convai session", (e as Error).message);
      return null;
    }
  });
