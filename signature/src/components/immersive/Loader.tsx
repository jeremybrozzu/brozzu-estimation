"use client";

import Image from "next/image";

/** Rideau de chargement : monogramme et filet de progression. */
export function Loader({ progress, done }: { progress: number; done: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={done}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-noir transition-[opacity,visibility] duration-1000 ease-luxe ${
        done ? "invisible opacity-0" : "visible opacity-100"
      }`}
    >
      <Image src="/brand/monogramme-brozzu.png" alt="" width={120} height={83} priority className="opacity-90" />
      <div className="mt-10 h-px w-40 overflow-hidden bg-ivoire/10">
        <div
          className="h-full origin-left bg-champagne transition-transform duration-300"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <p className="mt-5 surtitre text-[0.6rem] text-ivoire/60">
        {done ? "Bienvenue" : `Préparation de la visite · ${Math.round(progress * 100)} %`}
      </p>
    </div>
  );
}
