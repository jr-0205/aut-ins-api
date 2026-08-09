const STORAGE_KEY = "aut-ins-demo-state-v2";
const SESSION_KEY = "aut-ins-demo-session-v1";
const SESSION_CONFIG_KEY = "aut-ins-demo-session-config-v1";
export const DEFAULT_SESSION_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
export const SESSION_TIMEOUT_OPTIONS = Object.freeze([
  { value: 10 * 1000, label: "10 segundos · prueba rápida" },
  { value: 30 * 1000, label: "30 segundos · demostración" },
  { value: 60 * 1000, label: "1 minuto" },
  { value: 5 * 60 * 1000, label: "5 minutos" },
  { value: DEFAULT_SESSION_IDLE_TIMEOUT_MS, label: "15 minutos · recomendado" },
  { value: 30 * 60 * 1000, label: "30 minutos" },
]);

const readSessionIdleTimeoutMs = () => {
  try {
    const configured = Number(localStorage.getItem(SESSION_CONFIG_KEY));
    return SESSION_TIMEOUT_OPTIONS.some((option) => option.value === configured)
      ? configured
      : DEFAULT_SESSION_IDLE_TIMEOUT_MS;
  } catch {
    return DEFAULT_SESSION_IDLE_TIMEOUT_MS;
  }
};

export const careers = [
  "Ingeniería en Sistemas Computacionales",
  "Ingeniería Industrial",
  "Administración",
  "Contaduría Pública",
];

export const demoUsers = [
  {
    id: "demo-admisiones",
    login: "admisiones@aut-ins.demo",
    password: "Admisiones2026!",
    role: "ADMISIONES",
    name: "Mariana López",
    area: "Coordinación de Admisiones",
  },
  {
    id: "demo-control",
    login: "control@aut-ins.demo",
    password: "Control2026!",
    role: "CONTROL_ESCOLAR",
    name: "Roberto Hernández",
    area: "Control Escolar",
  },
  {
    id: "demo-coordinacion",
    login: "coordinacion@aut-ins.demo",
    password: "Coordinacion2026!",
    role: "COORDINACION",
    name: "Daniela Torres",
    area: "Coordinación Académica",
  },
  {
    id: "demo-alumno",
    login: "AUT20260001",
    password: "Alumno2026!",
    role: "ALUMNO",
    name: "Andrea Martínez Pérez",
    area: "Portal del alumno",
    studentId: 1,
  },
];

export const roleLabels = {
  ADMISIONES: "Admisiones",
  CONTROL_ESCOLAR: "Control Escolar",
  COORDINACION: "Coordinación Académica",
  ALUMNO: "Alumno",
};

export const roleRoutes = {
  ADMISIONES: "admisiones",
  CONTROL_ESCOLAR: "control-escolar",
  COORDINACION: "coordinacion",
  ALUMNO: "alumno",
};

const documentCatalog = [
  ["ACTA_NACIMIENTO", "Acta de nacimiento", "acta-nacimiento.pdf"],
  ["CERTIFICADO_ESTUDIOS", "Certificado de estudios", "certificado-estudios.pdf"],
  ["IDENTIFICACION_OFICIAL", "Identificación oficial", "identificacion-frente.jpg"],
  ["COMPROBANTE_DOMICILIO", "Comprobante de domicilio", "comprobante-domicilio.pdf"],
  ["CURP", "Constancia de CURP", "constancia-curp.pdf"],
  ["FOTOGRAFIA", "Fotografía", "fotografia.jpg"],
];

const demoDocuments = (prefix, count, options = {}) =>
  documentCatalog.slice(0, count).map(([code, type, fileName], index) => ({
    id: `${prefix}-${index + 1}`,
    code,
    type,
    fileName,
    mimeType: fileName.endsWith(".jpg") ? "image/jpeg" : "application/pdf",
    size: 280000 + index * 137500,
    status:
      options.observedIndex === index
        ? "OBSERVADO"
        : options.validated
          ? "VALIDADO"
          : "PENDIENTE",
  }));

