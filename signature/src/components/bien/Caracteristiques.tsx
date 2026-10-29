import type { Bien } from "@/content/types";
import { formatEuros, formatNombre, formatSurface } from "@/lib/format";
import { Icone, iconePrestation, type NomIcone } from "./Icones";

interface Ligne {
  icone: NomIcone;
  label: string;
  valeur: string;
}

/** Fiche technique : seules les informations renseignées sont affichées. */
export function Caracteristiques({ bien }: { bien: Bien }) {
  const c = bien.caracteristiques;
  if (!c) return null;

  const lignes: (Ligne | false | "" | null | undefined)[] = [
    { icone: "maison", label: "Type de bien", valeur: bien.typeBien },
    bien.prix !== null && { icone: "prix", label: "Prix", valeur: formatEuros(bien.prix) },
    c.surfaceHabitable != null && { icone: "surface", label: "Surface", valeur: formatSurface(c.surfaceHabitable) },
    c.surfaceTerrain != null && { icone: "terrain", label: "Terrain", valeur: formatSurface(c.surfaceTerrain) },
    c.pieces != null && { icone: "pieces", label: "Pièces", valeur: formatNombre(c.pieces) },
    c.chambres != null && { icone: "chambre", label: "Chambres", valeur: formatNombre(c.chambres) },
    c.sallesDeBains != null && { icone: "bain", label: c.sallesDeBains > 1 ? "Salles de bains" : "Salle de bains", valeur: formatNombre(c.sallesDeBains) },
    c.sallesEau != null && { icone: "douche", label: c.sallesEau > 1 ? "Salles d'eau" : "Salle d'eau", valeur: formatNombre(c.sallesEau) },
    c.etage && { icone: "etage", label: "Étage", valeur: c.ascenseur ? `${c.etage}, avec ascenseur` : c.etage },
    c.stationnement && { icone: "stationnement", label: "Stationnement", valeur: c.stationnement },
    c.anneeConstruction != null && { icone: "calendrier", label: "Construction", valeur: String(c.anneeConstruction) },
    c.chauffage && { icone: "chauffage", label: "Chauffage", valeur: c.chauffage },
    c.climatisation && { icone: "climatisation", label: "Climatisation", valeur: c.climatisation },
    c.exposition && { icone: "exposition", label: "Exposition", valeur: c.exposition },
    c.cuisine && { icone: "cuisine", label: "Cuisine", valeur: c.cuisine },
    c.taxeFonciere != null && { icone: "taxe", label: "Taxe foncière", valeur: `${formatEuros(c.taxeFonciere)} / an` },
  ];

  return (
    <section aria-labelledby="titre-caracteristiques" className="bg-ivoire text-anthracite">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="flex items-baseline justify-between gap-6 border-b border-champagne pb-6">
          <h2 id="titre-caracteristiques" className="font-serif text-4xl sm:text-5xl">Caractéristiques</h2>
          <p className="surtitre hidden text-[0.6rem] text-bronze sm:block">Le bien en détail</p>
        </div>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
          {lignes.filter((l): l is Ligne => Boolean(l)).map((l) => (
            <div key={l.label} className="flex items-start gap-4 border-b border-champagne/70 py-6 sm:pr-8">
              <Icone nom={l.icone} className="mt-0.5 shrink-0 text-bronze" />
              <div className="flex min-w-0 flex-col-reverse gap-1">
                <dt className="surtitre text-[0.58rem] text-anthracite/55">{l.label}</dt>
                <dd className="font-serif text-2xl leading-tight">{l.valeur}</dd>
              </div>
            </div>
          ))}
        </dl>

        {c.prestations.length > 0 && (
          <div className="mt-14">
            <h3 className="surtitre text-bronze">Prestations</h3>
            <ul className="mt-6 flex flex-wrap gap-3">
              {c.prestations.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 rounded-full border border-champagne bg-white/40 py-2.5 pl-3.5 pr-5 text-sm"
                >
                  <Icone nom={iconePrestation(p)} className="h-5 w-5 text-bronze" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
