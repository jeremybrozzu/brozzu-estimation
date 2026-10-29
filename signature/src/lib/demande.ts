import { z } from "zod";

/**
 * Fiche acquéreur : schéma unique, utilisé par le formulaire (navigateur)
 * et par l'API (serveur). Seuls prénom, nom, e-mail et téléphone sont obligatoires,
 * ainsi que le consentement au traitement de la demande.
 */

const texte = (max = 200) => z.string().trim().max(max, `${max} caractères maximum`);
const optionnel = (max = 200) => texte(max).optional().or(z.literal(""));
const choix = <T extends readonly [string, ...string[]]>(valeurs: T) => z.enum(valeurs).optional().or(z.literal(""));
const montant = z
  .string()
  .trim()
  .regex(/^\d[\d\s ]*$/, "Indiquez un montant en euros, sans décimale")
  .optional()
  .or(z.literal(""));

export const TYPES_RECHERCHE = ["Maison", "Appartement", "Terrain", "Maison ou appartement", "Autre"] as const;
export const CHAMBRES = ["1", "2", "3", "4", "5 ou plus", "Sans préférence"] as const;
export const CRITERES = [
  "Jardin", "Terrasse", "Balcon", "Garage", "Stationnement", "Piscine", "Plain-pied", "Ascenseur", "Aucuns travaux", "Autre",
] as const;
export const FINANCEMENT = ["Oui, avec une banque", "Oui, avec un courtier", "Non, pas encore"] as const;
export const OBJECTIFS = ["Résidence principale", "Résidence secondaire", "Investissement locatif", "Autre"] as const;
export const DELAIS = ["Immédiatement", "Dans 3 à 6 mois", "Dans 6 à 12 mois", "Je découvre le marché"] as const;
const OUI_NON = ["oui", "non"] as const;

/** Téléphone français (06 12 34 56 78, +33 6…) ou international (+…). */
const TELEPHONE = /^(?:(?:\+33|0033|0)[1-9]\d{8}|\+(?!33)\d{8,15})$/;

export const demandeSchema = z
  .object({
    // Étape 1 — Faisons connaissance
    prenom: texte(80).min(1, "Indiquez votre prénom"),
    nom: texte(80).min(1, "Indiquez votre nom"),
    dateNaissance: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => {
        if (!v) return true;
        const d = new Date(v);
        const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
        return !Number.isNaN(d.getTime()) && age >= 18 && age <= 110;
      }, "Vérifiez la date de naissance"),
    adresse: optionnel(200),
    codePostal: z.string().trim().regex(/^\d{5}$/, "Code postal à 5 chiffres").optional().or(z.literal("")),
    ville: optionnel(100),
    email: z.string().trim().min(1, "Indiquez votre adresse e-mail").pipe(z.email("Adresse e-mail invalide")),
    telephone: z
      .string()
      .trim()
      .min(1, "Indiquez votre numéro de téléphone")
      .refine((v) => TELEPHONE.test(v.replace(/[\s.\-()]/g, "")), "Numéro de téléphone invalide"),

    // Étape 2 — Votre recherche immobilière
    typeRecherche: choix(TYPES_RECHERCHE),
    communes: z.array(texte(80)).max(20, "20 communes maximum"),
    quartiers: optionnel(1000),
    chambres: choix(CHAMBRES),
    surfaceMin: z.string().trim().regex(/^\d{1,5}$/, "Indiquez une surface en m²").optional().or(z.literal("")),
    criteres: z.array(z.enum(CRITERES)),
    critereAutre: optionnel(200),

    // Étape 3 — Votre financement
    budgetMax: montant,
    apport: montant,
    financementEtudie: choix(FINANCEMENT),
    courtier: choix(OUI_NON),
    consentementCourtier: z.boolean(),

    // Étape 4 — Parlons de votre projet
    objectif: choix(OBJECTIFS),
    delai: choix(DELAIS),
    bienAVendre: choix(OUI_NON),
    venteCommune: optionnel(100),
    venteType: choix(["Maison", "Appartement"] as const),
    venteDejaEnVente: choix(OUI_NON),
    venteEstimation: choix(OUI_NON),

    // Validation
    consentementTraitement: z.boolean().refine((v) => v, "Votre accord est nécessaire pour traiter la demande"),
    choix: z.enum(["creneau", "rappel"]),
    creneau: z.object({ debut: z.iso.datetime({ offset: true }), fin: z.iso.datetime({ offset: true }) }).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.courtier === "oui" && !d.consentementCourtier) {
      ctx.addIssue({
        code: "custom",
        path: ["consentementCourtier"],
        message: "Cochez cette case pour être mis en relation avec le courtier, ou répondez « Non ».",
      });
    }
    if (d.choix === "creneau" && !d.creneau) {
      ctx.addIssue({ code: "custom", path: ["creneau"], message: "Choisissez un créneau de visite" });
    }
  });

export type Demande = z.infer<typeof demandeSchema>;

/** Corps envoyé à l'API : la fiche, le bien concerné et une clé anti-double envoi. */
export const envoiSchema = z.object({
  bien: z.string().regex(/^[a-z0-9-]+$/),
  cleEnvoi: z.uuid(),
  /** Champ piège invisible : rempli uniquement par les robots. */
  siteWeb: z.string().max(0).optional(),
  demande: demandeSchema,
});

export type Envoi = z.infer<typeof envoiSchema>;

export const valeursInitiales: Demande = {
  prenom: "", nom: "", dateNaissance: "", adresse: "", codePostal: "", ville: "", email: "", telephone: "",
  typeRecherche: "", communes: [], quartiers: "", chambres: "", surfaceMin: "", criteres: [], critereAutre: "",
  budgetMax: "", apport: "", financementEtudie: "", courtier: "", consentementCourtier: false,
  objectif: "", delai: "", bienAVendre: "", venteCommune: "", venteType: "", venteDejaEnVente: "", venteEstimation: "",
  consentementTraitement: false, choix: "rappel", creneau: undefined,
};

/** Champs validés à chaque étape, avant de passer à la suivante. */
export const CHAMPS_ETAPE: (keyof Demande)[][] = [
  ["prenom", "nom", "dateNaissance", "adresse", "codePostal", "ville", "email", "telephone"],
  ["typeRecherche", "communes", "quartiers", "chambres", "surfaceMin", "criteres", "critereAutre"],
  ["budgetMax", "apport", "financementEtudie", "courtier", "consentementCourtier"],
  ["objectif", "delai", "bienAVendre", "venteCommune", "venteType", "venteDejaEnVente", "venteEstimation"],
];
