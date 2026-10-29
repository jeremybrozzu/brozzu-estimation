import { agence } from "@/content/agence";

/**
 * Créneaux de visite.
 *
 * Tant que le Google Agenda n'est pas connecté (phase 5), les créneaux sont
 * calculés à partir des plages autorisées et marqués `demo: true` : l'interface
 * l'affiche clairement et ne présente jamais une demande comme confirmée.
 */

export interface Creneau {
  /** ISO 8601 avec décalage horaire de Paris. */
  debut: string;
  fin: string;
}

export interface JourCreneaux {
  /** AAAA-MM-JJ, heure de Paris. */
  date: string;
  creneaux: Creneau[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Décalage de Paris par rapport à UTC à une date donnée, au format « +01:00 ». */
function decalageParis(utc: Date) {
  const nom = new Intl.DateTimeFormat("en-US", { timeZone: agence.fuseau, timeZoneName: "longOffset" })
    .formatToParts(utc)
    .find((p) => p.type === "timeZoneName")!.value; // « GMT+01:00 »
  return nom === "GMT" ? "+00:00" : nom.slice(3);
}

/** Date du jour à Paris (AAAA-MM-JJ). */
function aujourdhuiParis(maintenant: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: agence.fuseau }).format(maintenant);
}

function iso(date: string, heure: string) {
  const approx = new Date(`${date}T${heure}:00Z`);
  return `${date}T${heure}:00${decalageParis(approx)}`;
}

/** Petit générateur déterministe : la démonstration affiche toujours les mêmes indisponibilités. */
function pseudoAleatoire(graine: string) {
  let h = 2166136261;
  for (const c of graine) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export function creneauxDemo(bien: string, maintenant = new Date()): JourCreneaux[] {
  const { dureeMinutes, delaiMinimumHeures, joursProposes, plages } = agence.visite;
  const limite = maintenant.getTime() + delaiMinimumHeures * 3600 * 1000;
  const jours: JourCreneaux[] = [];
  const base = new Date(`${aujourdhuiParis(maintenant)}T12:00:00Z`);

  for (let j = 0; j < joursProposes; j++) {
    const jour = new Date(base.getTime() + j * 86400000);
    const date = jour.toISOString().slice(0, 10);
    const creneaux: Creneau[] = [];
    for (const [de, a] of plages[jour.getUTCDay()] ?? []) {
      const [hd, md] = de.split(":").map(Number);
      const [ha, ma] = a.split(":").map(Number);
      for (let m = hd * 60 + md; m + dureeMinutes <= ha * 60 + ma; m += dureeMinutes + 30) {
        const debut = iso(date, `${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
        const f = m + dureeMinutes;
        const fin = iso(date, `${pad(Math.floor(f / 60))}:${pad(f % 60)}`);
        if (new Date(debut).getTime() < limite) continue;
        // Démonstration : environ un créneau sur trois apparaît déjà pris.
        if (pseudoAleatoire(`${bien}${debut}`) < 0.33) continue;
        creneaux.push({ debut, fin });
      }
    }
    if (creneaux.length) jours.push({ date, creneaux });
  }
  return jours;
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: agence.fuseau, ...opts });
export const formatJour = (iso: string) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
export const formatJourCourt = (date: string) =>
  fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00Z`));
export const formatHeure = (iso: string) => fmt({ hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":", " h ");
