import type { Bien, ClasseEnergie } from "@/content/types";
import { formatDate, formatEuros, formatNombre } from "@/lib/format";
import { ACompleter } from "./ACompleter";

const CLASSES: ClasseEnergie[] = ["A", "B", "C", "D", "E", "F", "G"];

/** Couleurs de l'étiquette réglementaire (arrêté du 31 mars 2021). */
const COULEURS_DPE: Record<ClasseEnergie, string> = {
  A: "#009c6d", B: "#52b153", C: "#78bd76", D: "#f4e70f", E: "#f0b50f", F: "#eb8235", G: "#d7221f",
};
const COULEURS_GES: Record<ClasseEnergie, string> = {
  A: "#a4dbf8", B: "#8cb4d3", C: "#7792b1", D: "#5f6f8e", E: "#4a4d6c", F: "#2f2e4a", G: "#1e1a2d",
};
const TEXTE_CLAIR = new Set(["D", "E", "F", "G"]);

function Echelle({
  titre,
  classe,
  couleurs,
  haut,
  bas,
  valeurs,
  ges,
}: {
  titre: string;
  classe: ClasseEnergie | null;
  couleurs: Record<ClasseEnergie, string>;
  haut: string;
  bas: string;
  valeurs: React.ReactNode;
  ges?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="surtitre text-[0.6rem] text-bronze">{titre}</figcaption>
      <p className="mt-5 text-[0.7rem] font-medium" style={{ color: ges ? "#5f86a8" : "#009c6d" }}>
        {haut}
      </p>
      <ol className="mt-2 flex flex-col gap-1.5" aria-label={titre}>
        {CLASSES.map((c, i) => {
          const active = c === classe;
          const clair = ges && TEXTE_CLAIR.has(c);
          return (
            <li key={c} className="flex items-center gap-3" aria-current={active ? "true" : undefined}>
              <span
                className={`flex items-center font-sans font-semibold ${active ? "h-11 text-2xl ring-2 ring-anthracite ring-offset-2 ring-offset-ivoire" : "h-7 text-sm"} ${clair ? "text-white" : "text-noir/85"}`}
                style={{
                  width: `${34 + i * 9}%`,
                  background: couleurs[c],
                  paddingLeft: "0.65rem",
                  clipPath: ges ? undefined : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                  borderRadius: ges ? "0 999px 999px 0" : undefined,
                }}
              >
                {c}
              </span>
              {active && <span className="flex min-w-0 flex-col text-sm leading-tight">{valeurs}</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[0.7rem] font-medium" style={{ color: ges ? "#2f2e4a" : "#d7221f" }}>
        {bas}
      </p>
    </figure>
  );
}

/** Performance énergétique et informations légales. */
export function Diagnostic({ bien }: { bien: Bien }) {
  const d = bien.diagnostic;
  const m = bien.mentions;

  return (
    <section aria-labelledby="titre-dpe" className="border-t border-champagne bg-[#ede6da] text-anthracite">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="titre-dpe" className="font-serif text-4xl sm:text-5xl">Performance énergétique</h2>
            {d ? (
              <>
                <div className="mt-12 grid gap-12 sm:grid-cols-2">
                  <Echelle
                    titre="Diagnostic de performance énergétique"
                    classe={d.classeEnergie}
                    couleurs={COULEURS_DPE}
                    haut="logement extrêmement performant"
                    bas="logement extrêmement peu performant"
                    valeurs={
                      <>
                        <strong className="font-serif text-2xl font-medium tabular-nums">{d.consommation ?? "—"}</strong>
                        <span className="text-[0.68rem] text-anthracite/70">kWh/m²/an</span>
                      </>
                    }
                  />
                  <Echelle
                    titre="Émissions de gaz à effet de serre"
                    classe={d.classeGes}
                    couleurs={COULEURS_GES}
                    haut="peu d'émissions de CO₂"
                    bas="émissions de CO₂ très importantes"
                    ges
                    valeurs={
                      <>
                        <strong className="font-serif text-2xl font-medium tabular-nums">{d.emissions ?? "—"}</strong>
                        <span className="text-[0.68rem] text-anthracite/70">kg CO₂/m²/an</span>
                      </>
                    }
                  />
                </div>

                <dl className="mt-12 grid gap-x-8 gap-y-5 border-t border-champagne pt-8 text-sm sm:grid-cols-2">
                  {d.consommation != null && (
                    <div>
                      <dt className="text-anthracite/60">Consommation (énergie primaire)</dt>
                      <dd className="mt-1 font-medium">{formatNombre(d.consommation)} kWh/m²/an</dd>
                    </div>
                  )}
                  {d.consommationFinale != null && (
                    <div>
                      <dt className="text-anthracite/60">Consommation (énergie finale)</dt>
                      <dd className="mt-1 font-medium">{formatNombre(d.consommationFinale)} kWh/m²/an</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-anthracite/60">Estimation des dépenses annuelles d&apos;énergie</dt>
                    <dd className="mt-1 leading-7">
                      {d.depensesMin != null && d.depensesMax != null ? (
                        <>
                          Montant estimé des dépenses annuelles d&apos;énergie pour un usage standard : entre{" "}
                          <strong>{formatEuros(d.depensesMin)}</strong> et <strong>{formatEuros(d.depensesMax)}</strong> par an.
                        </>
                      ) : (
                        <ACompleter quoi="fourchette de dépenses" />
                      )}{" "}
                      {d.anneesReferencePrix ? (
                        <>Prix moyens des énergies indexés sur les années {d.anneesReferencePrix} (abonnements compris).</>
                      ) : (
                        <ACompleter quoi="années de référence des prix" />
                      )}
                    </dd>
                  </div>
                  {d.date && (
                    <div>
                      <dt className="text-anthracite/60">Date du diagnostic</dt>
                      <dd className="mt-1 font-medium">{formatDate(d.date)}</dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="mt-8">
                <ACompleter quoi="diagnostic de performance énergétique" />
              </p>
            )}
          </div>

          <aside aria-labelledby="titre-mentions" className="lg:col-span-5">
            <h2 id="titre-mentions" className="surtitre text-bronze">Informations légales</h2>
            <dl className="mt-6 flex flex-col divide-y divide-champagne border-y border-champagne text-sm">
              {bien.prix !== null && (
                <div className="py-5">
                  <dt className="text-anthracite/60">Prix</dt>
                  <dd className="mt-1 font-serif text-2xl">{formatEuros(bien.prix)}</dd>
                </div>
              )}
              {m?.honoraires !== false && (
                <div className="py-5">
                <dt className="text-anthracite/60">Honoraires</dt>
                <dd className="mt-1 leading-6">{m?.honoraires ?? <ACompleter />}</dd>
              </div>
              )}
              {!m?.copropriete && bien.typeBien === "Appartement" && (
                <div className="py-5">
                  <dt className="text-anthracite/60">Copropriété</dt>
                  <dd className="mt-1 leading-6">
                    <ACompleter quoi="nombre de lots, charges annuelles, procédure en cours" />
                  </dd>
                </div>
              )}
              {m?.copropriete && (
                <div className="py-5">
                  <dt className="text-anthracite/60">Copropriété</dt>
                  <dd className="mt-1 flex flex-col gap-1.5 leading-6">
                    <span>
                      Bien soumis au statut de la copropriété
                      {m.copropriete.lots != null && <>, {formatNombre(m.copropriete.lots)} lots</>}.
                    </span>
                    {m.copropriete.chargesAnnuelles != null && (
                      <span>Charges courantes : {formatEuros(m.copropriete.chargesAnnuelles)} par an.</span>
                    )}
                    {m.copropriete.charges && <span>Charges : {m.copropriete.charges}</span>}
                    {m.copropriete.procedure && <span>{m.copropriete.procedure}</span>}
                  </dd>
                </div>
              )}
              {m?.reference && (
                <div className="py-5">
                  <dt className="text-anthracite/60">Référence de l&apos;annonce</dt>
                  <dd className="mt-1">{m.reference}</dd>
                </div>
              )}
              <div className="py-5">
                <dt className="text-anthracite/60">Risques</dt>
                <dd className="mt-1 leading-6">
                  Les informations sur les risques auxquels ce bien est exposé sont disponibles sur le site Géorisques :{" "}
                  <a
                    href="https://www.georisques.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cuivre underline decoration-champagne underline-offset-4 hover:decoration-cuivre"
                  >
                    www.georisques.gouv.fr
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-5 text-anthracite/60">
              Annonce proposée par BROZZU – L&apos;Atelier Immo.
              {bien.annonceUrl && (
                <>
                  {" "}
                  <a href={bien.annonceUrl} className="underline decoration-champagne underline-offset-4 hover:text-cuivre">
                    Voir l&apos;annonce sur brozzu.fr
                  </a>
                </>
              )}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
