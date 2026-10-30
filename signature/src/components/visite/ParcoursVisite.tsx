"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CHAMBRES, CHAMPS_ETAPE, CRITERES, DELAIS, FINANCEMENT, OBJECTIFS, TYPES_RECHERCHE,
  demandeSchema, valeursInitiales, type Demande,
} from "@/lib/demande";
import { creneauxDemo, formatHeure, formatJour, type Creneau, type JourCreneaux } from "@/lib/creneaux";
import { sections, suite } from "@/lib/resume";
import { Cases, Champ, Communes, Consentement, Pastilles } from "./champs";
import { ChoixCreneau } from "./ChoixCreneau";

/**
 * Parcours acquéreur : 4 étapes, récapitulatif, puis
 * A — choix d'un créneau ou B — demande de rappel.
 * Si le conseiller du bien a un agenda Google de prise de rendez-vous, le choix A
 * enregistre la fiche (envoyée à son e-mail) puis ouvre son agenda pour réserver.
 * Sinon, créneaux proposés sur le site, à confirmer par l'agence.
 *
 * S'ouvre au clic sur tout élément portant `data-ouvrir-visite`.
 * Envoi : API du site (serveur Next.js) ; ou, en hébergement statique (`envoiDirect`),
 * directement du navigateur vers FormSubmit, qui relaie la fiche par e-mail — comme
 * l'application d'estimation. En mode `apercu`, rien n'est transmis et l'aperçu l'indique.
 */

const TITRES = ["Faisons connaissance", "Votre recherche immobilière", "Votre financement", "Parlons de votre projet"];
const ETAPE_RECAP = 4;
const ETAPE_CRENEAU = 5;
const ETAPE_FIN = 6;

type Resultat = { reference: string; choix: Demande["choix"]; creneau?: Creneau; apercu: boolean };

