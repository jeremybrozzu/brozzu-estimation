import type { Bien } from "../types";

/**
 * Appartement vue port — Port-de-Bouc (référence V20000033).
 * Sources : vidéo et photos fournies par l'agence, fiche de l'annonce brozzu.fr.
 * Honoraires : mention retirée à la demande de l'agence.
 * Non disponible : date du DPE (non affichée). Copropriété : seules les charges sont communiquées.
 * Non renseignés dans l'annonce : étage exact (« 5 étage(s) » ambigu), surface Carrez (24 m² incohérent).
 */
export const appartementVuePortPortDeBouc: Bien = {
  slug: "appartement-vue-port-port-de-bouc",
  publie: true,

  titre: "Appartement vue port",
  typeBien: "Appartement",
  commune: "Port-de-Bouc",
  secteur: null,
  codePostal: "13110",
  accroche: "Un appartement neuf, une terrasse plein sud et le port de plaisance pour horizon.",
  hauteurDefilement: 7,
  chapitres: [
    { debut: 0.14, fin: 0.38, surtitre: "Le séjour", texte: "Vingt-quatre mètres carrés baignés de lumière." },
    { debut: 0.44, fin: 0.62, surtitre: "La terrasse", texte: "Exposée au sud, dans le prolongement du séjour." },
    { debut: 0.66, fin: 0.88, surtitre: "La vue", texte: "Le port de plaisance pour horizon." },
  ],

  sequence: "appartement-vue-port-port-de-bouc",
  prix: 212000,

  description: {
    courte: "Une terrasse plein sud face au port de plaisance, dans une résidence neuve.",
    complete: [
      "À Port-de-Bouc, cet appartement de 3 pièces construit en 2025 offre 60 m² au sein de la résidence Villa Marina, avec ascenseur, interphone et accès pour les personnes à mobilité réduite.",
      "Le séjour de 24 m² s'ouvre par de larges baies vitrées sur une terrasse exposée au sud, avec vue sur le port.",
      "Deux chambres lumineuses, dont l'une donne sur la terrasse, une salle d'eau et une place de stationnement en sous-sol complètent l'ensemble.",
    ],
  },

  caracteristiques: {
    surfaceHabitable: 60,
    surfaceTerrain: null,
    pieces: 3,
    chambres: 2,
    sallesDeBains: null,
    sallesEau: 1,
    anneeConstruction: 2025,
    chauffage: "Central",
    stationnement: "1 place en sous-sol",
    exposition: "Sud",
    taxeFonciere: null,
    prestations: ["Terrasse", "Vue sur le port", "Stationnement en sous-sol", "Ascenseur", "Interphone", "Accès personnes à mobilité réduite"],
  },

  photos: [
    { fichier: "terrasse-vue-port", alt: "La terrasse couverte, ouverte sur le port de plaisance", legende: "La terrasse et la vue", largeur: 1600, hauteur: 1200 },
    { fichier: "sejour", alt: "Séjour lumineux avec baie vitrée sur la terrasse", legende: "Le séjour", largeur: 1600, hauteur: 1200 },
    { fichier: "sejour-lumiere", alt: "Le séjour baigné de lumière, baies vitrées à gauche", legende: "Le séjour", largeur: 1600, hauteur: 1200 },
    { fichier: "piece-de-vie", alt: "Pièce de vie avec l'emplacement de la cuisine et l'accès aux chambres", legende: "La pièce de vie", largeur: 1600, hauteur: 1200 },
    { fichier: "chambre-vue-port", alt: "Chambre avec fenêtre donnant sur le port", legende: "Une chambre", largeur: 1600, hauteur: 1200 },
    { fichier: "chambre-terrasse", alt: "Chambre avec porte-fenêtre ouvrant sur la terrasse", legende: "La seconde chambre", largeur: 1600, hauteur: 1200 },
    { fichier: "entree-residence", alt: "Portail en fer forgé de la résidence Villa Marina", legende: "La résidence", largeur: 1600, hauteur: 1200 },
    { fichier: "quartier", alt: "La place arborée et ses terrasses au pied de la résidence", legende: "Le quartier", largeur: 1600, hauteur: 1200 },
  ],

  diagnostic: {
    classeEnergie: "B",
    consommation: 52,
    consommationFinale: 49,
    classeGes: "B",
    emissions: 10,
    depensesMin: 286,
    depensesMax: 388,
    anneesReferencePrix: "2021, 2022 et 2023",
    date: null,
  },

  mentions: {
    reference: "V20000033",
    honoraires: false,
    copropriete: {
      lots: null,
      chargesAnnuelles: null,
      charges:
        "180 € par mois, comprenant les provisions pour le chauffage, l'eau chaude et l'eau froide, avec régularisation annuelle.",
      procedure: null,
    },
  },

  seo: {
    titre: "Appartement 3 pièces vue port à Port-de-Bouc — BROZZU",
    description:
      "Appartement neuf de 60 m², 2 chambres, terrasse exposée sud avec vue sur le port de plaisance et stationnement en sous-sol à Port-de-Bouc (13110). Découvrez-le en immersion avec BROZZU – L'Atelier Immo.",
  },
  conseiller: "jeremy-brozzu",
  annonceUrl: null,
};
