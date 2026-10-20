import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BootcampRetosForm } from "./BootcampRetosForm";
import { CHALLENGE_KEYS } from "./challenges";

// next-intl's Link needs the request/router context, which this unit does not
// exercise. The privacy link is plain navigation here.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const challenges = Object.fromEntries(
  CHALLENGE_KEYS.map((key) => [
    key,
    { title: `Titulo ${key}`, problem: `Problema ${key}`, want: `Deseo ${key}` },
  ]),
) as Parameters<typeof BootcampRetosForm>[0]["challenges"];

const other = { title: "Otro reto", problem: "Si tu reto no esta en la lista" };

const t = {
  challengesLegend: "Retos",
  wantLabel: "Quiero:",
  challengeOtherLabel: "Tengo otro reto",
  challengeOtherPlaceholder: "Cuentanos tu reto",
  contactCheck: "Me gustaria que me contactarais",
  contactIntro: "Para contactarte necesitamos tus datos:",
  fieldName: "Nombre y apellidos",
  fieldNamePlaceholder: "Tu nombre",
  fieldCompany: "Empresa",
  fieldCompanyPlaceholder: "Tu empresa",
  fieldEmail: "Correo",
  fieldEmailPlaceholder: "tu@empresa.com",
  checkPrivacy: "He leido y acepto la",
  checkPrivacyLink: "politica de privacidad",
  submit: "Enviar",
  submitting: "Enviando",
  errorChallenges: "Marca al menos un reto.",
  errorOtherEmpty: "Cuentanos cual es ese otro reto.",
  errorMissingPrefix: "Para contactarte, falta:",
  errorMissingName: "nombre",
  errorMissingCompany: "empresa",
  errorMissingEmail: "correo",
  errorEmail: "El correo no es valido.",
  errorPrivacy: "Para contactarte, falta aceptar la politica de privacidad.",
  errorGeneric: "No hemos podido guardar tu respuesta.",
  errorConnection: "No hemos podido conectar.",
  successTitle: "Gracias.",
  successBodyContact: "En breve nos pondremos en contacto contigo",
  successBodyNoContact: "Tus retos nos ayudan a preparar OpenLab",
  successBack: "Volver al formulario",
};

const HEADLINE = "¿Qué retos te gustaría resolver en tu empresa?";
const INTRO = "Marca uno o varios.";

function setup() {
  render(
    <BootcampRetosForm
      challenges={challenges}
      header={
        <>
          <h1>{HEADLINE}</h1>
          <p>{INTRO}</p>
        </>
      }
      locale="es"
      other={other}
      t={t}
    />,
  );
  return userEvent.setup();
}

const lastPayload = () => {
  const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
  const [, init] = fetchMock.mock.calls[0];
  return JSON.parse((init as RequestInit).body as string);
};