export function ParcoursVisite({
  bien,
  titreBien,
  agenda,
  conseiller,
  envoiDirect,
  apercu = false,
}: {
  bien: string;
  titreBien: string;
  /** Page de prise de rendez-vous Google du conseiller. */
  agenda?: string;
  /** Nom du conseiller, affiché à l'acquéreur. */
  conseiller?: string;
  /** Hébergement statique : adresse e-mail à laquelle FormSubmit relaie la fiche. */
  envoiDirect?: string;
  apercu?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [etape, setEtape] = useState(0);
  const [depuisRecap, setDepuisRecap] = useState(false);
  const [envoi, setEnvoi] = useState<"repos" | "en_cours">("repos");
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [creneaux, setCreneaux] = useState<{ demo: boolean; jours: JourCreneaux[] } | null>(null);
  /** Clé anti-double envoi : créée au premier envoi, réutilisée si l'on réessaie. */
  const cleEnvoi = useRef<string | null>(null);
  /** Référence de la demande en hébergement statique, conservée si l'on réessaie. */
  const referenceDirecte = useRef<string | null>(null);
  const [siteWeb, setSiteWeb] = useState("");

  const panneau = useRef<HTMLDivElement>(null);
  const titre = useRef<HTMLHeadingElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);

  const form = useForm<Demande>({
    resolver: zodResolver(demandeSchema),
    defaultValues: valeursInitiales,
    // Erreurs affichées au clic sur « Continuer », puis effacées dès que le champ est corrigé
    // (et non à la sortie du champ : la page bougerait sous le pointeur au moment du clic).
    mode: "onSubmit",
  });
  const { register, control, trigger, setValue, getValues, formState } = form;
  const e = formState.errors;
  const v = useWatch({ control });

  useEffect(() => {
    const abonnement = form.watch((_, { name }) => {
      if (name && form.getFieldState(name).error) form.trigger(name);
    });
    return () => abonnement.unsubscribe();
  }, [form]);

  // Ouverture depuis n'importe quel bouton « Organiser une visite ».
  useEffect(() => {
    const clic = (ev: MouseEvent) => {
      const cible = (ev.target as HTMLElement).closest<HTMLElement>("[data-ouvrir-visite]");
      if (!cible) return;
      ev.preventDefault();
      declencheur.current = cible;
      setOuvert(true);
    };
    document.addEventListener("click", clic);
    return () => document.removeEventListener("click", clic);
  }, []);

  // Le bouton flottant s'efface quand l'encadré de visite est à l'écran.
  useEffect(() => {
    const cta = document.querySelector<HTMLElement>("[data-cta-flottant]");
    const zones = document.querySelectorAll("[data-masque-cta]");
    if (!cta || !zones.length) return;
    const visibles = new Set<Element>();
    const obs = new IntersectionObserver((entrees) => {
      for (const en of entrees) {
        if (en.isIntersecting) visibles.add(en.target);
        else visibles.delete(en.target);
      }
      cta.toggleAttribute("data-cache", visibles.size > 0);
    });
    zones.forEach((z) => obs.observe(z));
    return () => obs.disconnect();
  }, []);

  const fermer = useCallback(() => {
    if (envoi === "en_cours") return;
    setOuvert(false);
    declencheur.current?.focus();
  }, [envoi]);

  // Panneau ouvert : défilement de la page bloqué, Échap pour fermer, focus gardé dans le panneau.
  useEffect(() => {
    if (!ouvert) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const clavier = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") fermer();
      if (ev.key !== "Tab" || !panneau.current) return;
      const f = panneau.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not(.sr-only), textarea, select, a[href], label:has(input.sr-only)',
      );
      const premier = f[0], dernier = f[f.length - 1];
      const bord = ev.shiftKey ? premier : dernier;
      if (document.activeElement === bord) {
        ev.preventDefault();
        (ev.shiftKey ? dernier : premier).focus();
      }
    };
    document.addEventListener("keydown", clavier);
    return () => {
      document.body.style.overflow = avant;
      document.removeEventListener("keydown", clavier);
    };
  }, [ouvert, fermer]);

  // À chaque changement d'étape : retour en haut et focus sur le titre (annoncé aux lecteurs d'écran).
  useEffect(() => {
    if (!ouvert) return;
    panneau.current?.querySelector("[data-defilement]")?.scrollTo({ top: 0 });
    titre.current?.focus();
  }, [etape, ouvert]);

  // Créneaux chargés à l'arrivée sur l'étape de choix.
  const chargerCreneaux = useCallback(async () => {
    if (apercu) return setCreneaux({ demo: true, jours: creneauxDemo(bien) });
    try {
      const r = await fetch(`/api/creneaux?bien=${encodeURIComponent(bien)}`);
      if (!r.ok) throw new Error();
      setCreneaux(await r.json());
    } catch {
      setCreneaux({ demo: true, jours: [] });
      setErreurEnvoi("Les créneaux n'ont pas pu être chargés. Réessayez ou choisissez d'être rappelé.");
    }
  }, [apercu, bien]);

  const suivant = async () => {
    const ok = await trigger(CHAMPS_ETAPE[etape], { shouldFocus: true });
    if (!ok) return;
    if (depuisRecap) {
      setDepuisRecap(false);
      return setEtape(ETAPE_RECAP);
    }
    setEtape(etape + 1);
  };

  const modifier = (i: number) => {
    setDepuisRecap(true);
    setEtape(i);
  };

  const choisir = async (choix: Demande["choix"]) => {
    setValue("choix", choix);
    const ok = await trigger("consentementTraitement", { shouldFocus: true });
    if (!ok) return;
    setErreurEnvoi(null);
    if (choix === "creneau" && agenda) {
      // La réservation se fait dans l'agenda Google du conseiller, après envoi de la fiche.
      setValue("choix", "agenda");
      setValue("creneau", undefined);
      envoyer();
    } else if (choix === "creneau") {
      setEtape(ETAPE_CRENEAU);
      if (!creneaux) chargerCreneaux();
    } else {
      setValue("creneau", undefined);
      envoyer();
    }
  };

  const envoyer = async () => {
    if (envoi === "en_cours") return;
    const demande = getValues();
    const valide = demandeSchema.safeParse(demande);
    if (!valide.success) {
      setErreurEnvoi("Certaines informations sont incomplètes. Vérifiez le récapitulatif.");
      return setEtape(ETAPE_RECAP);
    }
    setEnvoi("en_cours");
    setErreurEnvoi(null);
    try {
      let reference: string;
      if (apercu) {
        await new Promise((r) => setTimeout(r, 700));
        reference = "APERÇU";
      } else if (envoiDirect) {
        reference = (referenceDirecte.current ??= nouvelleReference());
        await envoyerParFormSubmit(envoiDirect, valide.data, titreBien, reference, siteWeb);
      } else {
        const r = await fetch("/api/demandes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bien, cleEnvoi: (cleEnvoi.current ??= crypto.randomUUID()), siteWeb, demande: valide.data }),
        });
        const corps = await r.json().catch(() => ({}));
        if (r.status === 409) {
          setValue("creneau", undefined);
          setCreneaux(null);
          chargerCreneaux();
          throw new Error(corps.erreur ?? "Ce créneau n'est plus disponible.");
        }
        if (!r.ok) throw new Error(corps.erreur ?? "La demande n'a pas pu être enregistrée.");
        reference = corps.reference;
      }
      setResultat({ reference, choix: demande.choix, creneau: demande.creneau, apercu });
      setEtape(ETAPE_FIN);
    } catch (err) {
      setErreurEnvoi(
        err instanceof TypeError
          ? "Connexion impossible. Vérifiez votre réseau puis réessayez : votre demande ne sera pas envoyée deux fois."
          : (err as Error).message,
      );
    } finally {
      setEnvoi("repos");
    }
  };

  const progression = Math.min(etape + 1, ETAPE_FIN) / ETAPE_FIN;
  const intitule =
    etape < ETAPE_RECAP ? `Étape ${etape + 1} sur 4` : etape === ETAPE_RECAP ? "Vérification" : etape === ETAPE_CRENEAU ? "Choix du créneau" : "Demande envoyée";

  return (
    <div
      ref={panneau}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcours-titre"
      hidden={!ouvert}
      className="fixed inset-0 z-[70] flex justify-end"
    >
      <div className="absolute inset-0 bg-noir/60 backdrop-blur-[2px] [animation:fondu_.4s_ease-out]" onClick={fermer} aria-hidden />

      <div className="relative flex h-full w-full max-w-[40rem] flex-col bg-ivoire text-anthracite shadow-2xl [animation:glisse_.6s_var(--ease-luxe)]">
        {/* En-tête et progression */}
        <div className="border-b border-champagne px-6 pb-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] sm:px-10">
          <div className="flex items-center justify-between gap-4">
            <p className="surtitre truncate text-[0.58rem] text-bronze">Visite privée · {titreBien}</p>
            <button
              type="button"
              onClick={fermer}
              className="surtitre -mr-2 shrink-0 p-2 text-[0.58rem] text-anthracite/70 hover:text-anthracite"
            >
              Fermer ✕
            </button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="h-[2px] flex-1 bg-champagne/60"
              role="progressbar"
              aria-label="Progression"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progression * 100)}
            >
              <div className="h-full origin-left bg-cuivre transition-transform duration-700 ease-luxe" style={{ transform: `scaleX(${progression})` }} />
            </div>
            <span className="surtitre shrink-0 text-[0.55rem] tabular-nums text-anthracite/60">{intitule}</span>
          </div>
        </div>

        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            if (etape < ETAPE_RECAP) suivant();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div data-defilement className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
            {/* Champ piège pour les robots, invisible pour les personnes */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Site web
                <input tabIndex={-1} autoComplete="off" value={siteWeb} onChange={(ev) => setSiteWeb(ev.target.value)} />
              </label>
            </div>

            {etape < ETAPE_RECAP && (
              <h2 id="parcours-titre" ref={titre} tabIndex={-1} className="font-serif text-4xl leading-tight outline-none sm:text-5xl">
                {TITRES[etape]}
              </h2>
            )}

            {etape === 0 && (
              <div className="mt-8 grid gap-7 sm:grid-cols-2">
                <Champ label="Prénom" requis autoComplete="given-name" erreur={e.prenom?.message} {...register("prenom")} />
                <Champ label="Nom" requis autoComplete="family-name" erreur={e.nom?.message} {...register("nom")} />
                <Champ label="Date de naissance" requis type="date" autoComplete="bday" erreur={e.dateNaissance?.message} {...register("dateNaissance")} className="sm:col-span-2" />
                <Champ label="Adresse postale" requis autoComplete="street-address" erreur={e.adresse?.message} {...register("adresse")} className="sm:col-span-2" />
                <Champ label="Code postal" requis inputMode="numeric" autoComplete="postal-code" maxLength={5} erreur={e.codePostal?.message} {...register("codePostal")} />
                <Champ label="Ville" requis autoComplete="address-level2" erreur={e.ville?.message} {...register("ville")} />
                <Champ label="Adresse e-mail" requis type="email" autoComplete="email" inputMode="email" erreur={e.email?.message} {...register("email")} className="sm:col-span-2" />
                <Champ label="Numéro de téléphone" requis type="tel" autoComplete="tel" inputMode="tel" placeholder="06 12 34 56 78" erreur={e.telephone?.message} {...register("telephone")} className="sm:col-span-2" />
                <p className="text-[0.75rem] text-anthracite/55 sm:col-span-2">
                  <span className="text-cuivre">*</span> Informations nécessaires pour organiser la visite.
                </p>
              </div>
            )}

            {etape === 1 && (
              <div className="mt-8 flex flex-col gap-9">
                <Controller control={control} name="typeRecherche" render={({ field }) => (
                  <Pastilles requis legende="Quel type de bien recherchez-vous ?" name={field.name} options={TYPES_RECHERCHE} valeur={field.value} onChange={field.onChange} erreur={e.typeRecherche?.message} />
                )} />
                <Controller control={control} name="communes" render={({ field }) => (
                  <Communes requis valeurs={field.value} onChange={field.onChange} erreur={e.communes?.message} />
                )} />
                <div>
                  <label htmlFor="quartiers" className="block text-[0.82rem] font-medium">
                    Avez-vous des quartiers privilégiés ou à éviter ? <span className="font-normal text-anthracite/45">· facultatif</span>
                  </label>
                  <textarea
                    id="quartiers"
                    rows={3}
                    {...register("quartiers")}
                    className="mt-2 block w-full resize-y border border-anthracite/20 bg-white/50 p-3 text-[1rem] outline-none focus:border-cuivre"
                  />
                </div>
                <Controller control={control} name="chambres" render={({ field }) => (
                  <Pastilles requis legende="Combien de chambres recherchez-vous ?" name={field.name} options={CHAMBRES} valeur={field.value} onChange={field.onChange} erreur={e.chambres?.message} />
                )} />
                <Champ label="Quelle surface habitable minimum souhaitez-vous ?" inputMode="numeric" suffixe="m²" erreur={e.surfaceMin?.message} {...register("surfaceMin")} className="max-w-xs" />
                <Controller control={control} name="criteres" render={({ field }) => (
                  <Cases legende="Quels sont vos critères indispensables ?" name={field.name} options={CRITERES} valeurs={field.value} onChange={field.onChange} />
                )} />
                {v.criteres?.includes("Autre") && (
                  <Champ label="Précisez le critère « Autre »" erreur={e.critereAutre?.message} {...register("critereAutre")} />
                )}
              </div>
            )}

            {etape === 2 && (
              <div className="mt-8 flex flex-col gap-9">
                <div className="grid gap-7 sm:grid-cols-2">
                  <Champ label="Quel est votre budget maximum ?" requis inputMode="numeric" suffixe="€" erreur={e.budgetMax?.message} {...register("budgetMax")} />
                  <Champ label="Quel est votre apport personnel envisagé ?" requis inputMode="numeric" suffixe="€" erreur={e.apport?.message} {...register("apport")} />
                </div>
                <Controller control={control} name="financementEtudie" render={({ field }) => (
                  <Pastilles requis legende="Avez-vous déjà étudié votre financement ?" name={field.name} options={FINANCEMENT} valeur={field.value} onChange={field.onChange} erreur={e.financementEtudie?.message} />
                )} />
                <Controller control={control} name="courtier" render={({ field }) => (
                  <Pastilles
                    requis
                    erreur={e.courtier?.message}
                    legende="Souhaitez-vous être mis en relation avec un courtier partenaire pour une étude gratuite ?"
                    name={field.name}
                    options={[{ valeur: "oui", label: "Oui" }, { valeur: "non", label: "Non" }]}
                    valeur={field.value}
                    onChange={(x) => {
                      field.onChange(x);
                      if (x !== "oui") setValue("consentementCourtier", false);
                    }}
                  />
                )} />
                {v.courtier === "oui" && (
                  <div className="border-l-2 border-champagne pl-5">
                    <Controller control={control} name="consentementCourtier" render={({ field }) => (
                      <Consentement name={field.name} checked={field.value} onChange={field.onChange} erreur={e.consentementCourtier?.message}>
                        J&apos;accepte que BROZZU transmette mes prénom, nom, e-mail et téléphone à son courtier partenaire, afin
                        qu&apos;il me contacte pour une étude gratuite de mon financement. Mon budget et mon apport ne lui sont pas
                        transmis. Je peux retirer cet accord à tout moment.
                      </Consentement>
                    )} />
                  </div>
                )}
              </div>
            )}

            {etape === 3 && (
              <div className="mt-8 flex flex-col gap-9">
                <Controller control={control} name="objectif" render={({ field }) => (
                  <Pastilles legende="Quel est l'objectif de votre acquisition ?" name={field.name} options={OBJECTIFS} valeur={field.value} onChange={field.onChange} />
                )} />
                <Controller control={control} name="delai" render={({ field }) => (
                  <Pastilles legende="Dans quel délai souhaitez-vous acheter ?" name={field.name} options={DELAIS} valeur={field.value} onChange={field.onChange} />
                )} />
                <Controller control={control} name="bienAVendre" render={({ field }) => (
                  <Pastilles
                    requis
                    erreur={e.bienAVendre?.message}
                    legende="Avez-vous un bien immobilier à vendre pour financer votre acquisition ?"
                    name={field.name}
                    options={[{ valeur: "oui", label: "Oui" }, { valeur: "non", label: "Non" }]}
                    valeur={field.value}
                    onChange={field.onChange}
                  />
                )} />
                {v.bienAVendre === "oui" && (
                  <div className="flex flex-col gap-8 border-l-2 border-champagne pl-5 [animation:fondu_.4s_ease-out]">
                    <Champ label="Dans quelle commune se situe votre bien ?" erreur={e.venteCommune?.message} {...register("venteCommune")} />
                    <Controller control={control} name="venteType" render={({ field }) => (
                      <Pastilles legende="S'agit-il d'une maison ou d'un appartement ?" name={field.name} options={["Maison", "Appartement"]} valeur={field.value} onChange={field.onChange} />
                    )} />
                    <Controller control={control} name="venteDejaEnVente" render={({ field }) => (
                      <Pastilles legende="Votre bien est-il déjà en vente ?" name={field.name} options={[{ valeur: "oui", label: "Oui" }, { valeur: "non", label: "Non" }]} valeur={field.value} onChange={field.onChange} />
                    )} />
                    <Controller control={control} name="venteEstimation" render={({ field }) => (
                      <Pastilles legende="Souhaitez-vous bénéficier d'une estimation gratuite par BROZZU ?" name={field.name} options={[{ valeur: "oui", label: "Oui" }, { valeur: "non", label: "Non" }]} valeur={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                )}
              </div>
            )}

            {etape === ETAPE_RECAP && (
              <Recapitulatif d={v as Demande} e={e} titre={titre} onModifier={modifier} control={control} viaFormSubmit={Boolean(envoiDirect)} />
            )}

            {etape === ETAPE_CRENEAU && (
              <div>
                <h2 id="parcours-titre" ref={titre} tabIndex={-1} className="font-serif text-4xl leading-tight outline-none sm:text-5xl">
                  Choisir un créneau
                </h2>
                <p className="mt-3 text-sm leading-6 text-anthracite/70">
                  Votre demande sera transmise à l&apos;agence, qui la confirmera avant la visite.
                </p>
                <div className="mt-8">
                  {creneaux ? (
                    <ChoixCreneau
                      jours={creneaux.jours}
                      demo={creneaux.demo}
                      choisi={v.creneau as Creneau | undefined}
                      onChoisir={(c) => setValue("creneau", c, { shouldValidate: true })}
                    />
                  ) : (
                    <p className="text-sm text-anthracite/60" role="status">Chargement des créneaux…</p>
                  )}
                </div>
              </div>
            )}

            {etape === ETAPE_FIN && resultat && (
              <Confirmation r={resultat} titre={titre} agenda={agenda} conseiller={conseiller} />
            )}

            {erreurEnvoi && (
              <p role="alert" className="mt-8 border-l-2 border-[#a1342b] bg-[#a1342b]/5 px-4 py-3 text-sm text-[#a1342b]">
                {erreurEnvoi}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-champagne px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 sm:px-10">
            {etape > 0 && etape < ETAPE_FIN ? (
              <button
                type="button"
                onClick={() => setEtape(etape === ETAPE_CRENEAU ? ETAPE_RECAP : etape - 1)}
                className="surtitre py-3 text-[0.6rem] text-anthracite/70 hover:text-anthracite"
              >
                ← Retour
              </button>
            ) : (
              <span />
            )}

            {etape < ETAPE_RECAP && (
              <button type="submit" className="flex items-center gap-3 rounded-full bg-anthracite py-3.5 pl-6 pr-5 text-ivoire transition-colors hover:bg-noir">
                <span className="surtitre text-[0.62rem]">{depuisRecap ? "Revenir au récapitulatif" : "Continuer"}</span>
                <span aria-hidden className="block h-px w-6 bg-champagne" />
              </button>
            )}

            {etape === ETAPE_RECAP && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => choisir("rappel")}
                  disabled={envoi === "en_cours"}
                  className="rounded-full border border-anthracite px-5 py-3.5 text-anthracite transition-colors hover:bg-anthracite hover:text-ivoire disabled:opacity-50"
                >
                  <span className="surtitre text-[0.6rem]">{envoi === "en_cours" ? "Envoi…" : "Valider et être rappelé"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => choisir("creneau")}
                  disabled={envoi === "en_cours"}
                  className="rounded-full bg-anthracite px-5 py-3.5 text-ivoire transition-colors hover:bg-noir disabled:opacity-50"
                >
                  <span className="surtitre text-[0.6rem]">
                    {envoi === "en_cours" && v.choix === "agenda" ? "Envoi…" : "Choisir un créneau de visite"}
                  </span>
                </button>
              </div>
            )}

            {etape === ETAPE_CRENEAU && (
              <button
                type="button"
                onClick={envoyer}
                disabled={!v.creneau || envoi === "en_cours"}
                className="flex items-center gap-3 rounded-full bg-cuivre py-3.5 pl-6 pr-5 text-ivoire transition-colors hover:bg-[#6d3218] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="surtitre text-[0.62rem]">{envoi === "en_cours" ? "Envoi…" : "Envoyer ma demande"}</span>
                <span aria-hidden className="block h-px w-6 bg-champagne" />
              </button>
            )}

            {etape === ETAPE_FIN && (
              <button type="button" onClick={fermer} className="ml-auto rounded-full bg-anthracite px-6 py-3.5 text-ivoire hover:bg-noir">
                <span className="surtitre text-[0.62rem]">Revenir au bien</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ——— Envoi direct (hébergement statique) ——— */

function nouvelleReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const octets = crypto.getRandomValues(new Uint8Array(4));
  const d = new Date();
  const suffixe = Array.from(octets, (b) => alphabet[b % alphabet.length]).join("");
  return `BRZ-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${suffixe}`;
}

/** Même service que l'application d'estimation : FormSubmit relaie la fiche par e-mail. */
async function envoyerParFormSubmit(email: string, d: Demande, titreBien: string, reference: string, piege: string) {
  const champs: Record<string, string> = {
    _subject: `Nouvelle demande de visite — ${titreBien} — ${d.prenom} ${d.nom}`,
    _template: "table",
    _captcha: "false",
    _replyto: d.email,
    _honey: piege,
    "Bien": titreBien,
    "Suite demandée": suite(d),
    "Référence": reference,
  };
  for (const [, lignes] of sections(d)) for (const [k, v] of lignes) if (v) champs[k] = v;

  let r: Response;
  try {
    r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(champs),
    });
  } catch {
    // Réponse refusée par le navigateur (en-têtes CORS absents, typiquement au premier envoi
    // depuis un nouveau site) : on bascule sur l'envoi classique, qui n'est pas soumis à CORS.
    return envoyerParFormulaireClassique(email, champs);
  }
  const corps = await r.json().catch(() => ({}));
  if (!r.ok || String(corps.success) !== "true") {
    console.warn("[FormSubmit]", r.status, corps);
    return envoyerParFormulaireClassique(email, champs);
  }
}

/**
 * Envoi classique de formulaire HTML vers FormSubmit, dans une iframe invisible :
 * aucune restriction CORS. La réponse n'est pas lisible ; on attend le chargement de l'iframe.
 */
function envoyerParFormulaireClassique(email: string, champs: Record<string, string>) {
  return new Promise<void>((resolve) => {
    const nom = `formsubmit-${Date.now()}`;
    const cadre = document.createElement("iframe");
    cadre.name = nom;
    cadre.hidden = true;
    cadre.setAttribute("aria-hidden", "true");
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://formsubmit.co/${encodeURIComponent(email)}`;
    form.target = nom;
    form.hidden = true;
    form.acceptCharset = "UTF-8";
    for (const [k, v] of Object.entries(champs)) {
      const champ = document.createElement("input");
      champ.type = "hidden";
      champ.name = k;
      champ.value = v;
      form.appendChild(champ);
    }
    let fini = false;
    const terminer = () => {
      if (fini) return;
      fini = true;
      setTimeout(() => {
        form.remove();
        cadre.remove();
      }, 1000);
      resolve();
    };
    cadre.addEventListener("load", terminer);
    setTimeout(terminer, 6000);
    document.body.append(cadre, form);
    form.submit();
  });
}

/* ——— Récapitulatif ——— */

function Ligne({ label, valeur }: { label: string; valeur?: ReactNode }) {
  if (valeur === undefined || valeur === null || valeur === "" || (Array.isArray(valeur) && valeur.length === 0)) return null;
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-2 text-sm">
      <dt className="text-anthracite/55">{label}</dt>
      <dd className="min-w-0 break-words">{valeur}</dd>
    </div>
  );
}

function Bloc({ titre, i, onModifier, children }: { titre: string; i: number; onModifier: (i: number) => void; children: ReactNode }) {
  return (
    <section className="border-t border-champagne py-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="surtitre text-[0.6rem] text-bronze">{titre}</h3>
        <button
          type="button"
          onClick={() => onModifier(i)}
          className="text-[0.78rem] text-cuivre underline decoration-champagne underline-offset-4 hover:decoration-cuivre"
          aria-label={`Modifier : ${titre}`}
        >
          Modifier
        </button>
      </div>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

const euros = (s?: string) => (s ? `${Number(s.replace(/\D/g, "")).toLocaleString("fr-FR")} €` : undefined);
const ouiNon = (s?: string) => (s === "oui" ? "Oui" : s === "non" ? "Non" : undefined);

function Recapitulatif({
  d,
  e,
  titre,
  onModifier,
  control,
  viaFormSubmit,
}: {
  viaFormSubmit?: boolean;
  d: Demande;
  e: FieldErrors<Demande>;
  titre: React.RefObject<HTMLHeadingElement | null>;
  onModifier: (i: number) => void;
  control: ReturnType<typeof useForm<Demande>>["control"];
}) {
  return (
    <div>
      <h2 id="parcours-titre" ref={titre} tabIndex={-1} className="font-serif text-4xl leading-tight outline-none sm:text-5xl">
        Votre demande
      </h2>
      <p className="mt-3 text-sm leading-6 text-anthracite/70">Vérifiez vos informations, puis choisissez la suite.</p>

      <div className="mt-6">
        <Bloc titre="Faisons connaissance" i={0} onModifier={onModifier}>
          <Ligne label="Nom" valeur={`${d.prenom} ${d.nom}`} />
          <Ligne label="Date de naissance" valeur={d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString("fr-FR") : undefined} />
          <Ligne label="Adresse" valeur={[d.adresse, [d.codePostal, d.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ")} />
          <Ligne label="E-mail" valeur={d.email} />
          <Ligne label="Téléphone" valeur={d.telephone} />
        </Bloc>
        <Bloc titre="Votre recherche" i={1} onModifier={onModifier}>
          <Ligne label="Type de bien" valeur={d.typeRecherche} />
          <Ligne label="Communes" valeur={d.communes?.join(", ")} />
          <Ligne label="Quartiers" valeur={d.quartiers} />
          <Ligne label="Chambres" valeur={d.chambres} />
          <Ligne label="Surface minimum" valeur={d.surfaceMin && `${d.surfaceMin} m²`} />
          <Ligne
            label="Critères"
            valeur={d.criteres?.map((c) => (c === "Autre" && d.critereAutre ? `Autre (${d.critereAutre})` : c)).join(", ")}
          />
        </Bloc>
        <Bloc titre="Votre financement" i={2} onModifier={onModifier}>
          <Ligne label="Budget maximum" valeur={euros(d.budgetMax)} />
          <Ligne label="Apport" valeur={euros(d.apport)} />
          <Ligne label="Financement étudié" valeur={d.financementEtudie} />
          <Ligne
            label="Courtier partenaire"
            valeur={d.courtier === "oui" ? "Oui, coordonnées transmises avec votre accord" : ouiNon(d.courtier)}
          />
        </Bloc>
        <Bloc titre="Votre projet" i={3} onModifier={onModifier}>
          <Ligne label="Objectif" valeur={d.objectif} />
          <Ligne label="Délai" valeur={d.delai} />
          <Ligne label="Bien à vendre" valeur={ouiNon(d.bienAVendre)} />
          {d.bienAVendre === "oui" && (
            <>
              <Ligne label="Commune du bien" valeur={d.venteCommune} />
              <Ligne label="Type" valeur={d.venteType} />
              <Ligne label="Déjà en vente" valeur={ouiNon(d.venteDejaEnVente)} />
              <Ligne label="Estimation gratuite" valeur={ouiNon(d.venteEstimation)} />
            </>
          )}
        </Bloc>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-champagne pt-6">
        <Controller control={control} name="consentementTraitement" render={({ field }) => (
          <Consentement name={field.name} checked={field.value} onChange={field.onChange} erreur={e.consentementTraitement?.message}>
            J&apos;accepte que BROZZU – L&apos;Atelier Immo utilise ces informations pour traiter ma demande de visite et me
            recontacter.
          </Consentement>
        )} />
        <p className="text-[0.75rem] leading-5 text-anthracite/60">
          Vos informations sont destinées à l&apos;agence pour le suivi de votre demande et ne sont transmises à aucun tiers
          sans votre accord.{viaFormSubmit && " Elles sont acheminées par e-mail via le service FormSubmit."} Vous pouvez y
          accéder, les faire rectifier ou supprimer à tout moment en contactant l&apos;agence.
        </p>
      </div>
    </div>
  );
}

/* ——— Confirmation ——— */

function Confirmation({
  r,
  titre,
  agenda,
  conseiller,
}: {
  r: Resultat;
  titre: React.RefObject<HTMLHeadingElement | null>;
  agenda?: string;
  conseiller?: string;
}) {
  return (
    <div role="status">
      <p className="surtitre text-[0.6rem] text-bronze">{r.choix === "agenda" ? "Dernière étape" : "Merci"}</p>
      <h2 id="parcours-titre" ref={titre} tabIndex={-1} className="mt-4 font-serif text-4xl leading-tight outline-none sm:text-5xl">
        {r.choix === "agenda"
          ? "Choisissez votre créneau"
          : r.choix === "creneau"
            ? "Votre demande de visite est transmise"
            : "Votre demande est bien reçue"}
      </h2>

      {r.choix === "agenda" && agenda ? (
        <div className="mt-8 border-y border-champagne py-6">
          <p className="text-sm leading-7 text-anthracite/80">
            {!r.apercu && `Votre fiche est transmise${conseiller ? ` à ${conseiller}` : ""}. `}Réservez maintenant l&apos;horaire de votre
            visite dans {conseiller ? "son" : "notre"} agenda : seuls les créneaux réellement libres y sont proposés, et
            la confirmation vous parvient par e-mail.
          </p>
          <a
            href={agenda}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-cuivre py-4 pl-6 pr-5 text-ivoire transition-colors hover:bg-[#6d3218]"
          >
            <span className="surtitre text-[0.64rem]">Ouvrir l&apos;agenda et réserver</span>
            <span aria-hidden>↗</span>
          </a>
          <p className="mt-3 text-xs text-anthracite/55">L&apos;agenda s&apos;ouvre dans un nouvel onglet.</p>
        </div>
      ) : r.choix === "creneau" && r.creneau ? (
        <div className="mt-8 border-y border-champagne py-6">
          <p className="surtitre text-[0.58rem] text-anthracite/55">Créneau demandé</p>
          <p className="mt-2 font-serif text-3xl first-letter:uppercase">{formatJour(r.creneau.debut)}</p>
          <p className="mt-1 text-sm">
            de {formatHeure(r.creneau.debut)} à {formatHeure(r.creneau.fin)}
          </p>
          <p className="mt-4 text-sm leading-6 text-anthracite/75">
            Ce créneau n&apos;est pas encore confirmé. L&apos;agence vérifie sa disponibilité et vous recevrez une confirmation
            dès qu&apos;elle l&apos;aura validé.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm leading-7 text-anthracite/75">
          Un conseiller BROZZU vous rappellera pour faire le point sur votre projet et organiser la visite.
        </p>
      )}

      <p className="mt-6 text-sm text-anthracite/70">
        Référence de votre demande : <strong className="font-medium tracking-wide text-anthracite">{r.reference}</strong>
      </p>

      {r.apercu && (
        <p className="mt-8 rounded-sm border border-dashed border-cuivre/50 bg-white/40 px-4 py-3 text-[0.8rem] leading-6 text-cuivre">
          Aperçu : la fiche n&apos;a été ni enregistrée ni envoyée par e-mail. Sur le site en ligne, elle est enregistrée et
          envoyée au conseiller.{r.choix === "agenda" && " Le lien vers l'agenda, lui, est bien réel."}
        </p>
      )}
    </div>
  );
}
