"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = { locale: string };

const API_ENDPOINT = "/api/reserva-plaza.php";

const inputCls = "w-full rounded-[6px] border border-surface-bg/15 bg-surface-light px-3 py-2.5 text-sm text-surface-bg placeholder:text-surface-bg/40 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 transition-colors";

export function ReservaPlazaForm({ locale }: Props) {
  const router = useRouter();
  const startedAt = useRef(Date.now());

  const [name,    setName]    = useState("");
  const [company, setCompany] = useState("");
  const [email,   setEmail]   = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !company.trim() || !email.trim()) {
      setError("Por favor completá todos los campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El email no es válido.");
      return;
    }
    if (!privacy) {
      setError("Tenés que aceptar la política de privacidad.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          locale,
          accepted: true,
          website: "",
          submittedAt: startedAt.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message ?? "Error al enviar. Intentá de nuevo.");
        return;
      }

      const params = new URLSearchParams({
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
      });
      router.push(`/${locale}/autodiagnostico?${params.toString()}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" readOnly aria-hidden="true" />

      <div>
        <label htmlFor="rp-name" className="block text-sm font-semibold text-surface-bg mb-1.5">
          Nombre
        </label>
        <input
          id="rp-name" type="text" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className={inputCls} autoComplete="given-name"
        />
      </div>

      <div>
        <label htmlFor="rp-company" className="block text-sm font-semibold text-surface-bg mb-1.5">
          Empresa
        </label>
        <input
          id="rp-company" type="text" value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Tu empresa"
          className={inputCls} autoComplete="organization"
        />
      </div>

      <div>
        <label htmlFor="rp-email" className="block text-sm font-semibold text-surface-bg mb-1.5">
          Email
        </label>
        <input
          id="rp-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          className={inputCls} autoComplete="email"
        />
      </div>

      <div className="rounded-[8px] bg-green-50 border border-green-500/20 px-4 py-3">
        <p className="text-sm leading-relaxed text-green-700">
          A continuación completarás un diagnóstico rápido de 10 minutos que nos ayuda a evaluar tu perfil.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox" checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-1 flex-shrink-0 accent-green-600"
        />
        <span className="text-sm leading-relaxed text-surface-bg/60">
          Acepto la{" "}
          <a
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline underline-offset-2 hover:text-green-800"
          >
            política de privacidad
          </a>
          {" "}y el tratamiento de mis datos.
        </span>
      </label>

      {error && (
        <p className="rounded-[6px] bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-[6px] bg-green-500 px-6 py-3 text-[0.9375rem] font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
      >
        {loading ? "Guardando..." : <>Continuar al diagnóstico <span aria-hidden>→</span></>}
      </button>
    </form>
  );
}
