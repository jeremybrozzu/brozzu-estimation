import type { Bien } from "@/content/types";
import { formatEuros, formatNombre } from "@/lib/format";
import { ACompleter } from "./ACompleter";

/** Introduction éditoriale : titre, prix, textes et chiffres clés. */
export function Presentation({ bien }: { bien: Bien }) {
  const c = bien.caracteristiques;
  const lieu = [bien.commune, bien.codePostal && `(${bien.codePostal})`].filter(Boolean).join(" ");
  const bains = (c?.sallesDeBains ?? 0) + (c?.sallesEau ?? 0);

  const chiffres = [
    c?.surfaceHabitable != null && { valeur: formatNombre(c.surfaceHabitable), unite: "m²", label: "Surface" },
    c?.surfaceTerrain != null && { valeur: formatNombre(c.surfaceTerrain), unite: "m²", label: "Terrain" },
    c?.pieces != null && { valeur: formatNombre(c.pieces), label: "Pièces" },
    c?.chambres != null && { valeur: formatNombre(c.chambres), label: "Chambres" },
    bains > 0 && { valeur: formatNombre(bains), label: "Salles de bains et d'eau" },
  ].filter((x): x is { valeur: string; unite?: string; label: string } => Boolean(x));

  return (
    <section id="presentation" aria-labelledby="titre-bien" className="bg-ivoire text-anthracite">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pb-28 sm:pt-40">
        <p className="surtitre text-bronze">
          {bien.typeBien} · {lieu}
          {bien.mentions?.reference && <> · Réf. {bien.mentions.reference}</>}
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="titre-bien" className="max-w-3xl font-serif text-5xl leading-[1.02] text-balance sm:text-7xl">
            {bien.titre}
          </h2>
          {bien.prix !== null && (
            <div className="lg:text-right">
              <p className="font-serif text-4xl text-cuivre sm:text-5xl">{formatEuros(bien.prix)}</p>
              {bien.mentions?.honoraires !== false && (
                <p className="mt-2 text-xs leading-5 text-anthracite/60">
                  {bien.mentions?.honoraires ?? <ACompleter quoi="honoraires" />}
                </p>
              )}
            </div>
          )}
        </div>

        {chiffres.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 border-y border-champagne sm:grid-cols-3 lg:grid-cols-5">
            {chiffres.map((ch, i) => (
              <div
                key={ch.label}
                className={`flex flex-col-reverse gap-1 py-7 pr-4 sm:px-6 ${i > 0 ? "lg:border-l lg:border-champagne" : "sm:pl-0"}`}
              >
                <dt className="surtitre text-[0.6rem] text-bronze">{ch.label}</dt>
                <dd className="font-serif text-4xl leading-none tabular-nums sm:text-5xl">
                  {ch.valeur}
                  {ch.unite && <span className="ml-1 text-xl text-anthracite/60">{ch.unite}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {bien.description && (
          <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <p className="font-serif text-3xl italic leading-snug text-anthracite text-balance lg:col-span-5">
              {bien.description.courte}
            </p>
            <div className="flex flex-col gap-5 text-[0.95rem] leading-8 text-anthracite/80 lg:col-span-7">
              {bien.description.complete.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
