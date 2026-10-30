/**
 * Modèle d'un bien de la Signature Collection.
 *
 * Règle d'or : une information inconnue reste `null` (ou absente).
 * Le site n'affiche jamais une valeur inventée, en particulier pour le DPE,
 * les honoraires, la copropriété et les risques. Une mention obligatoire
 * manquante est signalée « À compléter » au lieu d'être devinée.
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

export interface Photo {
  /** Nom de base dans public/biens/<slug>/photos/ (fichiers <nom>-1600.webp et <nom>-800.webp). */
  fichier: string;
  alt: string;
  legende?: string;
  largeur: number;
  hauteur: number;
}

/** Caractéristiques affichées uniquement lorsqu'elles sont renseignées. */
export interface Caracteristiques {
  surfaceHabitable: number | null;
  surfaceTerrain: number | null;
  pieces: number | null;
  chambres: number | null;
  sallesDeBains: number | null;
  sallesEau: number | null;
  etage?: string | null;
  ascenseur?: boolean | null;
  stationnement?: string | null;
  anneeConstruction: number | null;
  chauffage: string | null;
  climatisation?: string | null;
  exposition?: string | null;
  cuisine?: string | null;
  /** En euros par an. */
  taxeFonciere: number | null;
  /** Terrasse, piscine, jardin… */
  prestations: string[];
}

export interface Diagnostic {
  classeEnergie: ClasseEnergie | null;
  /** Énergie primaire, kWh/m²/an. */
  consommation: number | null;
  /** Énergie finale, kWh/m²/an. */
  consommationFinale?: number | null;
  classeGes: ClasseEnergie | null;
  /** kg CO₂/m²/an. */
  emissions: number | null;
  /** Estimation des dépenses annuelles d'énergie, en euros. */
  depensesMin: number | null;
  depensesMax: number | null;
  /** Ex. « 2021, 2022 et 2023 ». */
  anneesReferencePrix: string | null;
  /** Date ISO du diagnostic. */
  date: string | null;
}

export interface Copropriete {
  lots: number | null;
  chargesAnnuelles: number | null;
  procedure: string | null;
}

export interface Mentions {
  reference: string | null;
  /**
   * Ex. « Honoraires à la charge du vendeur » ou
   * « Honoraires de 4 % TTC à la charge de l'acquéreur, soit un prix hors honoraires de … ».
   * `false` : mention retirée à la demande de l'agence.
   */
  honoraires: string | null | false;
  /** `null` : non concerné ou non renseigné. */
  copropriete: Copropriete | null;
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
  /** Longueur de défilement de l'accueil, en hauteurs d'écran (5 par défaut ; plus pour une vidéo longue). */
  hauteurDefilement?: number;

  /** Dossier public/biens/<sequence>/sequence produit par `npm run video`. */
  sequence: string | null;

  /** Prix en euros, honoraires inclus le cas échéant. */
  prix: number | null;

  /** Présentation éditoriale ; absente sur le bien de démonstration. */
  description?: {
    /** Une ou deux phrases d'émotion. */
    courte: string;
    /** Paragraphes de la description complète. */
    complete: string[];
  };
  caracteristiques?: Caracteristiques;
  photos?: Photo[];
  diagnostic?: Diagnostic;
  mentions?: Mentions;

  seo: {
    titre: string;
    description: string;
  };

  /** Lien de l'annonce sur brozzu.fr (balise canonique, évite le contenu dupliqué). */
  annonceUrl?: string | null;
}
