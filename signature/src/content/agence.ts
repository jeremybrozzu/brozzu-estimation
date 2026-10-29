/**
 * Réglages de l'agence pour les visites.
 * Phase 5 : ces plages seront croisées avec les disponibilités réelles du Google Agenda.
 */
export const agence = {
  nom: "BROZZU – L'Atelier Immo",
  site: "https://www.brozzu.fr",
  fuseau: "Europe/Paris",
  visite: {
    /** Durée d'une visite, en minutes. */
    dureeMinutes: 60,
    /** Délai minimum entre la demande et la visite, en heures. */
    delaiMinimumHeures: 24,
    /** Nombre de jours proposés à l'acquéreur. */
    joursProposes: 14,
    /** Plages autorisées par jour de la semaine (0 = dimanche). */
    plages: {
      1: [["09:30", "12:00"], ["14:00", "18:30"]],
      2: [["09:30", "12:00"], ["14:00", "18:30"]],
      3: [["09:30", "12:00"], ["14:00", "18:30"]],
      4: [["09:30", "12:00"], ["14:00", "18:30"]],
      5: [["09:30", "12:00"], ["14:00", "18:30"]],
      6: [["09:30", "12:30"]],
    } as Record<number, [string, string][]>,
  },
} as const;
