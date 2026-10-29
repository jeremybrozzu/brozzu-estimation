/** En-tête discret, superposé à l'accueil immersif. */
export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 mix-blend-difference sm:px-10 sm:py-7">
      <a href="#top" className="pointer-events-auto flex items-center gap-3" aria-label="BROZZU L'Atelier Immo — haut de page">
        {/* Monogramme en masque : reste lisible sur fond sombre comme sur fond ivoire */}
        <span
          aria-hidden
          className="block h-8 w-[46px] bg-ivoire"
          style={{ mask: "url(/brand/monogramme-brozzu.png) center / contain no-repeat" }}
        />
        <span className="hidden flex-col leading-none text-ivoire sm:flex">
          <span className="font-serif text-lg tracking-[0.28em]">BROZZU</span>
          <span className="mt-1 font-serif text-[0.7rem] italic tracking-wide opacity-80">L&apos;Atelier Immo</span>
        </span>
      </a>
      <a
        href="https://brozzu.fr"
        className="pointer-events-auto surtitre text-[0.6rem] text-ivoire/90 transition-opacity hover:opacity-60"
      >
        brozzu.fr
      </a>
    </header>
  );
}
