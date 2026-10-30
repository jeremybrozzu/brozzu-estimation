/**
 * Profils des conseillers BROZZU.
 * Chaque bien désigne son conseiller : ses demandes arrivent sur son e-mail,
 * le bouton « Contactez un agent » affiche son numéro et, s'il a un agenda de
 * prise de rendez-vous, l'acquéreur y réserve directement son créneau.
 */

export interface Conseiller {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: { affiche: string; lien: string };
  /** Page de prise de rendez-vous Google Agenda (gère disponibilités et doubles réservations). */
  agenda?: string;
}

export const conseillers: Record<string, Conseiller> = {
  "jeremy-brozzu": {
    id: "jeremy-brozzu",
    prenom: "Jérémy",
    nom: "BROZZU",
    email: "jeremy@brozzu.fr",
    telephone: { affiche: "06 28 51 44 16", lien: "tel:+33628514416" },
    agenda: "https://calendar.app.google/EkGCBt5LcgKBD1Fk6",
  },
};

export function getConseiller(id: string | undefined | null): Conseiller | undefined {
  return id ? conseillers[id] : undefined;
}

export const nomComplet = (c: Conseiller) => `${c.prenom} ${c.nom}`;
