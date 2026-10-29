/**
 * Modèle d'un bien de la Signature Collection.
 *
 * Règle d'or : une information inconnue reste `null` (ou absente).
 * Le site n'affiche jamais une valeur inventée, en particulier pour le DPE,
 * les honoraires, la copropriété et les risques.
 */

export type ClasseEnergie = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type TypeBien = "Maison" | "Appartement" | "Villa" | "Terrain" | "Loft" | "Mas" | "Bastide" | "Autre";

/** Un « chapitre » de texte qui apparaît pendant la progression de la vidéo. */
export interface ChapitreImmersif {
  /** Position dans l'animation, de 0 (début) à 1 (fin). */
  debut: number;
  fin: number;
  surtitre?: string;
  texte: string;
}

export interface Bien {
  slug: string;
  /** Bien de démonstration : bandeau visible, page non indexée. */
  demo?: boolean;
  publie: boolean;

  titre: string;
  typeBien: TypeBien;
  commune: string;
  secteur?: string | null;
  codePostal?: string | null;
  /** Phrase immersive de l'accueil. */
  accroche: string;
  /** Textes qui accompagnent la progression de la vidéo. */
  chapitres: ChapitreImmersif[];

  /** Dossier public/biens/<sequence>/sequence produit par `npm run video`. */
  sequence: string | null;

  /** Prix en euros, honoraires inclus le cas échéant. */
  prix: number | null;

  seo: {
    titre: string;
    description: string;
  };

  /** Lien de l'annonce sur brozzu.fr (balise canonique, évite le contenu dupliqué). */
  annonceUrl?: string | null;
}
