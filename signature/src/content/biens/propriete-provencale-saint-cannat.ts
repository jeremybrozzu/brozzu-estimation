import type { Bien } from "../types";

/**
 * Propriété provençale — Saint-Cannat.
 * Sources : vidéo fournie par l'agence et intitulé de l'annonce brozzu.fr
 * (300 m², terrain de 5 000 m²). Prix, DPE et mentions : à reprendre de l'annonce.
 */
export const proprieteProvencaleSaintCannat: Bien = {
  slug: "propriete-provencale-saint-cannat",
  publie: true,

  titre: "Propriété provençale",
  typeBien: "Maison",
  commune: "Saint-Cannat",
  secteur: null,
  codePostal: null,
  accroche: "Une maison ouverte sur ses pins, sa piscine et la lumière de Provence.",
  chapitres: [
    { debut: 0.12, fin: 0.32, surtitre: "Le séjour", texte: "De larges baies tournées vers le jardin." },
    { debut: 0.4, fin: 0.6, surtitre: "La terrasse", texte: "Un prolongement naturel de la maison." },
    { debut: 0.7, fin: 0.92, surtitre: "Le jardin", texte: "Une piscine, des pins et 5 000 m² de terrain." },
  ],

  sequence: "propriete-provencale-saint-cannat",
  prix: null,

  seo: {
    titre: "Propriété provençale de 300 m² à Saint-Cannat — BROZZU L'Atelier Immo",
    description:
      "Propriété provençale de 300 m² sur un terrain de 5 000 m² avec piscine à Saint-Cannat. Découvrez-la en immersion avec BROZZU – L'Atelier Immo.",
  },
  annonceUrl: "https://www.brozzu.fr/vente/50-st-cannat/maison/8-propriete-provencale-300-m-terrain-5-000-m-saint-cannat",
};
