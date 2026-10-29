import { envoiSchema } from "@/lib/demande";
import { creneauxDemo } from "@/lib/creneaux";
import { creneauxDemandes, enregistrerDemande } from "@/lib/stockage";
import { getBien } from "@/content/biens";

/** Réception d'une fiche acquéreur (demande de créneau ou de rappel). */
export async function POST(request: Request) {
  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "Requête illisible." }, { status: 400 });
  }

  const resultat = envoiSchema.safeParse(corps);
  if (!resultat.success) {
    return Response.json(
      { erreur: "Certaines informations sont invalides.", details: resultat.error.issues.map((i) => i.path.join(".")) },
      { status: 422 },
    );
  }
  const envoi = resultat.data;

  // Robot : on répond comme si tout allait bien, sans rien enregistrer.
  if (envoi.siteWeb) return Response.json({ reference: "BRZ-0000-0000" });

  if (!getBien(envoi.bien)) return Response.json({ erreur: "Bien introuvable." }, { status: 404 });

  // Le créneau doit faire partie de ceux proposés et ne pas être déjà demandé.
  const creneau = envoi.demande.choix === "creneau" ? envoi.demande.creneau : undefined;
  if (creneau) {
    const proposes = creneauxDemo(envoi.bien).flatMap((j) => j.creneaux.map((c) => c.debut));
    const pris = await creneauxDemandes(envoi.bien);
    if (!proposes.includes(creneau.debut) || pris.has(creneau.debut)) {
      return Response.json(
        { erreur: "Ce créneau n'est plus disponible. Choisissez-en un autre.", code: "creneau_indisponible" },
        { status: 409 },
      );
    }
  }

  const { demande } = await enregistrerDemande(envoi);
  // Phase 5 : notification e-mail de l'agence et, pour un créneau, demande de validation.
  return Response.json({ reference: demande.reference, statut: demande.statut });
}
