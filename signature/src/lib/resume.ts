import type { Demande } from "./demande";
import { formatHeure, formatJour } from "./creneaux";

/**
 * Mise en forme de la fiche acquéreur, commune à l'e-mail envoyé par le serveur
 * et à l'envoi direct depuis le navigateur (hébergement statique, FormSubmit).
 */

const euros = (s?: string) => (s ? `${Number(s.replace(/\D/g, "")).toLocaleString("fr-FR")} €` : "");
const ouiNon = (s?: string) => (s === "oui" ? "Oui" : s === "non" ? "Non" : "");

export function suite(c: Demande) {
  if (c.choix === "agenda") return "Redirigé vers votre agenda Google pour réserver son créneau";
  if (c.choix === "creneau" && c.creneau)
    return `Créneau demandé : ${formatJour(c.creneau.debut)} à ${formatHeure(c.creneau.debut)} (à confirmer)`;
  return "Souhaite être rappelé";
}

export function sections(c: Demande): [string, [string, string][]][] {
  return [
    ["Contact", [
      ["Nom", `${c.prenom} ${c.nom}`],
      ["Téléphone", c.telephone],
      ["E-mail", c.email],
      ["Date de naissance", c.dateNaissance ? new Date(c.dateNaissance).toLocaleDateString("fr-FR") : ""],
      ["Adresse", `${c.adresse}, ${c.codePostal} ${c.ville}`],
    ]],
    ["Recherche", [
      ["Type de bien", c.typeRecherche ?? ""],
      ["Communes", c.communes.join(", ")],
      ["Quartiers", c.quartiers ?? ""],
      ["Chambres", c.chambres ?? ""],
      ["Surface minimum", c.surfaceMin ? `${c.surfaceMin} m²` : ""],
      ["Critères", c.criteres.map((x) => (x === "Autre" && c.critereAutre ? `Autre (${c.critereAutre})` : x)).join(", ")],
    ]],
    ["Financement", [
      ["Budget maximum", euros(c.budgetMax)],
      ["Apport", euros(c.apport)],
      ["Financement étudié", c.financementEtudie ?? ""],
      ["Courtier partenaire", c.courtier === "oui" ? "Oui — accord donné pour transmettre ses coordonnées (sans données financières)" : ouiNon(c.courtier)],
    ]],
    ["Projet", [
      ["Objectif", c.objectif ?? ""],
      ["Délai", c.delai ?? ""],
      ["Bien à vendre", ouiNon(c.bienAVendre)],
      ...(c.bienAVendre === "oui"
        ? ([
            ["Commune du bien", c.venteCommune ?? ""],
            ["Type du bien à vendre", c.venteType ?? ""],
            ["Déjà en vente", ouiNon(c.venteDejaEnVente)],
            ["Estimation gratuite", ouiNon(c.venteEstimation)],
          ] as [string, string][])
        : []),
    ]],
  ];
}
