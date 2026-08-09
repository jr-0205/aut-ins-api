const fs = require("node:fs");
const path = require("node:path");

const OUTPUT = path.join(
  process.cwd(),
  "docs",
  "postman",
  "AUT-INS_API.postman_collection.json",
);

const SCHEMA =
  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

const REQUIRED_UFPS = [
  "UFP-01",
  "UFP-02",
  "UFP-03",
  "UFP-04",
  "UFP-05",
  "UFP-06",
  "UFP-07",
  "UFP-08",
  "UFP-SUG-01",
  "UFP-SUG-02",
  "UFP-SUG-03",
];

const variables = [
  ["baseUrl", "http://localhost:3000/api"],
  ["jwt", ""],
  ["tokenTemporal", ""],
  ["aspiranteId", "1"],
  ["expedienteId", "1"],
  ["documentoId", "1"],
  ["alumnoId", "1"],
  ["empleadoId", "1"],
  ["periodoId", "1"],
  ["grupoId", "1"],
  ["conversacionId", "1"],
  ["carreraId", "1"],
  ["curp", "PEAF060205HPLRCR09"],
];

function jsonBody(value) {
  return {
    mode: "raw",
    raw: JSON.stringify(value, null, 2),
    options: { raw: { language: "json" } },
  };
}

function formData(entries) {
  return {
    mode: "formdata",
    formdata: entries.map((entry) =>
      entry.type === "file"
        ? { key: entry.key, type: "file", src: [] }
        : { key: entry.key, value: entry.value, type: "text" },
    ),
  };
}

