import type { Bien } from "../types";

/**
 * Bien de démonstration : sert à tester l'accueil immersif en attendant
 * la vidéo et l'annonce réelles. Toutes les valeurs factuelles sont à `null`.
 */
export const demo: Bien = {
  slug: "demo",
  demo: true,
  publie: true,

  titre: "Signature Collection",
  typeBien: "Maison",
  commune: "Martigues",
  secteur: null,
  codePostal: null,
  accroche: "Certains lieux ne se visitent pas. Ils se ressentent.",
  chapitres: [
    { debut: 0.12, fin: 0.34, surtitre: "Le seuil", texte: "Une porte s'ouvre, et la lumière fait le reste." },
    { debut: 0.42, fin: 0.64, surtitre: "La pièce de vie", texte: "Des volumes pensés pour se retrouver." },
    { debut: 0.72, fin: 0.92, surtitre: "L'extérieur", texte: "Le dehors comme un prolongement naturel." },
  ],

  sequence: "demo",
  prix: null,

  seo: {
    titre: "Signature Collection — BROZZU L'Atelier Immo",
    description: "Découvrez les biens d'exception de BROZZU – L'Atelier Immo à travers une expérience immersive.",
  },
  annonceUrl: null,
};
