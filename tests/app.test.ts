import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";

import { createApp } from "../src/app.js";

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("health expone el estado beta y cabeceras defensivas", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, { headers: { "x-request-id": "test-request" } });
    const payload = await response.json() as { data: { releaseStage: string } };
    assert.equal(response.status, 200);
    assert.equal(payload.data.releaseStage, "beta");
    assert.equal(response.headers.get("x-request-id"), "test-request");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
});

test("las rutas desconocidas conservan el contrato de error", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const payload = await response.json() as {
      success: boolean;
      error: { code: string; requestId: string };
    };
    assert.equal(response.status, 404);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, "ROUTE_NOT_FOUND");
    assert.ok(payload.error.requestId);
  });
});
