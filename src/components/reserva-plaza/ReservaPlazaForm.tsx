"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = { locale: string };

const API_ENDPOINT = "/api/reserva-plaza.php";

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

      // Redirect to autodiagnostico with pre-filled data
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

  const inputCls = "w-full border border-[#D7D7D7] rounded-lg px-3 py-2.5 text-sm text-[#1C1E2E] placeholder:text-[#7B7C82] focus:outline-none focus:ring-2 focus:ring-[#359E52]/40 focus:border-[#359E52] transition-colors";

  const steps = [
    { n: "01", title: "Reservá tu plaza", body: "Dejanos tus datos y te reservamos el lugar." },
    { n: "02", title: "Hacé el diagnóstico", body: "Completás el autodiagnóstico de tu empresa en 10 minutos." },
    { n: "03", title: "Te confirmamos", body: "Revisamos tu perfil y te contactamos para confirmar." },
  ];

  return (
    <div style={{ background: "#E4F1CF" }} className="min-h-screen pb-16 pt-8">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[10px] border border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left panel */}
            <div className="p-8 lg:p-10 border-b md:border-b-0 md:border-r border-[#D7D7D7]">
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#127334] mb-4">
                Bootcamp Zero
              </p>
              <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#1C1E2E] leading-[1.2] tracking-[-0.02em] mb-2">
                Únete al Bootcamp Zero
              </h2>
              <p className="text-base font-semibold text-[#7B7C82] mb-5">
                Plazas limitadas · Selección real
              </p>
              <p className="text-[15px] text-[#7B7C82] leading-[1.65] mb-8">
                Reservá tu plaza y completá el diagnóstico. Analizamos tu perfil y te confirmamos si encajás con el programa.
              </p>
              <ol className="space-y-3">
                {steps.map(({ n, title, body }) => (
                  <li key={n} className="flex gap-4 rounded-lg border border-[#D7D7D7] px-5 py-4">
                    <span className="text-[1.125rem] font-bold text-[#127334] leading-[1.4] shrink-0 w-7">{n}.</span>
                    <div>
                      <p className="text-sm font-bold text-[#1C1E2E]">{title}</p>
                      <p className="text-sm text-[#7B7C82] leading-[1.55] mt-0.5">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right — form */}
            <div className="p-8 lg:p-10">
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#7B7C82] mb-2">
                Paso 1 de 2
              </p>
              <h3 className="text-xl font-semibold text-[#1C1E2E] mb-5">
                Tus datos
              </h3>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Honeypot */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" readOnly />

                <div>
                  <label htmlFor="rp-name" className="block text-sm font-semibold text-[#1C1E2E] mb-1">
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
                  <label htmlFor="rp-company" className="block text-sm font-semibold text-[#1C1E2E] mb-1">
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
                  <label htmlFor="rp-email" className="block text-sm font-semibold text-[#1C1E2E] mb-1">
                    Email
                  </label>
                  <input
                    id="rp-email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com"
                    className={inputCls} autoComplete="email"
                  />
                </div>

                <div className="rounded-lg bg-[#E4F1CF] border border-[#C3E195] px-4 py-3">
                  <p className="text-sm text-[#127334] leading-[1.5]">
                    A continuación completarás un diagnóstico rápido de 10 minutos que nos ayuda a evaluar tu perfil.
                  </p>
                </div>

                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox" checked={privacy}
                    onChange={(e) => setPrivacy(e.target.checked)}
                    className="mt-[3px] accent-[#359E52] flex-shrink-0"
                  />
                  <span className="text-sm text-[#7B7C82] leading-[1.5]">
                    Acepto la{" "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer"
                      className="text-[#127334] underline underline-offset-2">
                      política de privacidad
                    </a>
                    {" "}y el tratamiento de mis datos.
                  </span>
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-[#127334] hover:bg-[#0f5e2b] disabled:opacity-60 text-white font-semibold text-[15px] px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? "Guardando..." : <>Continuar al diagnóstico <span aria-hidden>→</span></>}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
