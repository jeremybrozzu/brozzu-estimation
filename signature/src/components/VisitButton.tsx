/**
 * Bouton flottant « Organiser une visite », toujours accessible.
 * Ouvre le parcours acquéreur (attribut `data-ouvrir-visite`) ; sans JavaScript,
 * le lien mène à l'encadré de visite. Il s'efface quand cet encadré est à l'écran.
 */
export function VisitButton() {
  return (
    <a
      href="#visite"
      data-ouvrir-visite
      data-cta-flottant
      className="group fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] right-5 z-40 flex items-center gap-3 rounded-full border border-champagne/40 bg-noir/70 py-3 pl-5 pr-4 text-ivoire shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-[background-color,border-color,opacity,translate] duration-500 hover:border-champagne hover:bg-anthracite data-[cache]:pointer-events-none data-[cache]:translate-y-4 data-[cache]:opacity-0 sm:bottom-8 sm:right-8"
    >
      <span className="surtitre text-[0.62rem]">Organiser une visite</span>
      <span aria-hidden className="block h-px w-6 bg-champagne transition-all duration-500 ease-luxe group-hover:w-9" />
    </a>
  );
}
