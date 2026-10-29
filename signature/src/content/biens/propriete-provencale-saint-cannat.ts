import type { Bien } from "../types";

/**
 * Propriété provençale — Saint-Cannat (référence 4).
 * Sources : vidéo et photos fournies par l'agence, fiche de l'annonce brozzu.fr.
 * Non renseignés dans l'annonce : honoraires, dépenses annuelles d'énergie,
 * date du DPE, taxe foncière.
 */
export const proprieteProvencaleSaintCannat: Bien = {
  slug: "propriete-provencale-saint-cannat",
  publie: true,

  titre: "Propriété provençale",
  typeBien: "Maison",
  commune: "Saint-Cannat",
  secteur: null,
  codePostal: "13760",
  accroche: "Une maison ouverte sur ses pins, sa piscine et la lumière de Provence.",
  chapitres: [
    { debut: 0.12, fin: 0.32, surtitre: "Le séjour", texte: "De larges baies tournées vers le jardin." },
    { debut: 0.4, fin: 0.6, surtitre: "La terrasse", texte: "Un prolongement naturel de la maison." },
    { debut: 0.7, fin: 0.92, surtitre: "Le jardin", texte: "Une piscine, des pins et 5 000 m² de terrain." },
  ],

  sequence: "propriete-provencale-saint-cannat",
  prix: 1438000,

  description: {
    courte:
      "Sur 5 000 m² de terrain arboré, une maison exposée au sud qui vit au rythme de sa piscine et de ses terrasses.",
    complete: [
      "À Saint-Cannat, cette propriété construite en 2000 offre 322 m² au cœur d'un terrain arboré de 5 000 m², exposé au sud.",
      "Les pièces de vie s'ouvrent largement sur la terrasse et la piscine : une salle à manger sous poutres apparentes, un séjour avec cheminée et une vaste pièce sous charpente baignée de lumière. La cuisine, séparée, est équipée.",
      "Avec 11 pièces dont 9 chambres, une salle de bains et quatre salles d'eau, la maison accueille sans contrainte une grande famille et ses invités.",
    ],
  },

  caracteristiques: {
    surfaceHabitable: 322,
    surfaceTerrain: 5000,
    pieces: 11,
    chambres: 9,
    sallesDeBains: 1,
    sallesEau: 4,
    anneeConstruction: 2000,
    chauffage: "Individuel, chaudière au fioul",
    exposition: "Sud",
    cuisine: "Séparée et équipée",
    taxeFonciere: null,
    prestations: ["Piscine", "Terrasse", "Terrain arboré", "Vue sur le jardin"],
  },

  photos: [
    { fichier: "facade-piscine", alt: "La maison, sa piscine et ses paillotes sous un ciel bleu", legende: "La façade sud et la piscine", largeur: 1600, hauteur: 1200 },
    { fichier: "salle-a-manger", alt: "Salle à manger sous poutres, baies vitrées ouvertes sur la piscine", legende: "La salle à manger", largeur: 1600, hauteur: 1200 },
    { fichier: "sejour", alt: "Séjour avec cheminée, ouvert par une arche sur la véranda", legende: "Le séjour", largeur: 1600, hauteur: 1200 },
    { fichier: "piece-sous-charpente", alt: "Grande pièce sous charpente apparente, porte-fenêtre sur le jardin", legende: "La pièce sous charpente", largeur: 1600, hauteur: 1200 },
    { fichier: "cuisine", alt: "Cuisine équipée aux murs de pierre, porte ouverte sur le jardin", legende: "La cuisine", largeur: 1600, hauteur: 1200 },
    { fichier: "jardin-piscine", alt: "Le jardin arboré, la pelouse et la piscine devant la maison", legende: "Le jardin", largeur: 1600, hauteur: 1200 },
    { fichier: "piscine-terrasse", alt: "La piscine et sa plage en pierre, la maison en arrière-plan", legende: "La piscine", largeur: 1600, hauteur: 1200 },
  ],

  diagnostic: {
    classeEnergie: "C",
    consommation: 71,
    consommationFinale: 59,
    classeGes: "C",
    emissions: 15,
    depensesMin: null,
    depensesMax: null,
    anneesReferencePrix: null,
    date: null,
  },

  mentions: {
    reference: "4",
    honoraires: null,
    copropriete: null,
  },

  seo: {
    titre: "Propriété provençale de 322 m² avec piscine à Saint-Cannat — BROZZU",
    description:
      "Maison de 11 pièces et 9 chambres sur 5 000 m² de terrain arboré avec piscine à Saint-Cannat (13760). Découvrez-la en immersion avec BROZZU – L'Atelier Immo.",
  },
  annonceUrl: "https://www.brozzu.fr/vente/50-st-cannat/maison/8-propriete-provencale-300-m-terrain-5-000-m-saint-cannat",
};
