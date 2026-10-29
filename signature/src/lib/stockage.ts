import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import type { Envoi } from "./demande";

/**
 * Stockage des demandes acquéreurs.
 *
 * Version locale : un fichier JSON hors du dossier public, ignoré par git.
 * Phase 5 : remplacé par une base de données (même interface), puis
 * notification e-mail à l'agence et administration.
 */

export interface DemandeEnregistree {
  id: string;
  /** Référence lisible communiquée à l'acquéreur, ex. BRZ-2610-K7QM. */
  reference: string;
  cleEnvoi: string;
  recueLe: string;
  bien: string;
  statut: "creneau_a_valider" | "rappel_a_faire";
  demande: Envoi["demande"];
}

const DOSSIER = join(process.cwd(), ".donnees");
const FICHIER = join(DOSSIER, "demandes.json");

async function lire(): Promise<DemandeEnregistree[]> {
  try {
    return JSON.parse(await readFile(FICHIER, "utf8"));
  } catch {
    return [];
  }
}

/** File d'attente : deux envois simultanés ne s'écrasent pas. */
let file: Promise<unknown> = Promise.resolve();

function reference(date: Date) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffixe = Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]).join("");
  return `BRZ-${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}-${suffixe}`;
}

/** Enregistre la demande ; un second envoi avec la même clé renvoie la demande existante. */
export function enregistrerDemande(envoi: Envoi): Promise<{ demande: DemandeEnregistree; nouvelle: boolean }> {
  const tache = file.then(async () => {
    const demandes = await lire();
    const existante = demandes.find((d) => d.cleEnvoi === envoi.cleEnvoi);
    if (existante) return { demande: existante, nouvelle: false };

    const maintenant = new Date();
    const demande: DemandeEnregistree = {
      id: randomUUID(),
      reference: reference(maintenant),
      cleEnvoi: envoi.cleEnvoi,
      recueLe: maintenant.toISOString(),
      bien: envoi.bien,
      statut: envoi.demande.choix === "creneau" ? "creneau_a_valider" : "rappel_a_faire",
      demande: envoi.demande,
    };
    await mkdir(DOSSIER, { recursive: true });
    const temp = `${FICHIER}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify([...demandes, demande], null, 2), { mode: 0o600 });
    await rename(temp, FICHIER);
    return { demande, nouvelle: true };
  });
  file = tache.catch(() => {});
  return tache;
}

/** Créneaux déjà demandés pour un bien (pour éviter deux demandes sur le même horaire). */
export async function creneauxDemandes(bien: string): Promise<Set<string>> {
  const demandes = await lire();
  return new Set(
    demandes
      .filter((d) => d.bien === bien && d.statut === "creneau_a_valider" && d.demande.creneau)
      .map((d) => d.demande.creneau!.debut),
  );
}
