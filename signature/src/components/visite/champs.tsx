"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

/** Éléments de formulaire du parcours acquéreur, aux couleurs de la charte. */

export function Erreur({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-[0.78rem] text-[#a1342b]">
      {message}
    </p>
  );
}

export function Libelle({ htmlFor, children, requis }: { htmlFor?: string; children: ReactNode; requis?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[0.82rem] font-medium text-anthracite">
      {children}
      {requis ? (
        <span className="text-cuivre" aria-hidden>
          {" "}*
        </span>
      ) : (
        <span className="font-normal text-anthracite/45"> · facultatif</span>
      )}
    </label>
  );
}

type ChampProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  requis?: boolean;
  erreur?: string;
  aide?: string;
  suffixe?: string;
};

/** Champ texte à filet, avec libellé, aide et message d'erreur reliés pour les lecteurs d'écran. */
export function Champ({ label, requis, erreur, aide, suffixe, id, className = "", ...props }: ChampProps) {
  const auto = useId();
  const champId = id ?? auto;
  const decrit = [aide && `${champId}-aide`, erreur && `${champId}-erreur`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Libelle htmlFor={champId} requis={requis}>
        {label}
      </Libelle>
      <div className="relative mt-2">
        <input
          id={champId}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={decrit}
          aria-required={requis || undefined}
          className={`block w-full border-0 border-b bg-transparent px-0 py-2.5 text-[1rem] text-anthracite outline-none transition-colors placeholder:text-anthracite/35 focus:border-cuivre ${
            erreur ? "border-[#a1342b]" : "border-anthracite/25"
          } ${suffixe ? "pr-12" : ""}`}
          {...props}
        />
        {suffixe && (
          <span className="pointer-events-none absolute bottom-2.5 right-0 text-sm text-anthracite/50">{suffixe}</span>
        )}
      </div>
      {aide && (
        <p id={`${champId}-aide`} className="mt-1.5 text-[0.75rem] text-anthracite/55">
          {aide}
        </p>
      )}
      <Erreur id={`${champId}-erreur`} message={erreur} />
    </div>
  );
}

/** Choix unique sous forme de pastilles (boutons radio). */
export function Pastilles({
  legende,
  options,
  valeur,
  onChange,
  name,
  erreur,
  requis,
}: {
  legende: string;
  options: readonly string[] | { valeur: string; label: string }[];
  valeur: string | undefined;
  onChange: (v: string) => void;
  name: string;
  erreur?: string;
  requis?: boolean;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { valeur: o, label: o } : o));
  return (
    <fieldset>
      <legend className="text-[0.82rem] font-medium text-anthracite">
        {legende}
        {requis ? (
          <span className="text-cuivre" aria-hidden>
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-anthracite/45"> · facultatif</span>
        )}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {opts.map((o) => {
          const actif = valeur === o.valeur;
          return (
            <label
              key={o.valeur}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cuivre ${
                actif
                  ? "border-anthracite bg-anthracite text-ivoire"
                  : "border-anthracite/20 bg-white/50 text-anthracite hover:border-anthracite/50"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.valeur}
                checked={actif}
                onChange={() => onChange(o.valeur)}
                onClick={() => actif && onChange("")}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      <Erreur id={`${name}-erreur`} message={erreur} />
    </fieldset>
  );
}

/** Choix multiple sous forme de pastilles (cases à cocher). */
export function Cases({
  legende,
  options,
  valeurs,
  onChange,
  name,
}: {
  legende: string;
  options: readonly string[];
  valeurs: string[];
  onChange: (v: string[]) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="text-[0.82rem] font-medium text-anthracite">
        {legende}
        <span className="font-normal text-anthracite/45"> · facultatif</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const actif = valeurs.includes(o);
          return (
            <label
              key={o}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cuivre ${
                actif
                  ? "border-anthracite bg-anthracite text-ivoire"
                  : "border-anthracite/20 bg-white/50 text-anthracite hover:border-anthracite/50"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                checked={actif}
                onChange={() => onChange(actif ? valeurs.filter((v) => v !== o) : [...valeurs, o])}
                className="sr-only"
              />
              <span aria-hidden className={`text-xs ${actif ? "text-champagne" : "text-anthracite/30"}`}>
                {actif ? "✓" : "+"}
              </span>
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Saisie de plusieurs communes : Entrée ou virgule pour ajouter. */
export function Communes({
  valeurs,
  onChange,
  erreur,
  requis,
}: {
  valeurs: string[];
  onChange: (v: string[]) => void;
  erreur?: string;
  requis?: boolean;
}) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const ajouter = (brut = saisie) => {
    const noms = brut
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const suivants = [...valeurs];
    for (const n of noms) if (!suivants.some((v) => v.toLowerCase() === n.toLowerCase())) suivants.push(n);
    if (suivants.length !== valeurs.length) onChange(suivants);
    setSaisie("");
  };

  return (
    <div>
      <Libelle htmlFor={id} requis={requis}>
        Dans quelle(s) commune(s) recherchez-vous ?
      </Libelle>
      {valeurs.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Communes ajoutées">
          {valeurs.map((v) => (
            <li key={v} className="flex items-center gap-1 rounded-full bg-champagne/45 py-1.5 pl-3.5 pr-1.5 text-sm">
              {v}
              <button
                type="button"
                onClick={() => onChange(valeurs.filter((x) => x !== v))}
                aria-label={`Retirer ${v}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-anthracite/60 hover:bg-anthracite/10 hover:text-anthracite"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-end gap-3">
        <input
          id={id}
          value={saisie}
          onChange={(e) => {
            const v = e.target.value;
            if (/[,;]/.test(v)) ajouter(v);
            else setSaisie(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ajouter();
            } else if (e.key === "Backspace" && !saisie && valeurs.length) {
              onChange(valeurs.slice(0, -1));
            }
          }}
          onBlur={() => ajouter()}
          placeholder="Ex. Saint-Cannat, Lambesc, Aix-en-Provence"
          aria-describedby={`${id}-aide`}
          autoComplete="off"
          className="block w-full border-0 border-b border-anthracite/25 bg-transparent px-0 py-2.5 text-[1rem] outline-none placeholder:text-anthracite/35 focus:border-cuivre"
        />
        <button
          type="button"
          onClick={() => ajouter()}
          className="shrink-0 rounded-full border border-anthracite/25 px-4 py-2 text-sm hover:border-anthracite"
        >
          Ajouter
        </button>
      </div>
      <p id={`${id}-aide`} className="mt-1.5 text-[0.75rem] text-anthracite/55">
        Validez chaque commune avec Entrée ou une virgule.
      </p>
      <Erreur id={`${id}-erreur`} message={erreur} />
    </div>
  );
}

/** Case de consentement, toujours décochée par défaut. */
export function Consentement({
  checked,
  onChange,
  children,
  erreur,
  name,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  erreur?: string;
  name: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-6 text-anthracite">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `${name}-erreur` : undefined}
          className="mt-1 h-4 w-4 shrink-0 accent-[#853e1d]"
        />
        <span>{children}</span>
      </label>
      <Erreur id={`${name}-erreur`} message={erreur} />
    </div>
  );
}
