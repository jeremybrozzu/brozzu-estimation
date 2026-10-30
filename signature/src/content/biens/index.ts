import type { Bien } from "../types";
import { demo } from "./demo";
import { proprieteProvencaleSaintCannat } from "./propriete-provencale-saint-cannat";
import { appartementVuePortPortDeBouc } from "./appartement-vue-port-port-de-bouc";

/** Registre des biens. Pour ajouter un mandat : créer un fichier et l'ajouter ici. */
export const biens: Bien[] = [proprieteProvencaleSaintCannat, appartementVuePortPortDeBouc, demo];

export function getBien(slug: string): Bien | undefined {
  return biens.find((b) => b.slug === slug && b.publie);
}