const initialState = () => ({
  applicants: [
    {
      id: 1,
      folio: "AUT-2026-0001",
      firstName: "Luis",
      lastName: "Ramírez Gómez",
      curp: "RAGL060412HPLMMS07",
      email: "luis.ramirez@example.test",
      phone: "2221234501",
      career: careers[0],
      status: "PENDIENTE_REVISION",
      observations: "",
      documents: demoDocuments("asp-1", 5),
      documentCount: 5,
      submittedAt: "2026-08-07T14:20:00.000Z",
      enrolledStudentId: null,
    },
    {
      id: 2,
      folio: "AUT-2026-0002",
      firstName: "Sofía",
      lastName: "Mendoza Ruiz",
      curp: "MERS060924MPLNZF02",
      email: "sofia.mendoza@example.test",
      phone: "2221234502",
      career: careers[2],
      status: "OBSERVADO",
      observations: "El certificado de estudios debe cargarse nuevamente en formato PDF.",
      documents: demoDocuments("asp-2", 4, { observedIndex: 1 }),
      documentCount: 4,
      submittedAt: "2026-08-07T17:45:00.000Z",
      enrolledStudentId: null,
    },
    {
      id: 3,
      folio: "AUT-2026-0003",
      firstName: "Andrea",
      lastName: "Martínez Pérez",
      curp: "MAPA060205MPLRNR08",
      email: "andrea.martinez@example.test",
      phone: "2221234503",
      career: careers[0],
      status: "ACEPTADO",
      observations: "Expediente completo y validado.",
      documents: demoDocuments("asp-3", 6, { validated: true }),
      documentCount: 6,
      submittedAt: "2026-08-06T11:10:00.000Z",
      enrolledStudentId: 1,
    },
    {
      id: 4,
      folio: "AUT-2026-0004",
      firstName: "Miguel",
      lastName: "Flores Castro",
      curp: "FOCM051118HPLLSG03",
      email: "miguel.flores@example.test",
      phone: "2221234504",
      career: careers[1],
      status: "ACEPTADO",
      observations: "Expediente aprobado; pendiente de enrolamiento.",
      documents: demoDocuments("asp-4", 6, { validated: true }),
      documentCount: 6,
      submittedAt: "2026-08-08T09:05:00.000Z",
      enrolledStudentId: null,
    },
  ],
  students: [
    {
      id: 1,
      applicantId: 3,
      registration: "AUT20260001",
      temporaryPassword: "Alumno2026!",
      mustChangePassword: false,
      credentialsGeneratedAt: "2026-08-08T12:30:00.000Z",
      name: "Andrea Martínez Pérez",
      curp: "MAPA060205MPLRNR08",
      email: "andrea.martinez@example.test",
      career: careers[0],
      status: "ACTIVO",
      groupId: 1,
      enrolledAt: "2026-08-08T12:30:00.000Z",
    },
    {
      id: 2,
      applicantId: null,
      registration: "AUT20260002",
      temporaryPassword: "Temporal2026!",
      mustChangePassword: true,
      credentialsGeneratedAt: "2026-08-08T13:00:00.000Z",
      name: "Emiliano Sánchez Cruz",
      curp: "SACE060115HPLNMR04",
      email: "emiliano.sanchez@example.test",
      career: careers[0],
      status: "ACTIVO",
      groupId: null,
      enrolledAt: "2026-08-08T13:00:00.000Z",
    },
  ],
  groups: [
    {
      id: 1,
      code: "ISC-1A",
      career: careers[0],
      period: "AGO-DIC 2026",
      shift: "MATUTINO",
      capacity: 30,
      active: true,
    },
    {
      id: 2,
      code: "IND-1A",
      career: careers[1],
      period: "AGO-DIC 2026",
      shift: "MATUTINO",
      capacity: 25,
      active: true,
    },
    {
      id: 3,
      code: "ADM-1V",
      career: careers[2],
      period: "AGO-DIC 2026",
      shift: "VESPERTINO",
      capacity: 28,
      active: true,
    },
  ],
  messages: [
    {
      id: 1,
      studentId: 1,
      sender: "CONTROL_ESCOLAR",
      senderUserId: "demo-control",
      recipientKind: "STUDENT",
      recipientRole: "ALUMNO",
      recipientUserId: null,
      subject: "Bienvenida al portal",
      body: "Tu matrícula quedó activa. Ya puedes consultar tu información de inscripción.",
      createdAt: "2026-08-08T15:10:00.000Z",
      read: true,
    },
    {
      id: 2,
      studentId: 1,
      sender: "ALUMNO",
      senderUserId: null,
      recipientKind: "USER",
      recipientRole: "COORDINACION",
      recipientUserId: "demo-coordinacion",
      subject: "Consulta de horario",
      body: "¿Cuándo se publicará la información definitiva de mi grupo?",
      createdAt: "2026-08-09T09:20:00.000Z",
      read: true,
    },
    {
      id: 3,
      studentId: 1,
      sender: "COORDINACION",
      senderUserId: "demo-coordinacion",
      recipientKind: "STUDENT",
      recipientRole: "ALUMNO",
      recipientUserId: null,
      subject: "Asignación confirmada",
      body: "Tu grupo ISC-1A ya aparece confirmado para el periodo AGO-DIC 2026.",
      createdAt: "2026-08-09T10:05:00.000Z",
      read: false,
    },
  ],
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeMessage = (message) => {
  if (message.recipientKind) return message;
  if (message.sender === "ALUMNO") {
    return {
      ...message,
      senderUserId: null,
      recipientKind: "USER",
      recipientRole: "COORDINACION",
      recipientUserId: "demo-coordinacion",
    };
  }
  return {
    ...message,
    senderUserId: message.sender === "CONTROL_ESCOLAR" ? "demo-control" : "demo-coordinacion",
    recipientKind: "STUDENT",
    recipientRole: "ALUMNO",
    recipientUserId: null,
  };
};

const secureRandomIndex = (length) => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("El navegador no permite generar credenciales seguras.");
  }

  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] % length;
};

