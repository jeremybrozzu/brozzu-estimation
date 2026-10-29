import { connection } from "next/server";
import { creneauxDemo } from "@/lib/creneaux";
import { creneauxDemandes } from "@/lib/stockage";
import { getBien } from "@/content/biens";

/** Créneaux proposés pour un bien. `demo: true` tant que l'agenda n'est pas connecté. */
export async function GET(request: Request) {
  await connection();
  const bien = new URL(request.url).searchParams.get("bien") ?? "";
  if (!getBien(bien)) return Response.json({ erreur: "Bien introuvable." }, { status: 404 });

  const pris = await creneauxDemandes(bien);
  const jours = creneauxDemo(bien)
    .map((j) => ({ ...j, creneaux: j.creneaux.filter((c) => !pris.has(c.debut)) }))
    .filter((j) => j.creneaux.length > 0);
  return Response.json({ demo: true, jours });
}
