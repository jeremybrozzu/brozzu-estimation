const nombre = new Intl.NumberFormat("fr-FR");
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const formatNombre = (n: number) => nombre.format(n);
export const formatEuros = (n: number) => euros.format(n);
export const formatSurface = (n: number) => `${nombre.format(n)} m²`;

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

/** Pluriel simple : pluriel(9, "chambre") → « 9 chambres ». */
export function pluriel(n: number, mot: string, motPluriel = `${mot}s`) {
  return `${formatNombre(n)} ${n > 1 ? motPluriel : mot}`;
}
