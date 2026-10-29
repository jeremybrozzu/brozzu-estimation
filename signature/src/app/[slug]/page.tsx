import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { biens, getBien } from "@/content/biens";
import { loadSequence } from "@/lib/sequence";
import { ImmersiveHero } from "@/components/immersive/ImmersiveHero";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitButton } from "@/components/VisitButton";

export function generateStaticParams() {
  return biens.filter((b) => b.publie).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const bien = getBien((await params).slug);
  if (!bien) return {};
  return {
    title: bien.seo.titre,
    description: bien.seo.description,
    // Le bien de démonstration ne doit jamais être indexé.
    robots: bien.demo ? { index: false, follow: false } : undefined,
    alternates: bien.annonceUrl ? { canonical: bien.annonceUrl } : undefined,
    openGraph: {
      title: bien.seo.titre,
      description: bien.seo.description,
      type: "website",
      locale: "fr_FR",
      siteName: "BROZZU – L'Atelier Immo",
      images: bien.sequence ? [`/biens/${bien.sequence}/sequence/poster.webp`] : undefined,
    },
  };
}

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function BienPage({ params }: PageProps<"/[slug]">) {
  const bien = getBien((await params).slug);
  if (!bien) notFound();
  const sequence = await loadSequence(bien.sequence);
  const lieu = [bien.commune, bien.secteur].filter(Boolean).join(" · ");

  return (
    <>
      <SiteHeader />
      <main id="top">
        <ImmersiveHero
          sequence={sequence}
          titre={bien.titre}
          lieu={lieu}
          accroche={bien.accroche}
          chapitres={bien.chapitres}
          demo={bien.demo}
        />

        {/* Phase 3 : présentation éditoriale complète (caractéristiques, galerie, DPE, mentions) */}
        <section id="presentation" className="bg-ivoire text-anthracite">
          <div className="mx-auto max-w-6xl px-6 py-28 sm:py-40">
            <p className="surtitre text-bronze">{bien.typeBien} · {lieu}</p>
            <h2 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl">{bien.titre}</h2>
            {bien.prix !== null && <p className="mt-6 font-serif text-3xl text-cuivre">{euros.format(bien.prix)}</p>}
            <div className="mt-14 grid gap-10 border-t border-champagne pt-10 sm:grid-cols-2">
              <p className="font-serif text-2xl italic leading-snug text-anthracite/90">{bien.accroche}</p>
              <p className="text-sm leading-7 text-anthracite/70">
                La présentation complète du bien — description, caractéristiques, galerie photographique,
                diagnostic énergétique et mentions légales — sera ajoutée à partir de l&apos;annonce (phase 3).
              </p>
            </div>
          </div>
        </section>

        <section id="visite" className="bg-anthracite text-ivoire">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-28 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="surtitre text-champagne">Visite privée</p>
              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">Organiser une visite privée</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-ivoire/70">
                Le parcours acquéreur en quatre étapes et la réservation de créneau arrivent en phase 4.
              </p>
            </div>
            <p className="font-serif text-xl italic text-champagne">Des lieux. Des vies. Une histoire.</p>
          </div>
        </section>
      </main>

      <footer className="bg-noir px-6 py-12 text-center">
        <p className="font-serif text-lg tracking-[0.3em] text-ivoire">BROZZU</p>
        <p className="mt-1 font-serif text-sm italic text-ivoire/60">L&apos;Atelier Immo</p>
        <a href="https://brozzu.fr" className="mt-6 inline-block surtitre text-[0.6rem] text-champagne hover:opacity-70">
          brozzu.fr
        </a>
      </footer>

      <VisitButton />
    </>
  );
}
