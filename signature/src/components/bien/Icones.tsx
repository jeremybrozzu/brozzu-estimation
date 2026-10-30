/** Pictogrammes au trait fin, dessinés pour la charte (24 × 24, trait 1,25). */

const chemins = {
  maison: "M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5.5h4V20",
  prix: "M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10.5h9M4 13.5h9",
  surface: "M4 4h16v16H4zM4 9h3M4 15h3M9 4v3M15 4v3",
  terrain: "M3 19h18M7 19v-4M7 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM16 19v-6M16 13l-3.5-5h7L16 13Z",
  pieces: "M4 4h16v16H4zM12 4v9M12 16v4M4 12h5",
  chambre: "M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3M6.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  bain: "M4 12h16v2.5A4.5 4.5 0 0 1 15.5 19h-7A4.5 4.5 0 0 1 4 14.5V12ZM6 12V6.5A2.5 2.5 0 0 1 10.5 5M7 19l-1 1.5M17 19l1 1.5",
  douche: "M5 20V8a4 4 0 0 1 8 0M10 8h6M11 12v.5M14 12v.5M17 12v.5M12.5 15.5v.5M15.5 15.5v.5",
  calendrier: "M4 6h16v14H4zM4 10h16M8 4v4M16 4v4",
  chauffage: "M12 21c3.3 0 6-2.4 6-5.8 0-3.7-3-5.6-3.6-9.2-1.9 1.3-3 3.4-3 5.3-1-.6-1.6-1.6-1.8-2.8C7.6 10 6 12.4 6 15.2 6 18.6 8.7 21 12 21Z",
  exposition: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  cuisine: "M4 10h16v10H4zM4 14h16M8 10V4M12 10V6M16 10V4",
  piscine: "M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0M8 8h6M8 11h6",
  terrasse: "M3 20h18M5 20v-6h14v6M3 14h18M12 4l9 6H3l9-6Z",
  arbre: "M12 21v-6M12 15a5 5 0 0 0 5-5 5 5 0 0 0-5-7 5 5 0 0 0-5 7 5 5 0 0 0 5 5ZM9 21h6",
  vue: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  climatisation: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5",
  stationnement: "M5 3h14v18H5zM10 17V7h3a3 3 0 0 1 0 6h-3",
  etage: "M4 20h4v-4h4v-4h4V8h4",
  taxe: "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6",
} as const;

export type NomIcone = keyof typeof chemins;

export function Icone({ nom, className = "" }: { nom: NomIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-6 w-6 ${className}`}
    >
      <path d={chemins[nom]} />
    </svg>
  );
}

/** Pictogramme associé à une prestation, d'après son libellé. */
export function iconePrestation(libelle: string): NomIcone {
  const l = libelle.toLowerCase();
  if (l.includes("piscine")) return "piscine";
  if (l.includes("terrasse") || l.includes("balcon")) return "terrasse";
  if (l.includes("vue")) return "vue";
  if (l.includes("arbor") || l.includes("jardin")) return "arbre";
  if (l.includes("garage") || l.includes("stationnement")) return "stationnement";
  if (l.includes("clim")) return "climatisation";
  if (l.includes("ascenseur")) return "etage";
  if (l.includes("interphone")) return "pieces";
  return "maison";
}
