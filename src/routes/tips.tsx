import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Check, Mail, ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import { TIP_MAX } from "@/lib/forms";
import { SITE } from "@/lib/site";
import { seoHead, stripFr } from "@/lib/seo";

export const Route = createFileRoute("/tips")({
  head: ({ match }) =>
    seoHead(match, {
      title: {
        en: `Pitch a story or send a tip — ${SITE.name}`,
        fr: `Proposer un sujet ou envoyer un tuyau — ${SITE.name}`,
      },
      description: {
        en: "Tell the AI Broadsheet editor about an AI story in Canada we should look into, or pitch a piece. What happens to your message, and what not to send.",
        fr: "Signalez à la rédaction d'AI Broadsheet un sujet sur l'IA au Canada, ou proposez un texte. Ce qu'il advient de votre message, et ce qu'il ne faut pas envoyer.",
      },
      breadcrumbs: [{ name: { en: "Send a tip", fr: "Envoyer un tuyau" }, path: "/tips" }],
    }),
  component: Tips,
});

type Status = "idle" | "sending" | "done" | "closed" | "error";

function Tips() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const id = useId();
  const page = useRouterState({ select: (s) => stripFr(s.location.pathname) });
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState("");
  const editor = SITE.email.editor || SITE.email.general;
  const mailto = `mailto:${editor}?subject=${encodeURIComponent(fr ? "Tuyau pour AI Broadsheet" : "Tip for AI Broadsheet")}&body=${encodeURIComponent(message)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 20) {
      setProblem(
        fr
          ? "Écrivez au moins quelques phrases (20 caractères minimum)."
          : "Write at least a few sentences (20 characters minimum).",
      );
      return;
    }
    setProblem("");
    setStatus("sending");
    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, name, contact, locale, page, website }),
      });
      if (res.ok) {
        setStatus("done");
        setMessage("");
        setName("");
        setContact("");
        return;
      }
      if (res.status === 400) {
        setStatus("idle");
        setProblem(
          fr
            ? "Vérifiez le message et le moyen de vous joindre."
            : "Check the message and the contact details.",
        );
        return;
      }
      setStatus(res.status === 503 ? "closed" : "error");
    } catch {
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-[4px] border border-ink/40 bg-surface px-3.5 py-2.5 text-ink placeholder:text-muted-ink";
  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "Envoyer un tuyau" : "Send a tip" }]} />
      </div>
      <div className="container-mw pt-6 pb-4 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="max-w-2xl">
          <p className="kicker">{fr ? "Rédaction" : "Newsroom"}</p>
          <h1 className="hl text-[2.4rem] sm:text-[3rem] mt-2">
            {fr ? "Proposer un sujet ou envoyer un tuyau" : "Pitch a story or send a tip"}
          </h1>
          <p className="font-serif text-[1.2rem] leading-relaxed text-ink/85 mt-3">
            {fr
              ? "Vous voyez l'IA changer quelque chose au travail, à l'école, dans un service public ou dans votre collectivité? Dites-le à la rédaction. Chaque message est lu par une personne."
              : "Seeing AI change something at work, at school, in a public service or in your community? Tell the newsroom. A person reads every message."}
          </p>

          {status === "done" ? (
            <p role="status" className="mt-8 flex gap-3 items-start font-semibold text-[1.05rem]">
              <Check className="h-5 w-5 mt-1 text-spruce" aria-hidden="true" />
              {fr
                ? "Merci, votre message est arrivé à la rédaction."
                : "Thank you. Your message has reached the newsroom."}
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
              <div>
                <label htmlFor={`${id}-msg`} className="block font-semibold">
                  {fr ? "Votre tuyau ou votre proposition" : "Your tip or pitch"}
                </label>
                <p id={`${id}-msg-help`} className="text-[0.88rem] text-muted-ink mt-0.5">
                  {fr
                    ? "Ce qui s'est passé, où, quand, et comment vous le savez. Ajoutez des liens si vous en avez."
                    : "What happened, where, when, and how you know. Add links if you have them."}
                </p>
                <textarea
                  id={`${id}-msg`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={TIP_MAX}
                  rows={8}
                  required
                  aria-describedby={`${id}-msg-help ${id}-err`}
                  aria-invalid={!!problem || undefined}
                  className={`${field} mt-2 font-serif text-[1.05rem]`}
                />
                <p className="text-[0.8rem] text-muted-ink mt-1 text-right tabular-nums">
                  {message.length} / {TIP_MAX}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${id}-name`} className="block font-semibold">
                    {fr ? "Nom (facultatif)" : "Name (optional)"}
                  </label>
                  <input
                    id={`${id}-name`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className={`${field} mt-2 h-12`}
                  />
                </div>
                <div>
                  <label htmlFor={`${id}-contact`} className="block font-semibold">
                    {fr ? "Pour vous joindre (facultatif)" : "How to reach you (optional)"}
                  </label>
                  <input
                    id={`${id}-contact`}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    autoComplete="email"
                    placeholder={fr ? "courriel ou téléphone" : "email or phone"}
                    className={`${field} mt-2 h-12`}
                  />
                </div>
              </div>
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website{" "}
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>
              <p
                id={`${id}-err`}
                role="alert"
                className={`text-live font-semibold text-[0.92rem] ${problem ? "" : "sr-only"}`}
              >
                {problem}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="h-12 px-6 rounded-[4px] bg-ink text-white font-bold hover:bg-lake disabled:opacity-70"
                >
                  {status === "sending"
                    ? fr
                      ? "Envoi…"
                      : "Sending…"
                    : fr
                      ? "Envoyer à la rédaction"
                      : "Send to the newsroom"}
                </button>
                <a
                  href={mailto}
                  className="inline-flex items-center gap-1.5 font-semibold text-lake underline"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {fr ? "ou par courriel" : "or by email"}
                </a>
              </div>
              <div role="status" aria-live="polite">
                {status === "closed" && (
                  <p className="text-[0.95rem]">
                    {fr
                      ? "Le formulaire ouvre bientôt. D'ici là, "
                      : "This form opens soon. Until then, "}
                    <a href={mailto} className="font-semibold text-lake underline">
                      {fr ? `écrivez à ${editor}` : `email ${editor}`}
                    </a>
                    {fr
                      ? " (votre texte est déjà dans le message)."
                      : " (your text is already in the email)."}
                  </p>
                )}
                {status === "error" && (
                  <p className="text-[0.95rem]">
                    {fr ? "L'envoi n'a pas fonctionné. " : "That didn't go through. "}
                    <a href={mailto} className="font-semibold text-lake underline">
                      {fr ? "Envoyez-le par courriel" : "Send it by email"}
                    </a>
                    .
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
        <aside className="grid gap-6 content-start">
          <div className="border border-live/60 bg-surface p-5">
            <p className="flex items-center gap-2 font-bold">
              <ShieldAlert className="h-5 w-5 text-live" aria-hidden="true" />
              {fr ? "Avant d'envoyer" : "Before you send"}
            </p>
            <ul className="mt-3 grid gap-2 font-serif text-[1rem] leading-snug list-disc pl-5">
              <li>
                {fr
                  ? "Ce formulaire n'est pas un canal anonyme ni chiffré de bout en bout. N'envoyez rien qui pourrait vous mettre, ou mettre quelqu'un, en danger."
                  : "This form is not anonymous or end-to-end encrypted. Don't send anything that could put you or anyone else at risk."}
              </li>
              <li>
                {fr
                  ? "N'envoyez pas de renseignements personnels sur d'autres personnes, ni de documents confidentiels."
                  : "Don't send other people's personal information or confidential documents."}
              </li>
              <li>{fr ? "En cas d'urgence, appelez le 911." : "In an emergency, call 911."}</li>
            </ul>
          </div>
          <div className="font-serif text-[1rem] leading-relaxed text-ink/85">
            <h2 className="font-sans font-bold text-[1rem]">
              {fr ? "Ce qu'il advient de votre message" : "What happens to your message"}
            </h2>
            <p className="mt-1.5">
              {fr
                ? `Il est transmis à la boîte de la rédaction de ${SITE.publisher.name}; le site n'en garde aucune copie. Nous ne publions jamais votre nom ni vos coordonnées sans votre accord, et nous vérifions tout auprès d'autres sources avant de publier.`
                : `It is forwarded to ${SITE.publisher.name}'s newsroom inbox; the site keeps no copy. We never publish your name or contact details without your permission, and we check everything with other sources before publishing.`}
            </p>
            <p className="mt-3">
              <Link to="/privacy" hash="tips" className="text-lake font-semibold underline">
                {fr ? "Confidentialité" : "Privacy"}
              </Link>{" "}
              ·{" "}
              <Link to="/standards" className="text-lake font-semibold underline">
                {fr ? "Nos normes" : "Our standards"}
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