describe("BootcampRetosForm", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true }),
    })) as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders every challenge with its problem and what the visitor wants", () => {
    setup();

    for (const key of CHALLENGE_KEYS) {
      expect(screen.getByText(`Titulo ${key}`)).toBeTruthy();
      expect(screen.getByText(`Problema ${key}`)).toBeTruthy();
      expect(screen.getByText(`Deseo ${key}`, { exact: false })).toBeTruthy();
    }
    expect(screen.getByText(other.title)).toBeTruthy();
  });

  it("refuses a submission with no challenge selected", async () => {
    const user = setup();

    await user.click(screen.getByRole("button", { name: t.submit }));

    expect(screen.getByRole("alert").textContent).toBe(t.errorChallenges);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("hides the contact fields until the contact box is checked", async () => {
    const user = setup();

    expect(screen.queryByLabelText(`${t.fieldName} *`)).toBeNull();

    await user.click(screen.getByLabelText(t.contactCheck));

    expect(screen.getByLabelText(`${t.fieldName} *`)).toBeTruthy();
    expect(screen.getByLabelText(`${t.fieldCompany} *`)).toBeTruthy();
    expect(screen.getByLabelText(`${t.fieldEmail} *`)).toBeTruthy();
  });

  it("accepts an anonymous response: a challenge and no contact data", async () => {
    const user = setup();

    await user.click(screen.getByLabelText("Titulo predictive"));
    await user.click(screen.getByRole("button", { name: t.submit }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(lastPayload()).toMatchObject({
      challenges: ["predictive"],
      fullName: "",
      email: "",
      company: "",
      wantsContact: false,
      accepted: false,
    });
    expect(screen.getByText(t.successBodyNoContact)).toBeTruthy();
  });

  it("drops the question and its intro once the response is sent", async () => {
    const user = setup();

    expect(screen.getByText(HEADLINE)).toBeTruthy();
    expect(screen.getByText(INTRO)).toBeTruthy();

    await user.click(screen.getByLabelText("Titulo predictive"));
    await user.click(screen.getByRole("button", { name: t.submit }));

    await waitFor(() => expect(screen.getByText(t.successTitle)).toBeTruthy());
    expect(screen.queryByText(HEADLINE)).toBeNull();
    expect(screen.queryByText(INTRO)).toBeNull();

    // "Gracias." becomes the page's only h1 once the question is gone.
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(t.successTitle);
  });

  it("brings the question back when the visitor returns to the form", async () => {
    const user = setup();

    await user.click(screen.getByLabelText("Titulo predictive"));
    await user.click(screen.getByRole("button", { name: t.submit }));
    await waitFor(() => expect(screen.getByText(t.successTitle)).toBeTruthy());

    await user.click(screen.getByRole("button", { name: t.successBack }));

    expect(screen.getByText(HEADLINE)).toBeTruthy();
    expect(screen.getByText(INTRO)).toBeTruthy();
  });

  it("lists every missing contact field when contact was requested", async () => {
    const user = setup();

    await user.click(screen.getByLabelText("Titulo deviations"));
    await user.click(screen.getByLabelText(t.contactCheck));
    await user.click(screen.getByRole("button", { name: t.submit }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Para contactarte, falta: nombre, empresa, correo.",
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("requires the privacy consent only on the contact path", async () => {
    const user = setup();

    await user.click(screen.getByLabelText("Titulo deviations"));
    await user.click(screen.getByLabelText(t.contactCheck));
    await user.type(screen.getByLabelText(`${t.fieldName} *`), "Marta Garcia");
    await user.type(screen.getByLabelText(`${t.fieldCompany} *`), "Ejemplo SL");
    await user.type(screen.getByLabelText(`${t.fieldEmail} *`), "marta@ejemplo.com");
    await user.click(screen.getByRole("button", { name: t.submit }));

    expect(screen.getByRole("alert").textContent).toBe(t.errorPrivacy);

    await user.click(screen.getByLabelText(t.checkPrivacy, { exact: false }));
    await user.click(screen.getByRole("button", { name: t.submit }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(lastPayload()).toMatchObject({
      fullName: "Marta Garcia",
      company: "Ejemplo SL",
      email: "marta@ejemplo.com",
      wantsContact: true,
      accepted: true,
    });
    expect(screen.getByText(t.successBodyContact)).toBeTruthy();
  });

  it("rejects a malformed email on the contact path", async () => {
    const user = setup();

    await user.click(screen.getByLabelText("Titulo dashboards"));
    await user.click(screen.getByLabelText(t.contactCheck));
    await user.type(screen.getByLabelText(`${t.fieldName} *`), "Marta");
    await user.type(screen.getByLabelText(`${t.fieldCompany} *`), "Ejemplo SL");
    await user.type(screen.getByLabelText(`${t.fieldEmail} *`), "marta@ejemplo");
    await user.click(screen.getByRole("button", { name: t.submit }));

    expect(screen.getByRole("alert").textContent).toBe(t.errorEmail);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("asks for the free text when 'other' is the only thing checked", async () => {
    const user = setup();

    await user.click(screen.getByLabelText(other.title));
    await user.click(screen.getByRole("button", { name: t.submit }));

    expect(screen.getByRole("alert").textContent).toBe(t.errorOtherEmpty);

    await user.type(screen.getByPlaceholderText(t.challengeOtherPlaceholder), "Mi reto");
    await user.click(screen.getByRole("button", { name: t.submit }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(lastPayload()).toMatchObject({ challenges: [], challengeOther: "Mi reto" });
  });
});
