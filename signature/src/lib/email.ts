import "server-only";
import nodemailer from "nodemailer";
import type { Bien } from "@/content/types";
import type { Conseiller } from "@/content/conseillers";
import type { DemandeEnregistree } from "./stockage";
import { sections, suite } from "./resume";

/**
 * Envoi de la fiche acquéreur au conseiller du bien.
 *
 * Configuration (variables d'environnement, jamais dans le code) :
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
 * Ex. Google Workspace : smtp.gmail.com, 465, adresse complète, mot de passe d'application.
 * Sans configuration, rien n'est envoyé : la demande reste enregistrée et un avertissement
 * est écrit dans les journaux du serveur.
 */

const echapper = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function composerEmail(d: DemandeEnregistree, bien: Bien) {
  const c = d.demande;
  const sujet = `Nouvelle demande de visite — ${bien.titre}, ${bien.commune} — ${c.prenom} ${c.nom}`;
  const blocs = sections(d.demande)
    .map(([titre, lignes]) => {
      const rangs = lignes
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#8a8079;vertical-align:top;white-space:nowrap">${echapper(k)}</td><td style="padding:6px 0;color:#302c29">${echapper(v)}</td></tr>`,
        )
        .join("");
      return `<h3 style="margin:28px 0 8px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#9b7355">${echapper(titre)}</h3><table style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif">${rangs}</table>`;
    })
    .join("");
  const html = `<div style="max-width:640px;margin:0 auto;padding:32px;background:#f4efe6">
<p style="margin:0;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#9b7355">BROZZU – L'Atelier Immo · Signature Collection</p>
<h2 style="margin:12px 0 4px;font:400 26px/1.25 Georgia,serif;color:#302c29">${echapper(bien.titre)} · ${echapper(bien.commune)}</h2>
<p style="margin:0 0 4px;font:14px/1.5 Arial,sans-serif;color:#302c29"><strong>${echapper(suite(d.demande))}</strong></p>
<p style="margin:0;font:13px/1.5 Arial,sans-serif;color:#8a8079">Référence ${echapper(d.reference)} · reçue le ${new Date(d.recueLe).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}${bien.mentions?.reference ? ` · bien réf. ${echapper(bien.mentions.reference)}` : ""}</p>
${blocs}
<p style="margin:32px 0 0;font:12px/1.5 Arial,sans-serif;color:#8a8079">Répondez directement à ce message pour écrire à l'acquéreur.</p>
</div>`;
  const texte = [
    `${bien.titre} · ${bien.commune}`,
    suite(d.demande),
    `Référence ${d.reference}`,
    ...sections(d.demande).flatMap(([t, l]) => ["", t.toUpperCase(), ...l.filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`)]),
  ].join("\n");
  return { sujet, html, texte };
}

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

export async function envoyerAuConseiller(d: DemandeEnregistree, bien: Bien, conseiller: Conseiller) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.warn(`[email] SMTP non configuré : demande ${d.reference} enregistrée sans envoi à ${conseiller.email}.`);
    return { envoye: false as const };
  }
  const port = Number(SMTP_PORT ?? 465);
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  const { sujet, html, texte } = composerEmail(d, bien);
  await transport.sendMail({
    from: EMAIL_FROM ?? `BROZZU Signature <${SMTP_USER}>`,
    to: conseiller.email,
    // L'adresse de l'acquéreur, déjà validée par le schéma, sert seulement de « Répondre à ».
    replyTo: { name: `${d.demande.prenom} ${d.demande.nom}`, address: d.demande.email },
    subject: sujet,
    html,
    text: texte,
  });
  return { envoye: true as const };
}
