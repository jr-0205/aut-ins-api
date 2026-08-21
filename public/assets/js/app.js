import {
  careers,
  demoUsers,
  roleLabels,
  roleRoutes,
  SESSION_TIMEOUT_OPTIONS,
  store,
} from "./demo-store.js";
import { downloadCredentialPdf } from "./credential-pdf.js";

const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");
const modalRegion = document.querySelector("#modal-region");
const runtimeFiles = new Map();
let currentPreviewUrl = null;
let sessionWarningTimer = null;
let sessionExpiryTimer = null;
let lastActivitySync = 0;
const loginGuard = { failures: 0, blockedUntil: 0 };

const ACTIVITY_SYNC_INTERVAL_MS = 5 * 1000;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value, includeTime = false) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const applicantStatus = {
  PENDIENTE_DOCUMENTOS: ["Pendiente de documentos", "status-pending"],
  PENDIENTE_REVISION: ["Pendiente de revisión", "status-review"],
  OBSERVADO: ["Con observaciones", "status-observed"],
  ACEPTADO: ["Aceptado", "status-accepted"],
  RECHAZADO: ["Rechazado", "status-rejected"],
  CANCELADO: ["Cancelado", "status-neutral"],
};

const studentStatus = {
  ACTIVO: ["Activo", "status-active"],
  BAJA_TEMPORAL: ["Baja temporal", "status-temporary"],
  BAJA_DEFINITIVA: ["Baja definitiva", "status-inactive"],
  EGRESADO: ["Egresado", "status-neutral"],
};

const statusBadge = (status, type = "applicant") => {
  const dictionary = type === "student" ? studentStatus : applicantStatus;
  const [label, style] = dictionary[status] ?? [status, "status-neutral"];
  return `<span class="status-badge ${style}">${escapeHtml(label)}</span>`;
};

const documentStatus = {
  PENDIENTE: ["Pendiente", "status-review"],
  VALIDADO: ["Validado", "status-active"],
  OBSERVADO: ["Observado", "status-observed"],
  REEMPLAZADO: ["Reemplazado", "status-neutral"],
};

const documentStatusBadge = (status) => {
  const [label, style] = documentStatus[status] ?? [status, "status-neutral"];
  return `<span class="status-badge ${style}">${escapeHtml(label)}</span>`;
};

const formatBytes = (bytes = 0) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const showToast = (message, tone = "success") => {
  const id = `toast-${Date.now()}`;
  const border = tone === "danger" ? "border-danger" : tone === "warning" ? "border-warning" : "border-success";
  toastRegion.insertAdjacentHTML(
    "beforeend",
    `<div id="${id}" class="toast ${border}" role="status" aria-live="polite" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${escapeHtml(message)}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>`,
  );
  const element = document.querySelector(`#${id}`);
  if (window.bootstrap?.Toast) {
    const toast = new window.bootstrap.Toast(element, { delay: 4200 });
    element.addEventListener("hidden.bs.toast", () => element.remove(), { once: true });
    toast.show();
  }
};

const formatSessionDuration = (milliseconds) => {
  const seconds = Math.round(Number(milliseconds) / 1000);
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? "" : "s"}`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} minuto${minutes === 1 ? "" : "s"}`;
};

const sessionWarningLeadMs = (timeoutMs) =>
  Math.min(2 * 60 * 1000, Math.max(3 * 1000, Math.round(timeoutMs / 4)));

const hideSessionWarning = () => {
  const element = document.querySelector("#session-timeout-warning");
  if (!element) return;
  window.bootstrap?.Toast.getInstance(element)?.hide();
  element.remove();
};

const showSessionWarning = (warningLeadMs) => {
  if (document.querySelector("#session-timeout-warning")) return;
  toastRegion.insertAdjacentHTML(
    "beforeend",
    `<div id="session-timeout-warning" class="toast border-warning" role="status" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body"><strong>Tu sesión está por vencer.</strong><div class="small mt-1">Se cerrará en ${escapeHtml(formatSessionDuration(warningLeadMs))} si no detectamos actividad.</div></div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
      </div>
    </div>`,
  );
  const element = document.querySelector("#session-timeout-warning");
  if (window.bootstrap?.Toast) {
    new window.bootstrap.Toast(element, { autohide: false }).show();
  }
};

const clearSessionTimers = () => {
  if (sessionWarningTimer) window.clearTimeout(sessionWarningTimer);
  if (sessionExpiryTimer) window.clearTimeout(sessionExpiryTimer);
  sessionWarningTimer = null;
  sessionExpiryTimer = null;
  hideSessionWarning();
};

const closeSessionByInactivity = () => {
  clearSessionTimers();
  store.logout();
  window.location.hash = "#/login";
  route();
  showToast("La sesión se cerró por inactividad. Ingresa nuevamente para continuar.", "warning");
};

const scheduleSessionTimers = (session = store.getSession()) => {
  clearSessionTimers();
  if (!session) return;

  const timeoutMs = store.getSessionIdleTimeoutMs();
  const warningLeadMs = sessionWarningLeadMs(timeoutMs);
  const elapsed = Math.max(0, Date.now() - Number(session.lastActivityAt ?? Date.now()));
  const remaining = timeoutMs - elapsed;
  if (remaining <= 0) {
    closeSessionByInactivity();
    return;
  }

  const warningDelay = remaining - warningLeadMs;
  if (warningDelay <= 0) showSessionWarning(Math.max(1000, remaining));
  else sessionWarningTimer = window.setTimeout(() => showSessionWarning(warningLeadMs), warningDelay);

  sessionExpiryTimer = window.setTimeout(closeSessionByInactivity, remaining);
};

const registerSessionActivity = () => {
  const now = Date.now();
  if (now - lastActivitySync < ACTIVITY_SYNC_INTERVAL_MS) return;

  const session = store.refreshSessionActivity();
  if (!session) {
    if (window.location.hash.startsWith("#/panel/")) closeSessionByInactivity();
    return;
  }

  lastActivitySync = now;
  scheduleSessionTimers(session);
};

const validateVisibleSession = () => {
  const session = store.getSession();
  if (session) {
    scheduleSessionTimers(session);
    return;
  }

  clearSessionTimers();
  if (window.location.hash.startsWith("#/panel/")) closeSessionByInactivity();
};

const showModal = (title, body, footer = "", dialogClass = "modal-lg") => {
  modalRegion.innerHTML = `
    <div class="modal fade" id="action-modal" tabindex="-1" aria-labelledby="action-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered ${dialogClass}">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="action-modal-title">${escapeHtml(title)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">${body}</div>
          ${footer ? `<div class="modal-footer">${footer}</div>` : ""}
        </div>
      </div>
    </div>`;
  const element = document.querySelector("#action-modal");
  const modal = window.bootstrap?.Modal ? new window.bootstrap.Modal(element) : null;
  element.addEventListener(
    "hidden.bs.modal",
    () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = null;
      }
      modalRegion.innerHTML = "";
    },
    { once: true },
  );
  modal?.show();
  return modal;
};

const openSessionSettings = () => {
  const currentTimeout = store.getSessionIdleTimeoutMs();
  const options = SESSION_TIMEOUT_OPTIONS
    .map((option) => `<option value="${option.value}" ${option.value === currentTimeout ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");

  showModal(
    "Configuración de sesión",
    `<form id="session-settings-form">
      <div class="mb-3"><label class="form-label" for="session-timeout">Vigencia de la sesión</label><select class="form-select" id="session-timeout" name="timeout" required>${options}</select></div>
      <div class="alert alert-info small mb-0"><strong>Configuración para demostración.</strong><div class="mt-1">Las opciones cortas permiten mostrar el cierre automático sin esperar 15 minutos. Actualmente simulan la vigencia del token en el navegador; cuando se implemente JWT, el servidor deberá validar la expiración real.</div></div>
    </form>`,
    `<button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-aut-primary" type="submit" form="session-settings-form">Guardar configuración</button>`,
    "modal-md",
  );
};

