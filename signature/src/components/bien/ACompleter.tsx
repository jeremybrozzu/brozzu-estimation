/**
 * Marque une information obligatoire absente de la fiche du bien.
 * Volontairement visible : elle doit être renseignée avant toute mise en ligne.
 */
export function ACompleter({ quoi }: { quoi?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-cuivre/60 px-2.5 py-0.5 align-middle font-sans text-[0.7rem] font-medium tracking-wide text-cuivre">
      À compléter{quoi ? ` : ${quoi}` : ""}
    </span>
  );
}