function urlFor(route, query = []) {
  const relative = route.replace(/^\//, "");
  const queryString = query.length
    ? `?${query.map(({ key, value }) => `${key}=${value}`).join("&")}`
    : "";

  return {
    raw: `{{baseUrl}}/${relative}${queryString}`,
    host: ["{{baseUrl}}"],
    path: relative.split("/"),
    ...(query.length
      ? {
          query: query.map(({ key, value, description, disabled = false }) => ({
            key,
            value,
            description,
            disabled,
          })),
        }
      : {}),
  };
}

function testScript(expectedStatuses, capture = []) {
  const lines = [
    `pm.test("Código HTTP esperado", function () { pm.expect(${JSON.stringify(expectedStatuses)}).to.include(pm.response.code); });`,
    'pm.test("Tiempo de respuesta registrado", function () { pm.expect(pm.response.responseTime).to.be.a("number"); });',
  ];

  if (!expectedStatuses.includes(204)) {
    lines.push(
      'pm.test("Respuesta JSON", function () { pm.expect(pm.response.headers.get("Content-Type") || "").to.include("application/json"); });',
    );
  }

  if (capture.length) {
    lines.push(
      "if (pm.response.code >= 200 && pm.response.code < 300) {",
      "  const payload = pm.response.json();",
      "  const data = payload.data || payload;",
    );
    for (const [variable, expression] of capture) {
      lines.push(
        `  if (${expression} !== undefined && ${expression} !== null) pm.collectionVariables.set("${variable}", String(${expression}));`,
      );
    }
    lines.push("}");
  }

  return [{ listen: "test", script: { type: "text/javascript", exec: lines } }];
}

function requestItem({
  name,
  method,
  route,
  purpose,
  ufps,
  access = "jwt",
  body,
  query,
  statuses = [200],
  capture,
}) {
  const request = {
    method,
    header: body?.mode === "raw" ? [{ key: "Content-Type", value: "application/json" }] : [],
    url: urlFor(route, query),
    description: `${purpose}\n\nCobertura: ${ufps.join(", ")}.`,
    ...(body ? { body } : {}),
  };

  if (access === "public") request.auth = { type: "noauth" };
  if (access === "temporary") {
    request.auth = {
      type: "bearer",
      bearer: [{ key: "token", value: "{{tokenTemporal}}", type: "string" }],
    };
  }

  return {
    name,
    request,
    event: testScript(statuses, capture),
  };
}

function folder(name, description, items) {
  return { name, description, item: items };
}

function buildCollection() {
  const folders = [
    folder("01. Autenticación", "Inicio de sesión y emisión de JWT. Cubre UFP-SUG-02.", [
      requestItem({
        name: "Iniciar sesión",
        method: "POST",
        route: "/auth/login",
        purpose: "Valida matrícula y contraseña y devuelve los datos mínimos de sesión.",
        ufps: ["UFP-SUG-02"],
        access: "public",
        body: jsonBody({ matricula: "20260001", password: "Cambiar123!" }),
        statuses: [200, 401],
        capture: [["jwt", "data.token"]],
      }),
    ]),

    folder("02. Catálogo público", "Oferta educativa necesaria para el pre-registro.", [
      requestItem({
        name: "Consultar carreras activas",
        method: "GET",
        route: "/carreras",
        purpose: "Devuelve la oferta educativa habilitada para el registro.",
        ufps: ["UFP-01", "UFP-04"],
        access: "public",
        statuses: [200],
      }),
    ]),

    folder("03. Aspirantes", "Pre-registro y consulta del estado del trámite.", [
      requestItem({
        name: "Crear pre-registro",
        method: "POST",
        route: "/aspirantes",
        purpose: "Registra al aspirante, crea el folio y habilita la carga documental.",
        ufps: ["UFP-01"],
        access: "public",
        body: jsonBody({
          nombre: "Luis Fernando",
          apellidoPaterno: "Pérez",
          apellidoMaterno: "Acuautla",
          curp: "{{curp}}",
          correo: "aspirante@example.com",
          telefono: "2221234567",
          carreraId: "{{carreraId}}",
        }),
        statuses: [201, 409],
        capture: [
          ["aspiranteId", "data.aspiranteId"],
          ["expedienteId", "data.expedienteId"],
          ["tokenTemporal", "data.tokenTemporal"],
        ],
      }),
      requestItem({
        name: "Consultar estado del trámite",
        method: "GET",
        route: "/aspirantes/{{aspiranteId}}/estado",
        purpose: "Consulta el folio, estado y observaciones del expediente propio.",
        ufps: ["UFP-01", "UFP-02", "UFP-SUG-03"],
        access: "temporary",
        statuses: [200, 401, 404],
      }),
    ]),

    folder("04. Documentos", "Carga inicial y subsanación de documentos observados.", [
      requestItem({
        name: "Cargar documento del aspirante",
        method: "POST",
        route: "/aspirantes/{{aspiranteId}}/documentos",
        purpose: "Adjunta un archivo al expediente digital del aspirante.",
        ufps: ["UFP-01", "UFP-02"],
        access: "temporary",
        body: formData([
          { key: "tipoDocumento", value: "CERTIFICADO", type: "text" },
          { key: "archivo", type: "file" },
        ]),
        statuses: [201, 400, 413, 415],
        capture: [["documentoId", "data.documentoId"]],
      }),
      requestItem({
        name: "Reemplazar documento observado",
        method: "PATCH",
        route: "/documentos/{{documentoId}}",
        purpose: "Sustituye únicamente un documento marcado con observaciones.",
        ufps: ["UFP-02", "UFP-SUG-03"],
        access: "temporary",
        body: formData([{ key: "archivo", type: "file" }]),
        statuses: [200, 400, 404, 409, 413, 415],
      }),
    ]),

    folder("05. Admisiones y expedientes", "Revisión documental y emisión del dictamen.", [
      requestItem({
        name: "Listar expedientes",
        method: "GET",
        route: "/expedientes",
        purpose: "Lista expedientes autorizados con filtros y paginación.",
        ufps: ["UFP-02", "UFP-04"],
        query: [
          { key: "estado", value: "PENDIENTE_REVISION", description: "Estado del expediente" },
          { key: "carreraId", value: "{{carreraId}}", description: "Carrera solicitada", disabled: true },
          { key: "page", value: "1", description: "Página" },
          { key: "limit", value: "10", description: "Resultados por página" },
        ],
        statuses: [200, 400, 401, 403],
      }),
      requestItem({
        name: "Consultar expediente",
        method: "GET",
        route: "/expedientes/{{expedienteId}}",
        purpose: "Consulta los datos y documentos necesarios para la revisión.",
        ufps: ["UFP-02", "UFP-04"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Emitir dictamen",
        method: "PATCH",
        route: "/expedientes/{{expedienteId}}/dictamen",
        purpose: "Acepta, rechaza u observa el expediente y registra la resolución.",
        ufps: ["UFP-02", "UFP-SUG-03"],
        body: jsonBody({
          estado: "ACEPTADO",
          observaciones: null,
        }),
        statuses: [200, 400, 404, 409],
      }),
    ]),

    folder("06. Alumnos y enrolamiento", "Alta institucional y administración del estado del alumno.", [
      requestItem({
        name: "Enrolar aspirante aceptado",
        method: "POST",
        route: "/alumnos",
        purpose: "Crea el alumno y su matrícula desde un expediente aceptado.",
        ufps: ["UFP-03", "UFP-04"],
        body: jsonBody({ expedienteId: "{{expedienteId}}" }),
        statuses: [201, 404, 409, 500],
        capture: [["alumnoId", "data.alumnoId"]],
      }),
      requestItem({
        name: "Listar alumnos",
        method: "GET",
        route: "/alumnos",
        purpose: "Consulta alumnos dentro del ámbito autorizado.",
        ufps: ["UFP-04", "UFP-05"],
        query: [
          { key: "estado", value: "ACTIVO", description: "Estado escolar", disabled: true },
          { key: "carreraId", value: "{{carreraId}}", description: "Carrera", disabled: true },
          { key: "page", value: "1", description: "Página" },
          { key: "limit", value: "10", description: "Resultados por página" },
        ],
        statuses: [200, 400, 401, 403],
      }),
      requestItem({
        name: "Consultar alumno",
        method: "GET",
        route: "/alumnos/{{alumnoId}}",
        purpose: "Consulta el expediente esencial de un alumno autorizado.",
        ufps: ["UFP-04", "UFP-05"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Cambiar estado del alumno",
        method: "PATCH",
        route: "/alumnos/{{alumnoId}}/estado",
        purpose: "Registra una baja, reincorporación, egreso o cierre autorizado.",
        ufps: ["UFP-04", "UFP-08"],
        body: jsonBody({ estado: "BAJA_TEMPORAL", motivo: "Solicitud autorizada" }),
        statuses: [200, 400, 404, 409],
      }),
    ]),

    folder("07. Portal del alumno", "Consultas propias del alumno autenticado.", [
      requestItem({
        name: "Consultar perfil propio",
        method: "GET",
        route: "/alumnos/me",
        purpose: "Devuelve matrícula, nombre, carrera y estado del alumno autenticado.",
        ufps: ["UFP-06"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Consultar inscripción propia",
        method: "GET",
        route: "/alumnos/me/inscripcion",
        purpose: "Devuelve periodo, grupo, turno y situación de inscripción.",
        ufps: ["UFP-05", "UFP-06"],
        statuses: [200, 401, 403, 404],
      }),
    ]),

    folder("08. Personal", "Administración de empleados, roles y ámbito por carrera.", [
      requestItem({
        name: "Listar empleados",
        method: "GET",
        route: "/empleados",
        purpose: "Consulta al personal y sus roles institucionales.",
        ufps: ["UFP-04"],
        statuses: [200, 401, 403],
      }),
      requestItem({
        name: "Crear empleado",
        method: "POST",
        route: "/empleados",
        purpose: "Registra una cuenta autorizada para Admisiones, Control Escolar o Coordinación.",
        ufps: ["UFP-04", "UFP-SUG-02"],
        body: jsonBody({
          nombre: "Pedro Jair",
          apellidos: "Suárez Flores",
          matricula: "EMP-0005",
          rolId: 4,
          carreraId: "{{carreraId}}",
        }),
        statuses: [201, 400, 409],
        capture: [["empleadoId", "data.empleadoId"]],
      }),
      requestItem({
        name: "Actualizar empleado",
        method: "PUT",
        route: "/empleados/{{empleadoId}}",
        purpose: "Actualiza datos, rol o carrera asignada del empleado.",
        ufps: ["UFP-04", "UFP-SUG-02"],
        body: jsonBody({ rolId: 4, carreraId: "{{carreraId}}", activo: true }),
        statuses: [200, 400, 404, 409],
      }),
    ]),

    folder("09. Periodos y grupos", "Catálogos operativos, cupos y asignación académica.", [
      requestItem({
        name: "Listar periodos",
        method: "GET",
        route: "/periodos",
        purpose: "Consulta periodos disponibles para grupos e inscripciones.",
        ufps: ["UFP-05"],
        statuses: [200, 401],
      }),
      requestItem({
        name: "Crear periodo",
        method: "POST",
        route: "/periodos",
        purpose: "Registra un periodo institucional.",
        ufps: ["UFP-05"],
        body: jsonBody({
          nombre: "2026-2",
          fechaInicio: "2026-08-10",
          fechaFin: "2026-12-11",
          estado: "ACTIVO",
        }),
        statuses: [201, 400, 409],
        capture: [["periodoId", "data.periodoId"]],
      }),
      requestItem({
        name: "Listar grupos",
        method: "GET",
        route: "/grupos",
        purpose: "Consulta grupos y disponibilidad de cupo.",
        ufps: ["UFP-05", "UFP-SUG-01"],
        query: [
          { key: "carreraId", value: "{{carreraId}}", description: "Carrera", disabled: true },
          { key: "periodoId", value: "{{periodoId}}", description: "Periodo", disabled: true },
        ],
        statuses: [200, 400, 401, 403],
      }),
      requestItem({
        name: "Crear grupo",
        method: "POST",
        route: "/grupos",
        purpose: "Crea un grupo y fija su capacidad máxima.",
        ufps: ["UFP-05", "UFP-SUG-01"],
        body: jsonBody({
          turno: "MATUTINO",
          grado: 1,
          capacidadMaxima: 30,
          carreraId: "{{carreraId}}",
          periodoId: "{{periodoId}}",
        }),
        statuses: [201, 400, 404, 409],
        capture: [["grupoId", "data.grupoId"]],
      }),
      requestItem({
        name: "Actualizar grupo",
        method: "PUT",
        route: "/grupos/{{grupoId}}",
        purpose: "Actualiza los datos autorizados de un grupo.",
        ufps: ["UFP-05", "UFP-SUG-01"],
        body: jsonBody({ turno: "MATUTINO", capacidadMaxima: 35 }),
        statuses: [200, 400, 404, 409],
      }),
    ]),

    folder("10. Inscripciones", "Asignación de grupo con validación de carrera, periodo y cupo.", [
      requestItem({
        name: "Inscribir alumno en grupo",
        method: "POST",
        route: "/inscripciones",
        purpose: "Registra la inscripción solo cuando el alumno y el grupo son compatibles y hay cupo.",
        ufps: ["UFP-03", "UFP-05", "UFP-SUG-01"],
        body: jsonBody({ alumnoId: "{{alumnoId}}", grupoId: "{{grupoId}}" }),
        statuses: [201, 404, 409],
      }),
      requestItem({
        name: "Listar inscripciones",
        method: "GET",
        route: "/inscripciones",
        purpose: "Consulta inscripciones mediante filtros autorizados.",
        ufps: ["UFP-03", "UFP-05"],
        query: [
          { key: "periodoId", value: "{{periodoId}}", description: "Periodo" },
          { key: "grupoId", value: "{{grupoId}}", description: "Grupo", disabled: true },
          { key: "alumnoId", value: "{{alumnoId}}", description: "Alumno", disabled: true },
        ],
        statuses: [200, 400, 401, 403],
      }),
    ]),

    folder("11. Conversaciones y mensajes", "Caja de mensajes interna del alumno y las áreas responsables.", [
      requestItem({
        name: "Listar conversaciones",
        method: "GET",
        route: "/conversaciones",
        purpose: "Lista los hilos visibles para el usuario autenticado.",
        ufps: ["UFP-07"],
        statuses: [200, 401, 403],
      }),
      requestItem({
        name: "Crear conversación",
        method: "POST",
        route: "/conversaciones",
        purpose: "Abre una solicitud de ayuda dirigida al área correspondiente.",
        ufps: ["UFP-07"],
        body: jsonBody({ asunto: "Corrección de datos", areaDestino: "CONTROL_ESCOLAR" }),
        statuses: [201, 400, 401, 403],
        capture: [["conversacionId", "data.conversacionId"]],
      }),
      requestItem({
        name: "Consultar conversación",
        method: "GET",
        route: "/conversaciones/{{conversacionId}}",
        purpose: "Consulta un hilo cuando el usuario participa o pertenece al área responsable.",
        ufps: ["UFP-07"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Consultar mensajes",
        method: "GET",
        route: "/conversaciones/{{conversacionId}}/mensajes",
        purpose: "Consulta mensajes sin modificar automáticamente su estado de lectura.",
        ufps: ["UFP-07"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Enviar mensaje",
        method: "POST",
        route: "/conversaciones/{{conversacionId}}/mensajes",
        purpose: "Añade un mensaje al hilo; el remitente se obtiene del JWT.",
        ufps: ["UFP-07"],
        body: jsonBody({ contenido: "Solicito la revisión de mi información." }),
        statuses: [201, 400, 401, 403, 404, 409],
      }),
      requestItem({
        name: "Marcar mensajes como leídos",
        method: "PATCH",
        route: "/conversaciones/{{conversacionId}}/lectura",
        purpose: "Registra la lectura de los mensajes recibidos por el usuario.",
        ufps: ["UFP-07"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Cambiar estado de la conversación",
        method: "PATCH",
        route: "/conversaciones/{{conversacionId}}/estado",
        purpose: "Cierra o reabre el hilo por el área responsable.",
        ufps: ["UFP-07"],
        body: jsonBody({ estado: "CERRADA" }),
        statuses: [200, 400, 401, 403, 404, 409],
      }),
    ]),

    folder("12. Historial y reportes", "Trazabilidad e indicadores del proceso.", [
      requestItem({
        name: "Consultar historial por CURP",
        method: "GET",
        route: "/historial/curp/{{curp}}",
        purpose: "Consulta procesos anteriores, estados y referencias relacionadas con una persona.",
        ufps: ["UFP-04", "UFP-08"],
        statuses: [200, 401, 403, 404],
      }),
      requestItem({
        name: "Consultar reporte de inscripciones",
        method: "GET",
        route: "/reportes/inscripciones",
        purpose: "Devuelve totales e indicadores generales del proceso.",
        ufps: ["UFP-08"],
        query: [
          { key: "periodoId", value: "{{periodoId}}", description: "Periodo", disabled: true },
          { key: "carreraId", value: "{{carreraId}}", description: "Carrera", disabled: true },
        ],
        statuses: [200, 400, 401, 403],
      }),
    ]),

    folder("13. Materias complementarias", "Consulta académica ampliada que no bloquea el núcleo de inscripción.", [
      requestItem({
        name: "Consultar materias",
        method: "GET",
        route: "/materias",
        purpose: "Consulta el catálogo académico cuando el módulo se encuentre habilitado.",
        ufps: ["UFP-05", "UFP-06"],
        statuses: [200, 401],
      }),
    ]),
  ];

  return {
    info: {
      _postman_id: "3f2c8296-d62b-45a4-b4a7-5a391d054671",
      name: "AUT-INS API - Diseño inicial",
      description:
        "Colección base de la etapa 4. Reúne los 35 contratos aprobados para admisión, inscripción y módulos complementarios. Las pruebas sirven como punto de partida y deberán ejecutarse contra la API implementada en la etapa 6.",
      schema: SCHEMA,
    },
    auth: {
      type: "bearer",
      bearer: [{ key: "token", value: "{{jwt}}", type: "string" }],
    },
    variable: variables.map(([key, value]) => ({ key, value, type: "string" })),
    item: folders,
  };
}

function collectRequests(items, result = []) {
  for (const item of items) {
    if (item.request) result.push(item);
    if (item.item) collectRequests(item.item, result);
  }
  return result;
}

function validate(collection) {
  if (collection.info?.schema !== SCHEMA) throw new Error("Esquema Postman v2.1 inválido.");

  const requests = collectRequests(collection.item || []);
  if (requests.length !== 35) {
    throw new Error(`Se esperaban 35 solicitudes y se encontraron ${requests.length}.`);
  }

  const identities = requests.map(
    (item) => `${item.request.method} ${item.request.url.raw.replace("{{baseUrl}}", "")}`,
  );
  if (new Set(identities).size !== identities.length) {
    throw new Error("La colección contiene métodos y rutas duplicados.");
  }

  const documentedCoverage = new Set();
  for (const item of requests) {
    const description = item.request.description || "";
    for (const ufp of REQUIRED_UFPS) {
      if (description.includes(ufp)) documentedCoverage.add(ufp);
    }
    if (!item.event?.some((event) => event.listen === "test")) {
      throw new Error(`La solicitud ${item.name} no contiene pruebas iniciales.`);
    }
  }

  const missing = REQUIRED_UFPS.filter((ufp) => !documentedCoverage.has(ufp));
  if (missing.length) throw new Error(`UFP sin cobertura: ${missing.join(", ")}.`);

  const variableKeys = new Set((collection.variable || []).map((variable) => variable.key));
  for (const required of ["baseUrl", "jwt", "tokenTemporal"]) {
    if (!variableKeys.has(required)) throw new Error(`Falta la variable ${required}.`);
  }

  return { requestCount: requests.length, ufpCount: documentedCoverage.size };
}

const expected = buildCollection();
const summary = validate(expected);
const serialized = `${JSON.stringify(expected, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!fs.existsSync(OUTPUT)) throw new Error(`No existe ${OUTPUT}.`);
  const current = fs.readFileSync(OUTPUT, "utf8");
  if (current !== serialized) {
    throw new Error("La colección no coincide con la definición reproducible. Ejecute npm run postman:build.");
  }
  validate(JSON.parse(current));
  console.log(
    `Colección Postman válida: ${summary.requestCount} rutas y ${summary.ufpCount} UFP cubiertas.`,
  );
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, serialized, "utf8");
  console.log(`Colección generada: ${OUTPUT}`);
}
