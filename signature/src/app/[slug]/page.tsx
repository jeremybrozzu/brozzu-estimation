import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { biens, getBien } from "@/content/biens";
import type { Bien } from "@/content/types";
import { loadSequence } from "@/lib/sequence";
import { ImmersiveHero } from "@/components/immersive/ImmersiveHero";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitButton } from "@/components/VisitButton";
import { Presentation } from "@/components/bien/Presentation";
import { Galerie } from "@/components/bien/Galerie";
import { Caracteristiques } from "@/components/bien/Caracteristiques";
import { Diagnostic } from "@/components/bien/Diagnostic";
import { ParcoursVisite } from "@/components/visite/ParcoursVisite";

export function generateStaticParams() {
  return biens.filter((b) => b.publie).map((b) => ({ slug: b.slug }));
}

const photosBase = (bien: Bien) => `/biens/${bien.slug}/photos`;

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const bien = getBien((await params).slug);
  if (!bien) return {};
  const image = bien.photos?.[0]
    ? `${photosBase(bien)}/${bien.photos[0].fichier}-1600.webp`
    : bien.sequence
      ? `/biens/${bien.sequence}/sequence/poster.webp`
      : undefined;
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
      images: image ? [image] : undefined,
    },
  };
}

/** Données structurées schema.org, construites uniquement à partir des champs renseignés. */
function jsonLd(bien: Bien) {
  const c = bien.caracteristiques;
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: bien.seo.titre,
    description: bien.seo.description,
    url: bien.annonceUrl ?? undefined,
    image: bien.photos?.map((p) => `${photosBase(bien)}/${p.fichier}-1600.webp`),
    offers:
      bien.prix !== null ? { "@type": "Offer", price: bien.prix, priceCurrency: "EUR", availability: "https://schema.org/InStock" } : undefined,
    about: {
      "@type": bien.typeBien === "Appartement" ? "Apartment" : "SingleFamilyResidence",
      address: { "@type": "PostalAddress", addressLocality: bien.commune, postalCode: bien.codePostal ?? undefined, addressCountry: "FR" },
      floorSize: c?.surfaceHabitable != null ? { "@type": "QuantitativeValue", value: c.surfaceHabitable, unitCode: "MTK" } : undefined,
      numberOfRooms: c?.pieces ?? undefined,
      numberOfBedrooms: c?.chambres ?? undefined,
      yearBuilt: c?.anneeConstruction ?? undefined,
    },
    provider: { "@type": "RealEstateAgent", name: "BROZZU – L'Atelier Immo", url: "https://www.brozzu.fr" },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function BienPage({ params }: PageProps<"/[slug]">) {
  const bien = getBien((await params).slug);
  if (!bien) notFound();
  const sequence = await loadSequence(bien.sequence);
  const lieu = [bien.commune, bien.secteur].filter(Boolean).join(" · ");

  return (
    <>
      {!bien.demo && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(bien) }} />}
      <SiteHeader />
      <main id="top">
        <ImmersiveHero
          sequence={sequence}
          titre={bien.titre}
          lieu={lieu}
          accroche={bien.accroche}
          chapitres={bien.chapitres}
          demo={bien.demo}
          hauteurDefilement={bien.hauteurDefilement}
        />

        <Presentation bien={bien} />
        {bien.photos && bien.photos.length > 0 && <Galerie photos={bien.photos} base={photosBase(bien)} />}
        <Caracteristiques bien={bien} />
        {!bien.demo && <Diagnostic bien={bien} />}

        <section id="visite" data-masque-cta className="bg-anthracite text-ivoire">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 sm:py-28 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="surtitre text-champagne">Visite privée</p>
              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">Organiser une visite privée</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-ivoire/70">
                Quelques questions pour mieux vous connaître, puis choisissez un créneau ou demandez à être rappelé.
              </p>
              <p className="mt-8 font-serif text-xl italic text-champagne">Des lieux. Des vies. Une histoire.</p>
            </div>
            <a
              href="#visite"
              data-ouvrir-visite
              className="group flex items-center justify-center gap-4 self-start rounded-full bg-ivoire py-4 pl-7 pr-6 text-anthracite transition-colors hover:bg-champagne lg:self-center"
            >
              <span className="surtitre text-[0.66rem]">Organiser une visite</span>
              <span aria-hidden className="block h-px w-8 bg-cuivre transition-all duration-500 ease-luxe group-hover:w-12" />
            </a>
          </div>
        </section>
      </main>

      <footer data-masque-cta className="bg-noir px-6 py-12 text-center">
        <p className="font-serif text-lg tracking-[0.3em] text-ivoire">BROZZU</p>
        <p className="mt-1 font-serif text-sm italic text-ivoire/60">L&apos;Atelier Immo</p>
        <a href="https://www.brozzu.fr" className="mt-6 inline-block surtitre text-[0.6rem] text-champagne hover:opacity-70">
          brozzu.fr
        </a>
      </footer>

      <VisitButton />
      <ParcoursVisite bien={bien.slug} titreBien={`${bien.titre} · ${bien.commune}`} />
    </>
  );
}
