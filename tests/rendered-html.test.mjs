import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Sunrise show journey", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Музыкальные вечера и шоу в/);
  assert.match(html, /Расписание ближайших шоу уточняется/);
  assert.match(html, /Проверим программу и проживание/);
  assert.match(html, /Подготовить запрос/);
  assert.match(html, /assets\/sunrise\/hero\/evening\.jpg/);
  assert.match(html, /Шаг 1 из 5/);
  assert.doesNotMatch(html, /sunrise-hotel\.ru\/wa-data/);
  assert.doesNotMatch(html, /2025|codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
