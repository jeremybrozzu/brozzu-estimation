"use client";

import { useState } from "react";
import { formatHeure, formatJourCourt, type Creneau, type JourCreneaux } from "@/lib/creneaux";

/** Sélection d'un jour puis d'un horaire. */
export function ChoixCreneau({
  jours,
  demo,
  choisi,
  onChoisir,
}: {
  jours: JourCreneaux[];
  demo: boolean;
  choisi?: Creneau;
  onChoisir: (c: Creneau) => void;
}) {
  const [jour, setJour] = useState(() => jours.find((j) => j.creneaux.some((c) => c.debut === choisi?.debut))?.date ?? jours[0]?.date);
  const actif = jours.find((j) => j.date === jour);

  if (jours.length === 0) {
    return <p className="text-sm text-anthracite/70">Aucun créneau n&apos;est disponible pour le moment. Choisissez plutôt d&apos;être rappelé.</p>;
  }

  return (
    <div>
      {demo && (
        <p className="mb-6 rounded-sm border border-dashed border-cuivre/50 bg-white/40 px-4 py-3 text-[0.8rem] leading-6 text-cuivre">
          Créneaux de démonstration : l&apos;agenda de l&apos;agence n&apos;est pas encore connecté. Votre demande sera
          enregistrée, mais l&apos;horaire devra être confirmé par l&apos;agence.
        </p>
      )}

      <fieldset>
        <legend className="text-[0.82rem] font-medium">Jour</legend>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
          {jours.map((j) => {
            const [nomJour, ...reste] = formatJourCourt(j.date).split(" ");
            const selection = j.date === jour;
            return (
              <button
                key={j.date}
                type="button"
                aria-pressed={selection}
                onClick={() => setJour(j.date)}
                className={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-sm border py-3 transition-colors ${
                  selection ? "border-anthracite bg-anthracite text-ivoire" : "border-anthracite/20 bg-white/50 hover:border-anthracite/50"
                }`}
              >
                <span className="surtitre text-[0.55rem] opacity-70">{nomJour.replace(".", "")}</span>
                <span className="mt-1 font-serif text-2xl leading-none">{reste[0]}</span>
                <span className="mt-1 text-[0.7rem] opacity-70">{reste.slice(1).join(" ").replace(".", "")}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {actif && (
        <fieldset className="mt-6">
          <legend className="text-[0.82rem] font-medium">Horaire · visite d&apos;environ une heure</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {actif.creneaux.map((c) => {
              const selection = choisi?.debut === c.debut;
              return (
                <button
                  key={c.debut}
                  type="button"
                  aria-pressed={selection}
                  onClick={() => onChoisir(c)}
                  className={`rounded-sm border py-3 text-sm tabular-nums transition-colors ${
                    selection ? "border-cuivre bg-cuivre text-ivoire" : "border-anthracite/20 bg-white/50 hover:border-anthracite/50"
                  }`}
                >
                  {formatHeure(c.debut)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
