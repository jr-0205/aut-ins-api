const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const expectedModules = [
  "auth",
  "aspirantes",
  "admisiones",
  "control-escolar",
  "coordinacion",
  "alumnos",
  "mensajes",
  "historial",
  "common",
];

const sourceFiles = [];

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".ts")) {
      sourceFiles.push(fullPath);
    }
  }
};

for (const moduleName of expectedModules) {
  const modulePath = path.join(root, "src", "modules", moduleName);

  if (!fs.existsSync(modulePath)) {
    throw new Error(`Falta el modulo requerido: ${moduleName}`);
  }
}

walk(path.join(root, "src"));

const importPattern = /from\s+["'](\.[^"']+)["']/g;

for (const sourceFile of sourceFiles) {
  const source = fs.readFileSync(sourceFile, "utf8");

  for (const match of source.matchAll(importPattern)) {
    const importPath = match[1];
    const resolvedPath = path.resolve(
      path.dirname(sourceFile),
      importPath.replace(/\.js$/, ".ts"),
    );

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Import inexistente en ${path.relative(root, sourceFile)}: ${importPath}`,
      );
    }
  }
}

console.log(
  `Estructura valida: ${expectedModules.length} modulos y ${sourceFiles.length} archivos TypeScript.`,
);