const documentStatusOptions = (selected) =>
  Object.entries(documentStatus)
    .filter(([value]) => value !== "REEMPLAZADO")
    .map(([value, [label]]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");

const applicantDocuments = (applicant) =>
  Array.isArray(applicant.documents) ? applicant.documents : [];

const renderDocumentRows = (applicant, editable) => {
  const documents = applicantDocuments(applicant);
  if (!documents.length) {
    return `<tr><td colspan="6" class="empty-state py-4">El aspirante todavía no ha enviado documentos.</td></tr>`;
  }

  return documents
    .map(
      (document) => `<tr>
        <td><strong>${escapeHtml(document.type)}</strong><small class="d-block text-secondary">${escapeHtml(document.fileName)}</small></td>
        <td>${escapeHtml(document.mimeType || "Archivo")}</td>
        <td>${formatBytes(document.size)}</td>
        <td>${
          editable
            ? `<select class="form-select form-select-sm" name="documentStatus-${escapeHtml(document.id)}" data-document-status data-document-id="${escapeHtml(document.id)}">${documentStatusOptions(document.status)}</select>`
            : documentStatusBadge(document.status)
        }</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-secondary" type="button" data-action="preview-document" data-applicant-id="${applicant.id}" data-document-id="${escapeHtml(document.id)}">Visualizar</button></td>
      </tr>`,
    )
    .join("");
};

const applicantRecordBody = (applicant, editable) => {
  const details = `
    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
      <div><span class="data-label">Folio del expediente</span><strong class="fs-5 font-monospace">${escapeHtml(applicant.folio)}</strong></div>
      ${statusBadge(applicant.status)}
    </div>
    <section class="record-section mb-4">
      <h3 class="record-section-title">Información enviada por el aspirante</h3>
      <div class="row g-3">
        <div class="col-md-6"><span class="data-label">Nombre completo</span><span class="data-value">${escapeHtml(`${applicant.firstName} ${applicant.lastName}`)}</span></div>
        <div class="col-md-6"><span class="data-label">CURP</span><span class="data-value font-monospace">${escapeHtml(applicant.curp)}</span></div>
        <div class="col-md-6"><span class="data-label">Correo electrónico</span><span class="data-value">${escapeHtml(applicant.email)}</span></div>
        <div class="col-md-6"><span class="data-label">Teléfono</span><span class="data-value">${escapeHtml(applicant.phone)}</span></div>
        <div class="col-md-8"><span class="data-label">Carrera solicitada</span><span class="data-value">${escapeHtml(applicant.career)}</span></div>
        <div class="col-md-4"><span class="data-label">Fecha de envío</span><span class="data-value">${formatDate(applicant.submittedAt, true)}</span></div>
      </div>
    </section>
    <section class="record-section mb-4">
      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h3 class="record-section-title mb-0">Expediente documental</h3>
        <span class="text-secondary small">${applicantDocuments(applicant).length} archivos enviados</span>
      </div>
      <div class="table-responsive">
        <table class="table table-sm align-middle document-table">
          <thead><tr><th>Documento</th><th>Formato</th><th>Tamaño</th><th>Revisión</th><th><span class="visually-hidden">Acción</span></th></tr></thead>
          <tbody>${renderDocumentRows(applicant, editable)}</tbody>
        </table>
      </div>
      <div id="document-preview-panel" class="document-preview-panel mt-3" aria-live="polite">
        <div class="text-secondary small text-center py-3">Selecciona “Visualizar” para revisar un archivo.</div>
      </div>
    </section>`;

  if (!editable) {
    return `${details}<section class="record-section"><h3 class="record-section-title">Observaciones de Admisiones</h3><p class="mb-0 ${applicant.observations ? "" : "text-secondary"}">${escapeHtml(applicant.observations || "Sin observaciones registradas.")}</p></section>`;
  }

  return `<form id="review-form">
    <input type="hidden" name="id" value="${applicant.id}">
    ${details}
    <section class="record-section">
      <h3 class="record-section-title">Dictamen de Admisiones</h3>
      <div id="review-error"></div>
      <div class="row g-3">
        <div class="col-md-5"><label class="form-label" for="review-status">Resultado del dictamen</label><select class="form-select" id="review-status" name="status" required><option value="PENDIENTE_REVISION" ${applicant.status === "PENDIENTE_REVISION" ? "selected" : ""}>Pendiente de revisión</option><option value="OBSERVADO" ${applicant.status === "OBSERVADO" ? "selected" : ""}>Con observaciones</option><option value="ACEPTADO" ${applicant.status === "ACEPTADO" ? "selected" : ""}>Aceptado</option><option value="RECHAZADO" ${applicant.status === "RECHAZADO" ? "selected" : ""}>Rechazado</option></select></div>
        <div class="col-md-7"><label class="form-label" for="review-observations">Motivos u observaciones</label><textarea class="form-control" id="review-observations" name="observations" rows="3" maxlength="500">${escapeHtml(applicant.observations)}</textarea></div>
        <div class="col-12 text-end"><button class="btn btn-aut-primary" type="submit">Guardar revisión y dictamen</button></div>
      </div>
    </section>
  </form>`;
};

const openApplicantRecord = (applicant, editable = false) =>
  showModal(
    editable ? `Revisión integral · ${applicant.folio}` : `Expediente aceptado · ${applicant.folio}`,
    applicantRecordBody(applicant, editable),
    "",
    "modal-xl modal-dialog-scrollable",
  );

const publicNavigation = () => `
  <nav class="navbar navbar-expand-md public-navbar fixed-top">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="#/inicio" aria-label="AUT-INS, inicio">
        <img class="brand-logo" src="/assets/img/aut-ins-logo.svg" alt="" aria-hidden="true">
        <span class="brand-title">AUT-INS</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#public-nav" aria-controls="public-nav" aria-expanded="false" aria-label="Mostrar navegación">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="public-nav">
        <div class="navbar-nav ms-auto align-items-md-center gap-md-2 pt-3 pt-md-0">
          <a class="nav-link" href="#/inicio">Inicio</a>
          <a class="nav-link" href="#/solicitud">Solicitud de ingreso</a>
          <a class="btn btn-aut-primary ms-md-2 px-3" href="#/login">Iniciar sesión</a>
        </div>
      </div>
    </div>
  </nav>`;

const publicFooter = () => `
  <footer class="public-footer">
    <div class="container d-flex flex-column flex-md-row gap-2 justify-content-between">
      <span>AUT-INS · Administración y Control de Inscripciones Escolares</span>
      <span>Entorno académico de demostración · 2026</span>
    </div>
  </footer>`;

const renderLanding = () => `
  ${publicNavigation()}
  <main id="main-content">
    <section class="hero-section">
      <div class="container position-relative">
        <div class="row g-5 align-items-center">
          <div class="col-lg-7">
            <span class="eyebrow">Proceso digital de ingreso</span>
            <h1 class="hero-title">Tu inscripción, clara desde el primer paso.</h1>
            <p class="hero-copy">AUT-INS reúne el pre-registro, la revisión documental, el enrolamiento y la consulta escolar en una sola plataforma sencilla y trazable.</p>
            <div class="d-flex flex-column flex-sm-row gap-3 mt-4">
              <a class="btn btn-light btn-lg px-4 fw-bold" href="#/solicitud">Crear solicitud</a>
              <a class="btn btn-outline-light btn-lg px-4" href="#/login">Entrar al sistema</a>
            </div>
            <div class="d-flex flex-wrap gap-4 mt-5 text-white-50 small">
              <span>Folio único</span>
              <span>Seguimiento de estatus</span>
              <span>Mensajería institucional</span>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="hero-card">
              <div class="hero-card-inner">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="text-uppercase text-secondary fw-bold small">Ruta del aspirante</span>
                    <h2 class="h4 section-title mt-1">Un proceso ordenado</h2>
                  </div>
                  <span class="brand-mark">01</span>
                </div>
                <div class="mini-step">
                  <span class="step-number">01</span>
                  <div><strong>Registra tu solicitud</strong><small class="d-block text-secondary mt-1">Captura tus datos y selecciona una carrera.</small></div>
                </div>
                <div class="mini-step">
                  <span class="step-number">02</span>
                  <div><strong>Completa tu expediente</strong><small class="d-block text-secondary mt-1">Adjunta la documentación solicitada.</small></div>
                </div>
                <div class="mini-step">
                  <span class="step-number">03</span>
                  <div><strong>Recibe tu resultado</strong><small class="d-block text-secondary mt-1">Consulta el dictamen y continúa tu enrolamiento.</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="container">
        <div class="row align-items-end mb-4">
          <div class="col-lg-7">
            <span class="text-uppercase text-primary fw-bold small">Una plataforma, cuatro experiencias</span>
            <h2 class="display-6 section-title mt-2">Información relevante para cada usuario</h2>
          </div>
          <div class="col-lg-5"><p class="section-copy mb-0">Cada rol accede únicamente a las tareas que le corresponden, manteniendo el proceso comprensible y el historial disponible.</p></div>
        </div>
        <div class="row g-3">
          ${[
            ["AD", "Admisiones", "Revisa expedientes y comunica observaciones o dictámenes."],
            ["CE", "Control Escolar", "Formaliza el enrolamiento y administra el estado del alumno."],
            ["CA", "Coordinación", "Organiza grupos, capacidad y asignaciones académicas."],
            ["AL", "Alumno", "Consulta su perfil, grupo y mensajes institucionales."],
          ]
            .map(
              ([icon, title, copy]) => `<div class="col-md-6 col-xl-3">
                <article class="feature-card">
                  <span class="feature-icon">${icon}</span>
                  <h3 class="h5 section-title">${title}</h3>
                  <p class="section-copy small mb-0">${copy}</p>
                </article>
              </div>`,
            )
            .join("")}
        </div>
      </div>
    </section>
  </main>
  ${publicFooter()}`;

const renderLogin = () => `
  <main id="main-content" class="page-shell d-flex align-items-center">
    <div class="container">
      <div class="mb-3">
        <a class="text-decoration-none fw-semibold" href="#/inicio">← Volver al inicio</a>
      </div>
      <div class="auth-card">
        <div class="row g-0">
          <div class="col-lg-5">
            <section class="pattern-panel d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex align-items-center gap-3 mb-5"><img class="brand-logo brand-logo-login" src="/assets/img/aut-ins-logo.svg" alt="" aria-hidden="true"><span class="fw-bold fs-5">AUT-INS</span></div>
                <span class="eyebrow">Acceso institucional</span>
                <h1 class="display-5 fw-bold lh-1 mb-3">Bienvenido de nuevo.</h1>
                <p class="text-white-50 lh-lg">El sistema identificará tu rol y abrirá el espacio de trabajo correspondiente.</p>
              </div>
              <small class="text-white-50">Las credenciales mostradas son exclusivas del entorno de demostración.</small>
            </section>
          </div>
          <div class="col-lg-7">
            <section class="auth-form-panel">
              <span class="text-uppercase text-primary fw-bold small">Inicio de sesión</span>
              <h2 class="section-title h3 mt-2 mb-1">Ingresa a tu cuenta</h2>
              <p class="text-secondary mb-4">Utiliza tu correo institucional o matrícula.</p>
              <div id="login-alert" aria-live="polite"></div>
              <form id="login-form" class="row g-3" novalidate>
                <div class="col-12">
                  <label class="form-label" for="login">Correo o matrícula</label>
                  <input class="form-control" id="login" name="login" autocomplete="username" minlength="3" maxlength="120" required>
                </div>
                <div class="col-12">
                  <label class="form-label" for="password">Contraseña</label>
                  <input class="form-control" id="password" name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required>
                </div>
                <div class="col-12 d-grid mt-4">
                  <button class="btn btn-aut-primary btn-lg" type="submit">Continuar</button>
                </div>
              </form>

              <details class="demo-access mt-4">
                <summary>Accesos discretos para probar cada departamento</summary>
                <div class="demo-grid">
                  ${demoUsers
                    .map(
                      (user) => `<div class="demo-user">
                        <div><strong class="small">${escapeHtml(roleLabels[user.role])}</strong><small>${escapeHtml(user.login)} · ${escapeHtml(user.password)}</small></div>
                        <button class="btn btn-sm btn-aut-soft" type="button" data-action="use-demo" data-login="${escapeHtml(user.login)}">Usar acceso</button>
                      </div>`,
                    )
                    .join("")}
                  <button class="btn btn-link btn-sm text-secondary" type="button" data-action="reset-demo">Restablecer información de demostración</button>
                </div>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>`;

const careerOptions = (selected = "") => careers
  .map((career) => `<option value="${escapeHtml(career)}" ${career === selected ? "selected" : ""}>${escapeHtml(career)}</option>`)
  .join("");

const renderApplication = () => `
  ${publicNavigation()}
  <main id="main-content" class="pt-5">
    <div class="container py-5 mt-4">
      <section class="page-banner mb-4">
        <span class="eyebrow">Pre-registro público</span>
        <h1 class="display-6 fw-bold mb-2">Solicitud de ingreso</h1>
        <p class="mb-0 text-white-50">Captura la información del aspirante. Al finalizar se generará un folio para el seguimiento.</p>
      </section>
      <div class="surface-card">
        <div class="surface-card-header">
          <div><h2 class="surface-card-title">Datos del aspirante</h2><small class="text-secondary">Los campos marcados son obligatorios.</small></div>
          <span class="status-badge status-review">Paso 1 de 1</span>
        </div>
        <div class="surface-card-body p-lg-4">
          <div id="application-alert" aria-live="polite"></div>
          <form id="application-form" class="row g-3" novalidate>
            <div class="col-md-4">
              <label class="form-label" for="first-name">Nombre(s) *</label>
              <input class="form-control" id="first-name" name="firstName" maxlength="80" required>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="last-name">Apellido paterno *</label>
              <input class="form-control" id="last-name" name="lastName" maxlength="80" required>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="second-last-name">Apellido materno</label>
              <input class="form-control" id="second-last-name" name="secondLastName" maxlength="80">
            </div>
            <div class="col-md-6">
              <label class="form-label" for="curp">CURP *</label>
              <input class="form-control text-uppercase" id="curp" name="curp" minlength="18" maxlength="18" pattern="[A-Z0-9]{18}" autocomplete="off" required>
              <div class="form-text">Debe contener exactamente 18 caracteres.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="career">Carrera de interés *</label>
              <select class="form-select" id="career" name="career" required><option value="">Selecciona una opción</option>${careerOptions()}</select>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="email">Correo electrónico *</label>
              <input class="form-control" id="email" name="email" type="email" autocomplete="email" required>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="phone">Teléfono *</label>
              <input class="form-control" id="phone" name="phone" type="tel" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" required>
            </div>
            <div class="col-12">
              <label class="form-label" for="documents">Documentación digital</label>
              <input class="form-control" id="documents" name="documents" type="file" multiple accept=".pdf,.jpg,.jpeg,.png">
              <div class="form-text">Para esta demostración se registra el número de archivos; el almacenamiento real se conectará con la API.</div>
            </div>
            <div class="col-12 form-check ms-2 mt-4">
              <input class="form-check-input" type="checkbox" id="privacy" required>
              <label class="form-check-label small text-secondary" for="privacy">Confirmo que la información proporcionada es correcta y autorizo su revisión para el proceso de admisión.</label>
            </div>
            <div class="col-12 d-flex flex-column flex-sm-row gap-2 justify-content-end mt-4">
              <a class="btn btn-outline-secondary px-4" href="#/inicio">Cancelar</a>
              <button class="btn btn-aut-primary px-4" type="submit">Registrar solicitud</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
  ${publicFooter()}`;

const roleNavItems = {
  ADMISIONES: [["Resumen", "#resumen"], ["Solicitudes", "#solicitudes"]],
  CONTROL_ESCOLAR: [["Resumen", "#resumen"], ["Enrolamiento", "#enrolamiento"], ["Alumnos", "#alumnos"], ["Mensajes", "#mensajes"]],
  COORDINACION: [["Resumen", "#resumen"], ["Grupos", "#grupos"], ["Asignaciones", "#asignaciones"], ["Mensajes", "#mensajes"]],
  ALUMNO: [["Mi información", "#perfil"], ["Inscripción", "#inscripcion"], ["Mensajes", "#mensajes"]],
};

const dashboardShell = (session, content) => {
  const navItems = roleNavItems[session.role] ?? [];
  const requestedSection = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("section");
  const availableSections = navItems.map(([, target]) => target.slice(1));
  const activeSection = availableSections.includes(requestedSection) ? requestedSection : availableSections[0];

  return `<div class="dashboard-layout">
    <aside class="sidebar">
      <a class="d-flex align-items-center gap-2 text-decoration-none" href="#/panel/${roleRoutes[session.role]}">
        <img class="brand-logo brand-logo-sidebar" src="/assets/img/aut-ins-logo.svg" alt="" aria-hidden="true"><span class="brand-title">AUT-INS</span>
      </a>
      <span class="role-chip">${escapeHtml(roleLabels[session.role])}</span>
      <nav class="sidebar-nav" aria-label="Secciones del panel">
        ${navItems
          .map(([label, target]) => {
            const section = target.slice(1);
            return `<a class="${section === activeSection ? "active" : ""}" href="#/panel/${roleRoutes[session.role]}?section=${encodeURIComponent(section)}"><span class="nav-dot"></span>${escapeHtml(label)}</a>`;
          })
          .join("")}
      </nav>
      <div class="sidebar-user">
        <div class="d-flex gap-2 align-items-center">
          <span class="brand-mark">${escapeHtml(initials(session.name))}</span>
          <div class="min-w-0"><strong class="d-block small text-white text-truncate">${escapeHtml(session.name)}</strong><small class="text-white-50 d-block text-truncate">${escapeHtml(session.area)}</small></div>
        </div>
        <button class="btn btn-sm btn-outline-light mt-3" type="button" data-action="logout">Cerrar sesión</button>
      </div>
    </aside>
    <main id="main-content" class="dashboard-main">
      <header class="dashboard-topbar">
        <div><span class="text-secondary small">Panel de trabajo</span><h1 class="dashboard-title">${escapeHtml(roleLabels[session.role])}</h1></div>
        <div class="d-flex flex-wrap justify-content-end align-items-center gap-2"><button class="btn btn-sm btn-outline-secondary" type="button" data-action="session-settings">Sesión: ${escapeHtml(formatSessionDuration(store.getSessionIdleTimeoutMs()))}</button><span class="demo-mode-label">Entorno de demostración</span></div>
      </header>
      ${content}
    </main>
  </div>`;
};

const metric = (label, value, hint) => `<div class="col-sm-6 col-xl-3"><article class="metric-card"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div><small class="text-secondary">${escapeHtml(hint)}</small></article></div>`;

const coordinatorRecipients = () => demoUsers.filter((user) => user.role === "COORDINACION");

const messageRecipientLabel = (message) => {
  if (message.recipientKind === "DEPARTMENT") return "Departamento de Control Escolar";
  const user = demoUsers.find((candidate) => candidate.id === message.recipientUserId);
  return user ? `${user.name} · ${roleLabels[user.role]}` : roleLabels[message.recipientRole] ?? "Personal escolar";
};

const messageSenderLabel = (message) => {
  const user = demoUsers.find((candidate) => candidate.id === message.senderUserId);
  return user?.name ?? roleLabels[message.sender] ?? message.sender.replaceAll("_", " ");
};

const messagesForStaff = (session, state) => state.messages
  .filter((message) => {
    if (message.sender !== "ALUMNO") return false;
    if (session.role === "CONTROL_ESCOLAR") {
      return message.recipientKind === "DEPARTMENT" && message.recipientRole === "CONTROL_ESCOLAR";
    }
    return message.recipientKind === "USER" && message.recipientUserId === session.id;
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const renderStaffInbox = (session, state) => {
  const messages = messagesForStaff(session, state);
  const visibilityText = session.role === "CONTROL_ESCOLAR"
    ? "Bandeja compartida: el mensaje es visible para todo el personal con el rol Control Escolar."
    : "Bandeja personal: aquí aparecen únicamente los mensajes enviados directamente a este coordinador.";

  return `<section id="mensajes" class="surface-card">
    <div class="surface-card-header"><div><h2 class="surface-card-title">Mensajes de alumnos</h2><small class="text-secondary">${escapeHtml(visibilityText)}</small></div><span class="status-badge status-review">${messages.length} mensajes</span></div>
    <div class="surface-card-body">
      <div class="message-list">
        ${messages.map((message) => {
          const student = state.students.find((candidate) => candidate.id === Number(message.studentId));
          return `<article class="message-item">
            <div class="message-meta"><div><strong>${escapeHtml(student?.name ?? "Alumno")}</strong>${student ? `<span class="d-block font-monospace">${escapeHtml(student.registration)}</span>` : ""}</div><time>${formatDate(message.createdAt, true)}</time></div>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2"><strong>${escapeHtml(message.subject)}</strong><span class="status-badge ${message.recipientKind === "DEPARTMENT" ? "status-active" : "status-neutral"}">${message.recipientKind === "DEPARTMENT" ? "Para el departamento" : "Mensaje directo"}</span></div>
            <p class="mb-0 small">${escapeHtml(message.body)}</p>
          </article>`;
        }).join("") || `<div class="empty-state">Todavía no hay mensajes dirigidos a esta bandeja.</div>`}
      </div>
    </div>
  </section>`;
};

const renderAdmissionsPanel = (session, state) => {
  const pending = state.applicants.filter((item) => item.status === "PENDIENTE_REVISION").length;
  const observed = state.applicants.filter((item) => item.status === "OBSERVADO").length;
  const accepted = state.applicants.filter((item) => item.status === "ACEPTADO").length;
  const today = state.applicants.filter((item) => new Date(item.submittedAt).toDateString() === new Date().toDateString()).length;
  const rows = state.applicants
    .map(
      (item) => `<tr data-applicant-row data-search="${escapeHtml(`${item.folio} ${item.firstName} ${item.lastName} ${item.curp}`.toLowerCase())}" data-status="${item.status}">
        <td><strong>${escapeHtml(item.folio)}</strong><small class="d-block text-secondary">${formatDate(item.submittedAt)}</small></td>
        <td>${escapeHtml(`${item.firstName} ${item.lastName}`)}<small class="d-block text-secondary font-monospace">${escapeHtml(item.curp)}</small></td>
        <td><span class="d-inline-block text-truncate" style="max-width: 16rem">${escapeHtml(item.career)}</span></td>
        <td>${applicantDocuments(item).length || item.documentCount || 0}</td>
        <td>${statusBadge(item.status)}</td>
        <td class="text-end"><button class="btn btn-sm btn-aut-soft" type="button" data-action="review-applicant" data-id="${item.id}">Revisar expediente</button></td>
      </tr>`,
    )
    .join("");

  return dashboardShell(session, `
    <section id="resumen" class="row g-3 mb-4">
      ${metric("Pendientes", pending, "Listos para revisión")}
      ${metric("Observados", observed, "Esperando corrección")}
      ${metric("Aceptados", accepted, "Aptos para enrolamiento")}
      ${metric("Nuevos hoy", today, "Solicitudes recibidas")}
    </section>
    <section id="solicitudes" class="surface-card">
      <div class="surface-card-header">
        <div><h2 class="surface-card-title">Bandeja de solicitudes</h2><small class="text-secondary">Revisión documental y emisión de dictamen.</small></div>
        <div class="d-flex gap-2 flex-wrap">
          <input class="form-control form-control-sm" id="applicant-search" type="search" placeholder="Buscar folio, nombre o CURP" aria-label="Buscar solicitudes">
          <select class="form-select form-select-sm" id="applicant-status-filter" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE_REVISION">Pendientes</option>
            <option value="OBSERVADO">Observados</option>
            <option value="ACEPTADO">Aceptados</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead><tr><th>Folio</th><th>Aspirante</th><th>Carrera</th><th>Docs.</th><th>Estado</th><th><span class="visually-hidden">Acciones</span></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="6" class="empty-state">No hay solicitudes registradas.</td></tr>`}</tbody>
        </table>
      </div>
    </section>`);
};

const studentStateOptions = (selected) => Object.entries(studentStatus)
  .map(([value, [label]]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
  .join("");

const credentialModalBody = (student, justGenerated = false) => `
  <div class="credential-summary">
    <div class="d-flex align-items-start justify-content-between gap-3 mb-4">
      <div><span class="eyebrow text-primary">${justGenerated ? "Enrolamiento concluido" : "Acceso del alumno"}</span><h3 class="section-title h4 mt-2 mb-1">${escapeHtml(student.name)}</h3><p class="text-secondary mb-0">${escapeHtml(student.career)}</p></div>
      <span class="feature-icon flex-shrink-0">ID</span>
    </div>
    <div class="credential-grid">
      <div><span class="data-label">Matrícula</span><span class="data-value font-monospace fs-5">${escapeHtml(student.registration)}</span></div>
      <div><span class="data-label">Contraseña temporal</span><span class="data-value font-monospace fs-5">${escapeHtml(student.temporaryPassword)}</span></div>
    </div>
    <div class="alert alert-warning small mb-0 mt-4">El PDF contiene información confidencial. Entrégalo únicamente al alumno y solicita el cambio de contraseña durante su primer acceso.</div>
  </div>`;

const credentialModalFooter = (student) => `
  <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cerrar</button>
  <button class="btn btn-aut-primary" type="button" data-action="download-credentials" data-id="${student.id}">Descargar PDF de acceso</button>`;

const openStudentCredentials = (student, justGenerated = false) =>
  showModal(
    justGenerated ? "Matrícula y contraseña generadas" : "Credenciales de acceso",
    credentialModalBody(student, justGenerated),
    credentialModalFooter(student),
  );

const renderControlPanel = (session, state) => {
  const accepted = state.applicants.filter((item) => item.status === "ACEPTADO" && !item.enrolledStudentId);
  const active = state.students.filter((item) => item.status === "ACTIVO").length;
  const temporary = state.students.filter((item) => item.status === "BAJA_TEMPORAL").length;
  const pendingRows = accepted.map((item) => `<tr><td><strong>${escapeHtml(item.folio)}</strong></td><td>${escapeHtml(`${item.firstName} ${item.lastName}`)}<small class="d-block text-secondary font-monospace">${escapeHtml(item.curp)}</small></td><td>${escapeHtml(item.career)}</td><td class="text-end"><div class="btn-group btn-group-sm"><button class="btn btn-outline-secondary" type="button" data-action="view-applicant-record" data-id="${item.id}">Ver expediente</button><button class="btn btn-aut-primary" type="button" data-action="enrol-applicant" data-id="${item.id}">Generar matrícula</button></div></td></tr>`).join("");
  const studentRows = state.students.map((student) => `<tr><td><strong class="font-monospace">${escapeHtml(student.registration)}</strong></td><td>${escapeHtml(student.name)}<small class="d-block text-secondary">${escapeHtml(student.email)}</small></td><td>${escapeHtml(student.career)}</td><td><select class="form-select form-select-sm" data-action="student-status" data-id="${student.id}" aria-label="Estado de ${escapeHtml(student.name)}">${studentStateOptions(student.status)}</select></td><td class="text-end"><button class="btn btn-sm btn-outline-secondary" type="button" data-action="show-student-access" data-id="${student.id}">Acceso y PDF</button></td></tr>`).join("");

  return dashboardShell(session, `
    <section id="resumen" class="row g-3 mb-4">
      ${metric("Por enrolar", accepted.length, "Expedientes aceptados")}
      ${metric("Alumnos activos", active, "Con relación vigente")}
      ${metric("Bajas temporales", temporary, "Expedientes suspendidos")}
      ${metric("Total histórico", state.students.length, "Sin eliminar registros")}
    </section>
    <section id="enrolamiento" class="surface-card mb-4">
      <div class="surface-card-header"><div><h2 class="surface-card-title">Enrolamiento pendiente</h2><small class="text-secondary">Genera matrícula y acceso inicial únicamente para aspirantes aceptados.</small></div></div>
      <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Folio</th><th>Aspirante</th><th>Carrera</th><th><span class="visually-hidden">Acción</span></th></tr></thead><tbody>${pendingRows || `<tr><td colspan="4" class="empty-state">No hay expedientes pendientes de enrolamiento.</td></tr>`}</tbody></table></div>
    </section>
    <section id="alumnos" class="surface-card mb-4">
      <div class="surface-card-header"><div><h2 class="surface-card-title">Administración de alumnos</h2><small class="text-secondary">Consulta y actualización de la situación escolar.</small></div></div>
      <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Matrícula</th><th>Alumno</th><th>Carrera</th><th>Estado</th><th><span class="visually-hidden">Acción</span></th></tr></thead><tbody>${studentRows}</tbody></table></div>
    </section>
    ${renderStaffInbox(session, state)}`);
};

const renderCoordinationPanel = (session, state) => {
  const activeGroups = state.groups.filter((group) => group.active);
  const assigned = state.students.filter((student) => student.groupId && student.status === "ACTIVO").length;
  const capacity = activeGroups.reduce((total, group) => total + group.capacity, 0);
  const groupRows = state.groups.map((group) => {
    const occupied = state.students.filter((student) => student.groupId === group.id && student.status === "ACTIVO").length;
    return `<tr><td><strong>${escapeHtml(group.code)}</strong><small class="d-block text-secondary">${escapeHtml(group.period)}</small></td><td>${escapeHtml(group.career)}</td><td>${escapeHtml(group.shift)}</td><td>${occupied} / ${group.capacity}</td><td>${group.active ? `<span class="status-badge status-active">Activo</span>` : `<span class="status-badge status-inactive">Inactivo</span>`}</td><td class="text-end"><div class="btn-group btn-group-sm"><button class="btn btn-outline-secondary" type="button" data-action="edit-group" data-id="${group.id}">Editar</button><button class="btn btn-outline-secondary" type="button" data-action="toggle-group" data-id="${group.id}">${group.active ? "Desactivar" : "Activar"}</button></div></td></tr>`;
  }).join("");
  const assignRows = state.students.filter((student) => student.status === "ACTIVO").map((student) => {
    const compatible = activeGroups.filter((group) => group.career === student.career);
    return `<tr><td><strong>${escapeHtml(student.name)}</strong><small class="d-block text-secondary font-monospace">${escapeHtml(student.registration)}</small></td><td>${escapeHtml(student.career)}</td><td><select class="form-select form-select-sm" id="student-group-${student.id}"><option value="">Sin asignar</option>${compatible.map((group) => `<option value="${group.id}" ${student.groupId === group.id ? "selected" : ""}>${escapeHtml(group.code)} · ${escapeHtml(group.shift)}</option>`).join("")}</select></td><td class="text-end"><button class="btn btn-sm btn-aut-soft" type="button" data-action="assign-group" data-id="${student.id}">Guardar</button></td></tr>`;
  }).join("");

  return dashboardShell(session, `
    <section id="resumen" class="row g-3 mb-4">
      ${metric("Grupos activos", activeGroups.length, "Periodo AGO-DIC 2026")}
      ${metric("Alumnos asignados", assigned, "Con grupo confirmado")}
      ${metric("Capacidad total", capacity, "Lugares disponibles")}
      ${metric("Sin grupo", state.students.filter((student) => !student.groupId && student.status === "ACTIVO").length, "Requieren asignación")}
    </section>
    <section id="grupos" class="surface-card mb-4">
      <div class="surface-card-header"><div><h2 class="surface-card-title">Catálogo de grupos</h2><small class="text-secondary">Alta y actualización de grupos con control de capacidad.</small></div></div>
      <div class="surface-card-body border-bottom">
        <form id="group-form" class="row g-3 align-items-end">
          <input type="hidden" name="id" id="group-id">
          <div class="col-md-2"><label class="form-label" for="group-code">Clave</label><input class="form-control" id="group-code" name="code" maxlength="20" required></div>
          <div class="col-md-4"><label class="form-label" for="group-career">Carrera</label><select class="form-select" id="group-career" name="career" required>${careerOptions()}</select></div>
          <div class="col-md-2"><label class="form-label" for="group-period">Periodo</label><input class="form-control" id="group-period" name="period" value="AGO-DIC 2026" required></div>
          <div class="col-md-2"><label class="form-label" for="group-shift">Turno</label><select class="form-select" id="group-shift" name="shift"><option>MATUTINO</option><option>VESPERTINO</option><option>MIXTO</option></select></div>
          <div class="col-md-1"><label class="form-label" for="group-capacity">Cupo</label><input class="form-control" id="group-capacity" name="capacity" type="number" min="1" max="500" value="30" required></div>
          <div class="col-md-1 d-grid"><button class="btn btn-aut-primary" type="submit" title="Guardar grupo">Guardar</button></div>
        </form>
      </div>
      <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Grupo</th><th>Carrera</th><th>Turno</th><th>Cupo</th><th>Estado</th><th><span class="visually-hidden">Acciones</span></th></tr></thead><tbody>${groupRows}</tbody></table></div>
    </section>
    <section id="asignaciones" class="surface-card mb-4">
      <div class="surface-card-header"><div><h2 class="surface-card-title">Asignación de grupo</h2><small class="text-secondary">Solo se muestran grupos compatibles con la carrera del alumno.</small></div></div>
      <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Alumno</th><th>Carrera</th><th>Grupo</th><th><span class="visually-hidden">Acción</span></th></tr></thead><tbody>${assignRows || `<tr><td colspan="4" class="empty-state">No hay alumnos activos para asignar.</td></tr>`}</tbody></table></div>
    </section>
    ${renderStaffInbox(session, state)}`);
};

const renderStudentPanel = (session, state) => {
  const student = state.students.find((item) => item.id === Number(session.studentId)) ?? state.students[0];
  const group = state.groups.find((item) => item.id === student?.groupId);
  const messages = state.messages.filter((message) => message.studentId === student?.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const recipientOptions = coordinatorRecipients()
    .map((user) => `<option value="USER:${escapeHtml(user.id)}">${escapeHtml(`${user.name} · ${user.area}`)}</option>`)
    .join("");
  if (!student) return dashboardShell(session, `<div class="alert alert-warning">No se encontró un perfil de alumno relacionado con este acceso.</div>`);

  return dashboardShell(session, `
    ${student.mustChangePassword ? `<div class="alert alert-warning d-flex align-items-start gap-3 mb-4"><span class="feature-icon flex-shrink-0">!</span><div><strong>Estás usando una contraseña temporal.</strong><div class="small mt-1">Por seguridad, deberás sustituirla por una contraseña personal durante tu primer acceso.</div></div></div>` : ""}
    <section class="page-banner mb-4">
      <span class="eyebrow">Portal del alumno</span>
      <h2 class="display-6 fw-bold mb-2">Hola, ${escapeHtml(student.name.split(" ")[0])}.</h2>
      <p class="mb-0 text-white-50">Consulta tu situación actual y mantente en contacto con las áreas responsables.</p>
    </section>
    <div class="row g-4">
      <div class="col-lg-5">
        <section id="perfil" class="surface-card mb-4">
          <div class="surface-card-header"><h2 class="surface-card-title">Información personal</h2>${statusBadge(student.status, "student")}</div>
          <div class="surface-card-body">
            <div class="data-pair"><span class="data-label">Matrícula</span><span class="data-value font-monospace">${escapeHtml(student.registration)}</span></div>
            <div class="data-pair"><span class="data-label">Nombre</span><span class="data-value">${escapeHtml(student.name)}</span></div>
            <div class="data-pair"><span class="data-label">CURP</span><span class="data-value font-monospace">${escapeHtml(student.curp)}</span></div>
            <div class="data-pair"><span class="data-label">Correo</span><span class="data-value">${escapeHtml(student.email)}</span></div>
            <div class="data-pair"><span class="data-label">Carrera</span><span class="data-value">${escapeHtml(student.career)}</span></div>
          </div>
        </section>
        <section id="inscripcion" class="surface-card">
          <div class="surface-card-header"><h2 class="surface-card-title">Inscripción actual</h2></div>
          <div class="surface-card-body">
            ${group ? `<div class="data-pair"><span class="data-label">Grupo</span><span class="data-value">${escapeHtml(group.code)}</span></div><div class="data-pair"><span class="data-label">Periodo</span><span class="data-value">${escapeHtml(group.period)}</span></div><div class="data-pair"><span class="data-label">Turno</span><span class="data-value">${escapeHtml(group.shift)}</span></div>` : `<div class="empty-state py-4">Tu asignación de grupo todavía está pendiente.</div>`}
          </div>
        </section>
      </div>
      <div class="col-lg-7">
        <section id="mensajes" class="surface-card">
          <div class="surface-card-header"><div><h2 class="surface-card-title">Caja de mensajes</h2><small class="text-secondary">Comunicación interna con Control Escolar y Coordinación.</small></div><span class="status-badge status-review">${messages.filter((message) => !message.read).length} nuevos</span></div>
          <div class="surface-card-body">
            <div class="message-list mb-4">
              ${messages.map((message) => `<article class="message-item ${message.sender === "ALUMNO" ? "mine" : ""}"><div class="message-meta"><div><strong>${escapeHtml(message.sender === "ALUMNO" ? "Tú" : messageSenderLabel(message))}</strong><span class="d-block">${escapeHtml(message.sender === "ALUMNO" ? `Para: ${messageRecipientLabel(message)}` : `De: ${messageSenderLabel(message)}`)}</span></div><time>${formatDate(message.createdAt, true)}</time></div><strong class="d-block small mb-1">${escapeHtml(message.subject)}</strong><p class="mb-0 small">${escapeHtml(message.body)}</p></article>`).join("") || `<div class="empty-state">Todavía no hay mensajes.</div>`}
            </div>
            <form id="message-form" class="row g-3">
              <input type="hidden" name="studentId" value="${student.id}">
              <div class="col-12"><label class="form-label" for="message-recipient">Enviar a</label><select class="form-select" id="message-recipient" name="recipient" required><option value="">Selecciona un destinatario</option><option value="DEPARTMENT:CONTROL_ESCOLAR">Departamento de Control Escolar</option>${recipientOptions}</select><div class="form-text">Los mensajes para Control Escolar son compartidos por todo el departamento; los enviados a un coordinador son personales.</div></div>
              <div class="col-12"><label class="form-label" for="message-subject">Asunto</label><input class="form-control" id="message-subject" name="subject" maxlength="160" required></div>
              <div class="col-12"><label class="form-label" for="message-body">Mensaje</label><textarea class="form-control" id="message-body" name="body" rows="3" maxlength="1000" required></textarea></div>
              <div class="col-12 text-end"><button class="btn btn-aut-primary" type="submit">Enviar mensaje</button></div>
            </form>
          </div>
        </section>
      </div>
    </div>`);
};

const renderPanel = (session) => {
  const state = store.getState();
  if (session.role === "ADMISIONES") return renderAdmissionsPanel(session, state);
  if (session.role === "CONTROL_ESCOLAR") return renderControlPanel(session, state);
  if (session.role === "COORDINACION") return renderCoordinationPanel(session, state);
  return renderStudentPanel(session, state);
};

const route = () => {
  const hash = window.location.hash || "#/inicio";
  const [routePath, routeQuery = ""] = hash.split("?");
  const session = store.getSession();

  document.body.classList.remove("theme-auth", "theme-dashboard");

  if (routePath.startsWith("#/panel/")) {
    if (!session) {
      clearSessionTimers();
      window.location.hash = "#/login";
      return;
    }
    const expected = roleRoutes[session.role];
    if (routePath !== `#/panel/${expected}`) {
      window.location.hash = `#/panel/${expected}`;
      return;
    }
    document.body.classList.add("theme-dashboard");
    app.innerHTML = renderPanel(session);
    const requestedSection = new URLSearchParams(routeQuery).get("section");
    if (requestedSection) {
      window.requestAnimationFrame(() => {
        document.getElementById(requestedSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  } else if (routePath === "#/login") {
    if (session) {
      window.location.hash = `#/panel/${roleRoutes[session.role]}`;
      return;
    }
    document.body.classList.add("theme-auth");
    app.innerHTML = renderLogin();
  } else if (routePath === "#/solicitud") {
    app.innerHTML = renderApplication();
  } else {
    app.innerHTML = renderLanding();
  }

  if (session) scheduleSessionTimers(session);
  else clearSessionTimers();

  window.scrollTo({ top: 0, behavior: "instant" });
};

const filterApplicantRows = () => {
  const search = document.querySelector("#applicant-search")?.value.trim().toLowerCase() ?? "";
  const status = document.querySelector("#applicant-status-filter")?.value ?? "";
  document.querySelectorAll("[data-applicant-row]").forEach((row) => {
    const matchesSearch = !search || row.dataset.search.includes(search);
    const matchesStatus = !status || row.dataset.status === status;
    row.hidden = !(matchesSearch && matchesStatus);
  });
};

document.addEventListener("input", (event) => {
  if (event.target.matches("#curp")) event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (event.target.matches("#applicant-search")) filterApplicantRows();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("#applicant-status-filter")) filterApplicantRows();
  if (event.target.matches('[data-action="student-status"]')) {
    try {
      store.updateStudentStatus(event.target.dataset.id, event.target.value);
      showToast("El estado del alumno se actualizó y se conservará en su historial.");
      route();
    } catch (error) {
      showToast(error.message, "danger");
      route();
    }
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("#session-settings-form")) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    try {
      const timeoutMs = store.setSessionIdleTimeoutMs(data.get("timeout"));
      const session = store.refreshSessionActivity();
      window.bootstrap.Modal.getInstance(document.querySelector("#action-modal"))?.hide();
      if (session) scheduleSessionTimers(session);
      route();
      showToast(`La vigencia de la sesión cambió a ${formatSessionDuration(timeoutMs)}.`);
    } catch (error) {
      showToast(error.message, "danger");
    }
    return;
  }

  if (event.target.matches("#login-form")) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const login = String(data.get("login") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const now = Date.now();
    if (loginGuard.blockedUntil > now) {
      const seconds = Math.ceil((loginGuard.blockedUntil - now) / 1000);
      document.querySelector("#login-alert").innerHTML = `<div class="alert alert-warning py-2 small">Demasiados intentos. Vuelve a intentarlo en ${seconds} segundos.</div>`;
      return;
    }
    if (login.length < 3 || login.length > 120 || password.length < 8 || password.length > 128) {
      document.querySelector("#login-alert").innerHTML = `<div class="alert alert-danger py-2 small">Revisa el formato del usuario y la contraseña.</div>`;
      return;
    }
    const session = store.authenticate(login, password);
    if (!session) {
      loginGuard.failures += 1;
      if (loginGuard.failures >= 5) {
        loginGuard.blockedUntil = Date.now() + 30 * 1000;
        loginGuard.failures = 0;
      }
      document.querySelector("#login-alert").innerHTML = `<div class="alert alert-danger py-2 small">Las credenciales no son correctas para este entorno.</div>`;
      return;
    }
    loginGuard.failures = 0;
    loginGuard.blockedUntil = 0;
    window.location.hash = `#/panel/${roleRoutes[session.role]}`;
    return;
  }

  if (event.target.matches("#application-form")) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    try {
      const selectedFiles = Array.from(document.querySelector("#documents")?.files ?? []);
      const documents = selectedFiles.map((file, index) => ({
        id: `local-${Date.now()}-${index + 1}`,
        code: "ADJUNTO",
        type: `Documento adjunto ${index + 1}`,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "PENDIENTE",
      }));
      const applicant = store.createApplicant({
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        secondLastName: data.get("secondLastName"),
        curp: data.get("curp"),
        email: data.get("email"),
        phone: data.get("phone"),
        career: data.get("career"),
        documents,
      });
      selectedFiles.forEach((file, index) => {
        runtimeFiles.set(`${applicant.id}:${documents[index].id}`, file);
      });
      form.reset();
      showModal(
        "Solicitud registrada",
        `<div class="text-center py-3"><span class="feature-icon mx-auto">OK</span><p class="text-secondary mb-2">Conserva el siguiente folio para dar seguimiento:</p><div class="h3 section-title font-monospace">${escapeHtml(applicant.folio)}</div><p class="small text-secondary mb-0">En la integración final también recibirás una confirmación por correo electrónico.</p></div>`,
        `<a class="btn btn-aut-primary" href="#/inicio" data-bs-dismiss="modal">Finalizar</a>`,
      );
    } catch (error) {
      document.querySelector("#application-alert").innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
    return;
  }

  if (event.target.matches("#review-form")) {
    event.preventDefault();
    const data = new FormData(event.target);
    try {
      const status = data.get("status");
      const observations = String(data.get("observations") ?? "").trim();
      const applicant = store.getState().applicants.find((item) => item.id === Number(data.get("id")));
      if (!applicant) throw new Error("No se encontró la solicitud seleccionada.");
      const documents = applicantDocuments(applicant).map((document) => ({
        ...document,
        status: String(data.get(`documentStatus-${document.id}`) ?? document.status),
      }));
      const observedDocuments = documents.filter((document) => document.status === "OBSERVADO");
      const unvalidatedDocuments = documents.filter((document) => document.status !== "VALIDADO");

      if (["OBSERVADO", "RECHAZADO"].includes(status) && !observations) {
        throw new Error("Debes registrar el motivo u observación del dictamen.");
      }
      if (status === "OBSERVADO" && observedDocuments.length === 0) {
        throw new Error("Marca al menos un documento como observado.");
      }
      if (status === "ACEPTADO" && (!documents.length || unvalidatedDocuments.length > 0)) {
        throw new Error("Para aceptar el expediente, todos los documentos deben estar validados.");
      }

      store.updateApplicant(data.get("id"), { status, observations, documents, documentCount: documents.length });
      window.bootstrap.Modal.getInstance(document.querySelector("#action-modal"))?.hide();
      showToast("La revisión documental y el dictamen se guardaron correctamente.");
      route();
    } catch (error) {
      document.querySelector("#review-error").innerHTML = `<div class="alert alert-danger py-2 small">${escapeHtml(error.message)}</div>`;
    }
    return;
  }

  if (event.target.matches("#group-form")) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    try {
      store.saveGroup(data);
      showToast(data.id ? "El grupo se actualizó correctamente." : "El grupo se creó correctamente.");
      route();
    } catch (error) {
      showToast(error.message, "danger");
    }
    return;
  }

  if (event.target.matches("#message-form")) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    try {
      const recipientLabel = form.elements.recipient.selectedOptions[0]?.textContent ?? "el destinatario";
      store.addMessage(data.get("studentId"), data.get("subject"), data.get("body"), data.get("recipient"));
      showToast(`Tu mensaje fue enviado a ${recipientLabel}.`);
      route();
    } catch (error) {
      showToast(error.message, "danger");
    }
  }
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;

  if (action === "use-demo") {
    const user = demoUsers.find((item) => item.login === trigger.dataset.login);
    if (!user) return;
    document.querySelector("#login").value = user.login;
    document.querySelector("#password").value = user.password;
    showToast(`Acceso de ${roleLabels[user.role]} cargado.`);
  }

  if (action === "session-settings") {
    openSessionSettings();
  }

  if (action === "reset-demo") {
    store.reset();
    showToast("La información de demostración se restableció.", "warning");
    route();
  }

  if (action === "logout") {
    clearSessionTimers();
    store.logout();
    window.location.hash = "#/login";
    showToast("La sesión se cerró correctamente.");
  }

  if (action === "review-applicant") {
    const applicant = store.getState().applicants.find((item) => item.id === Number(trigger.dataset.id));
    if (!applicant) return;
    openApplicantRecord(applicant, true);
  }

  if (action === "view-applicant-record") {
    const applicant = store.getState().applicants.find((item) => item.id === Number(trigger.dataset.id));
    if (!applicant) return;
    openApplicantRecord(applicant, false);
  }

  if (action === "preview-document") {
    const applicant = store.getState().applicants.find((item) => item.id === Number(trigger.dataset.applicantId));
    const documentItem = applicantDocuments(applicant ?? {}).find((item) => String(item.id) === String(trigger.dataset.documentId));
    const panel = document.querySelector("#document-preview-panel");
    if (!applicant || !documentItem || !panel) return;

    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      currentPreviewUrl = null;
    }

    const runtimeFile = runtimeFiles.get(`${applicant.id}:${documentItem.id}`);
    if (runtimeFile) {
      currentPreviewUrl = URL.createObjectURL(runtimeFile);
      panel.innerHTML = runtimeFile.type.startsWith("image/")
        ? `<img class="document-preview-image" src="${currentPreviewUrl}" alt="Vista previa de ${escapeHtml(documentItem.type)}">`
        : `<iframe class="document-preview-frame" src="${currentPreviewUrl}" title="Vista previa de ${escapeHtml(documentItem.type)}"></iframe>`;
    } else {
      panel.innerHTML = `<div class="document-placeholder"><span class="feature-icon mx-auto">DOC</span><strong>${escapeHtml(documentItem.type)}</strong><span class="text-secondary small">${escapeHtml(documentItem.fileName)} · ${formatBytes(documentItem.size)}</span><p class="small text-secondary mb-0 mt-2">Vista demostrativa del archivo. Cuando se conecte el almacenamiento de la API, aquí se mostrará el PDF o la imagen enviada por el aspirante.</p></div>`;
    }
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (action === "enrol-applicant") {
    try {
      const student = store.enrolApplicant(trigger.dataset.id);
      route();
      openStudentCredentials(student, true);
    } catch (error) {
      showToast(error.message, "danger");
    }
  }

  if (action === "show-student-access") {
    const student = store.getState().students.find((item) => item.id === Number(trigger.dataset.id));
    if (!student) return;
    openStudentCredentials(student);
  }

  if (action === "download-credentials") {
    const student = store.getState().students.find((item) => item.id === Number(trigger.dataset.id));
    if (!student) {
      showToast("No se encontró el alumno seleccionado.", "danger");
      return;
    }
    try {
      const filename = downloadCredentialPdf(student);
      showToast(`Se generó ${filename}.`);
    } catch (error) {
      showToast(error.message, "danger");
    }
  }

  if (action === "edit-group") {
    const group = store.getState().groups.find((item) => item.id === Number(trigger.dataset.id));
    if (!group) return;
    document.querySelector("#group-id").value = group.id;
    document.querySelector("#group-code").value = group.code;
    document.querySelector("#group-career").value = group.career;
    document.querySelector("#group-period").value = group.period;
    document.querySelector("#group-shift").value = group.shift;
    document.querySelector("#group-capacity").value = group.capacity;
    document.querySelector("#group-form").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (action === "toggle-group") {
    try {
      store.toggleGroup(trigger.dataset.id);
      showToast("La disponibilidad del grupo se actualizó.");
      route();
    } catch (error) {
      showToast(error.message, "danger");
    }
  }

  if (action === "assign-group") {
    const select = document.querySelector(`#student-group-${trigger.dataset.id}`);
    if (!select?.value) {
      showToast("Selecciona un grupo antes de guardar.", "warning");
      return;
    }
    try {
      store.assignGroup(trigger.dataset.id, select.value);
      showToast("La asignación quedó guardada y el cupo fue validado.");
      route();
    } catch (error) {
      showToast(error.message, "danger");
    }
  }
});

window.addEventListener("hashchange", route);
for (const eventName of ["pointerdown", "keydown", "scroll", "touchstart"]) {
  document.addEventListener(eventName, registerSessionActivity, { passive: true });
}
window.addEventListener("focus", validateVisibleSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") validateVisibleSession();
});
route();
