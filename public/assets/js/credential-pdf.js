const cleanPdfText = (value, maximumLength = 180) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);

const platformAccessUrl = () =>
  window.location.protocol === "file:"
    ? "http://localhost:3000/#/login"
    : `${window.location.origin}/#/login`;

export const downloadCredentialPdf = (student) => {
  const JsPdf = window.jspdf?.jsPDF;
  if (!JsPdf) {
    throw new Error("No fue posible cargar el generador del PDF. Revisa tu conexión e inténtalo nuevamente.");
  }

  const name = cleanPdfText(student.name);
  const registration = cleanPdfText(student.registration, 40);
  const password = cleanPdfText(student.temporaryPassword, 80);
  const career = cleanPdfText(student.career);
  const accessUrl = cleanPdfText(platformAccessUrl());
  const generatedAt = new Date(student.credentialsGeneratedAt ?? student.enrolledAt ?? Date.now());
  const issuedAt = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);

  const doc = new JsPdf({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const navy = [18, 43, 78];
  const blue = [35, 91, 177];
  const paleBlue = [239, 245, 255];
  const ink = [27, 39, 55];
  const muted = [91, 105, 124];

  doc.setProperties({
    title: `Credenciales AUT-INS - ${registration}`,
    subject: "Acceso inicial a la plataforma personal del alumno",
    author: "AUT-INS",
    creator: "Sistema AUT-INS",
  });

  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 48, "F");
  doc.setFillColor(...blue);
  doc.rect(0, 48, 210, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text("AUT-INS", 20, 23);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Administración y Control de Inscripciones Escolares", 20, 31);
  doc.text("CREDENCIALES DE ACCESO INICIAL", 20, 40);

  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Bienvenido a tu plataforma personal", 20, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...muted);
  const welcome = doc.splitTextToSize(
    "Control Escolar ha concluido tu enrolamiento. Utiliza estas credenciales para ingresar y consultar tu información de inscripción.",
    170,
  );
  doc.text(welcome, 20, 79);

  doc.setDrawColor(204, 216, 232);
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(20, 98, 170, 74, 3, 3, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...muted);
  doc.text("ALUMNO", 30, 112);
  doc.text("CARRERA", 30, 134);
  doc.text("MATRÍCULA", 30, 156);
  doc.text("CONTRASEÑA TEMPORAL", 112, 156);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(name, 30, 119);
  doc.text(doc.splitTextToSize(career, 150), 30, 141);

  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...blue);
  doc.text(registration, 30, 165);
  doc.text(password, 112, 165);

  doc.setFillColor(...paleBlue);
  doc.roundedRect(20, 184, 170, 25, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text("ACCESO A LA PLATAFORMA", 30, 195);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...blue);
  doc.text(accessUrl, 30, 202);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ink);
  doc.text("Indicaciones importantes", 20, 226);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...muted);
  doc.text("1. Ingresa con tu matrícula y la contraseña temporal indicada arriba.", 25, 237);
  doc.text("2. Cambia la contraseña temporal durante tu primer acceso.", 25, 245);
  doc.text("3. Conserva este documento en un lugar seguro y no compartas tus credenciales.", 25, 253);

  doc.setDrawColor(218, 226, 237);
  doc.line(20, 269, 190, 269);
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`Emitido: ${cleanPdfText(issuedAt)}`, 20, 278);
  doc.text("Documento confidencial de acceso personal", 190, 278, { align: "right" });

  const filename = `AUT-INS_credenciales_${registration.replace(/[^A-Za-z0-9_-]/g, "")}.pdf`;
  doc.save(filename);
  return filename;
};