const generateTemporaryPassword = () => {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%&*?",
  ];
  const alphabet = groups.join("");
  const characters = groups.map((group) => group[secureRandomIndex(group.length)]);

  while (characters.length < 14) {
    characters.push(alphabet[secureRandomIndex(alphabet.length)]);
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join("");
};

const readState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const state = saved ? JSON.parse(saved) : initialState();
    state.messages = Array.isArray(state.messages) ? state.messages.map(normalizeMessage) : [];
    return state;
  } catch {
    return initialState();
  }
};

const writeState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return clone(state);
};

const activeApplicantStates = new Set([
  "PENDIENTE_DOCUMENTOS",
  "PENDIENTE_REVISION",
  "OBSERVADO",
  "ACEPTADO",
]);

export const store = {
  getState() {
    return clone(readState());
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_CONFIG_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return this.getState();
  },

  authenticate(login, password) {
    const normalizedLogin = String(login).trim().toLowerCase();
    const demoUser = demoUsers.find(
      (candidate) =>
        candidate.login.toLowerCase() === normalizedLogin && candidate.password === password,
    );

    const student = readState().students.find(
      (candidate) =>
        candidate.status === "ACTIVO" &&
        candidate.registration.toLowerCase() === normalizedLogin &&
        candidate.temporaryPassword === password,
    );

    const user = demoUser ?? (student
      ? {
          id: `demo-student-${student.id}`,
          login: student.registration,
          role: "ALUMNO",
          name: student.name,
          area: "Portal del alumno",
          studentId: student.id,
        }
      : null);

    if (!user) return null;

    const session = {
      id: user.id,
      login: user.login,
      role: user.role,
      name: user.name,
      area: user.area,
      studentId: user.studentId ?? null,
      signedInAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return clone(session);
  },

  getSession() {
    try {
      const value = sessionStorage.getItem(SESSION_KEY);
      if (!value) return null;

      const session = JSON.parse(value);
      const lastActivityAt = Number(session.lastActivityAt ?? Date.now());
      if (Date.now() - lastActivityAt >= readSessionIdleTimeoutMs()) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      if (!session.lastActivityAt) {
        session.lastActivityAt = lastActivityAt;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }

      return clone(session);
    } catch {
      return null;
    }
  },

  refreshSessionActivity() {
    const session = this.getSession();
    if (!session) return null;
    session.lastActivityAt = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return clone(session);
  },

  getSessionIdleTimeoutMs() {
    return readSessionIdleTimeoutMs();
  },

  setSessionIdleTimeoutMs(value) {
    const timeout = Number(value);
    if (!SESSION_TIMEOUT_OPTIONS.some((option) => option.value === timeout)) {
      throw new Error("Selecciona una duración de sesión válida.");
    }
    localStorage.setItem(SESSION_CONFIG_KEY, String(timeout));
    return timeout;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  createApplicant(payload) {
    const state = readState();
    const curp = String(payload.curp).trim().toUpperCase();
    const duplicate = state.applicants.find(
      (applicant) => applicant.curp === curp && activeApplicantStates.has(applicant.status),
    );

    if (duplicate) {
      throw new Error(`La CURP ya tiene un proceso activo con folio ${duplicate.folio}.`);
    }

    const id = Math.max(0, ...state.applicants.map((applicant) => applicant.id)) + 1;
    const documents = Array.isArray(payload.documents) ? payload.documents : [];
    const applicant = {
      id,
      folio: `AUT-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`,
      firstName: String(payload.firstName).trim(),
      lastName: `${String(payload.lastName).trim()} ${String(payload.secondLastName ?? "").trim()}`.trim(),
      curp,
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone).replace(/\D/g, ""),
      career: String(payload.career),
      status: documents.length > 0 ? "PENDIENTE_REVISION" : "PENDIENTE_DOCUMENTOS",
      observations: "",
      documents,
      documentCount: documents.length,
      submittedAt: new Date().toISOString(),
      enrolledStudentId: null,
    };

    state.applicants.unshift(applicant);
    writeState(state);
    return clone(applicant);
  },

  updateApplicant(id, changes) {
    const state = readState();
    const applicant = state.applicants.find((item) => item.id === Number(id));
    if (!applicant) throw new Error("No se encontró la solicitud seleccionada.");

    Object.assign(applicant, changes);
    writeState(state);
    return clone(applicant);
  },

  enrolApplicant(id) {
    const state = readState();
    const applicant = state.applicants.find((item) => item.id === Number(id));
    if (!applicant) throw new Error("No se encontró la solicitud seleccionada.");
    if (applicant.status !== "ACEPTADO") {
      throw new Error("Solo se puede enrolar un expediente aceptado.");
    }
    if (applicant.enrolledStudentId) {
      throw new Error("La solicitud ya cuenta con un alumno relacionado.");
    }

    const studentId = Math.max(0, ...state.students.map((student) => student.id)) + 1;
    const registration = `AUT${new Date().getFullYear()}${String(studentId).padStart(4, "0")}`;
    const student = {
      id: studentId,
      applicantId: applicant.id,
      registration,
      temporaryPassword: generateTemporaryPassword(),
      mustChangePassword: true,
      credentialsGeneratedAt: new Date().toISOString(),
      name: `${applicant.firstName} ${applicant.lastName}`,
      curp: applicant.curp,
      email: applicant.email,
      career: applicant.career,
      status: "ACTIVO",
      groupId: null,
      enrolledAt: new Date().toISOString(),
    };

    applicant.enrolledStudentId = student.id;
    state.students.unshift(student);
    writeState(state);
    return clone(student);
  },

  updateStudentStatus(id, status) {
    const allowed = new Set(["ACTIVO", "BAJA_TEMPORAL", "BAJA_DEFINITIVA", "EGRESADO"]);
    if (!allowed.has(status)) throw new Error("El estado del alumno no es válido.");

    const state = readState();
    const student = state.students.find((item) => item.id === Number(id));
    if (!student) throw new Error("No se encontró el alumno seleccionado.");

    student.status = status;
    writeState(state);
    return clone(student);
  },

  saveGroup(payload) {
    const state = readState();
    const groupId = Number(payload.id || 0);
    const code = String(payload.code).trim().toUpperCase();
    const capacity = Number(payload.capacity);
    const duplicate = state.groups.find(
      (group) => group.code === code && group.id !== groupId && group.active,
    );
    if (duplicate) throw new Error("Ya existe un grupo activo con esa clave.");
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("La capacidad debe ser un número mayor que cero.");
    }

    if (groupId) {
      const group = state.groups.find((item) => item.id === groupId);
      if (!group) throw new Error("No se encontró el grupo seleccionado.");
      const occupied = state.students.filter(
        (student) => student.groupId === group.id && student.status === "ACTIVO",
      ).length;
      if (capacity < occupied) {
        throw new Error(`La capacidad no puede ser menor que los ${occupied} lugares ocupados.`);
      }
      Object.assign(group, {
        code,
        career: String(payload.career),
        period: String(payload.period).trim().toUpperCase(),
        shift: String(payload.shift),
        capacity,
      });
      writeState(state);
      return clone(group);
    }

    const id = Math.max(0, ...state.groups.map((group) => group.id)) + 1;
    const group = {
      id,
      code,
      career: String(payload.career),
      period: String(payload.period).trim().toUpperCase(),
      shift: String(payload.shift),
      capacity,
      active: true,
    };
    state.groups.push(group);
    writeState(state);
    return clone(group);
  },

  toggleGroup(id) {
    const state = readState();
    const group = state.groups.find((item) => item.id === Number(id));
    if (!group) throw new Error("No se encontró el grupo seleccionado.");
    const occupied = state.students.filter(
      (student) => student.groupId === group.id && student.status === "ACTIVO",
    ).length;
    if (group.active && occupied > 0) {
      throw new Error("No se puede desactivar un grupo que todavía tiene alumnos activos.");
    }
    group.active = !group.active;
    writeState(state);
    return clone(group);
  },

  assignGroup(studentId, groupId) {
    const state = readState();
    const student = state.students.find((item) => item.id === Number(studentId));
    const group = state.groups.find((item) => item.id === Number(groupId));
    if (!student || !group) throw new Error("No se encontró el alumno o grupo seleccionado.");
    if (student.status !== "ACTIVO") throw new Error("El alumno debe estar activo para asignarle grupo.");
    if (!group.active) throw new Error("El grupo seleccionado está desactivado.");
    if (student.career !== group.career) throw new Error("El grupo no pertenece a la carrera del alumno.");

    const occupied = state.students.filter(
      (item) => item.groupId === group.id && item.status === "ACTIVO" && item.id !== student.id,
    ).length;
    if (occupied >= group.capacity) throw new Error("El grupo alcanzó su capacidad máxima.");

    student.groupId = group.id;
    writeState(state);
    return clone(student);
  },

  addMessage(studentId, subject, body, recipient) {
    const state = readState();
    const recipientValue = String(recipient ?? "");
    const coordinator = recipientValue.startsWith("USER:")
      ? demoUsers.find(
          (user) => user.id === recipientValue.slice(5) && user.role === "COORDINACION",
        )
      : null;
    const isControlDepartment = recipientValue === "DEPARTMENT:CONTROL_ESCOLAR";
    if (!isControlDepartment && !coordinator) {
      throw new Error("Selecciona un destinatario válido para el mensaje.");
    }

    const id = Math.max(0, ...state.messages.map((message) => message.id)) + 1;
    const message = {
      id,
      studentId: Number(studentId),
      sender: "ALUMNO",
      senderUserId: null,
      recipientKind: isControlDepartment ? "DEPARTMENT" : "USER",
      recipientRole: isControlDepartment ? "CONTROL_ESCOLAR" : coordinator.role,
      recipientUserId: coordinator?.id ?? null,
      subject: String(subject).trim(),
      body: String(body).trim(),
      createdAt: new Date().toISOString(),
      read: true,
    };
    if (!message.subject || !message.body) throw new Error("El asunto y el mensaje son obligatorios.");
    state.messages.push(message);
    writeState(state);
    return clone(message);
  },
};
