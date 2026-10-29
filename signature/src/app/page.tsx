import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { biens } from "@/content/biens";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** Racine du sous-domaine : sommaire des biens publiés (non indexé). */
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-12 px-6 py-20 text-center">
      <Image src="/brand/logo-brozzu.webp" alt="BROZZU L'Atelier Immo" width={220} height={218} priority />
      <p className="surtitre text-champagne">Signature Collection</p>
      <ul className="flex flex-col gap-4">
        {biens.filter((b) => b.publie).map((b) => (
          <li key={b.slug}>
            <Link href={`/${b.slug}`} className="font-serif text-3xl text-ivoire transition-colors hover:text-champagne">
              {b.titre} <span className="text-base text-ivoire/50">— {b.commune}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
