import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function loadAppWithStorage(localStorage) {
  const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const noopElement = {
    addEventListener() {},
    append() {},
    appendChild() {},
    classList: { add() {}, remove() {}, toggle() {} },
    focus() {},
    getAttribute() {
      return "";
    },
    querySelector() {
      return null;
    },
    removeAttribute() {},
    setAttribute() {},
    style: {},
    textContent: "",
    value: "",
  };
  const document = {
    createElement() {
      return { ...noopElement };
    },
    getElementById() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    title: "",
  };

  const context = {
    Audio: function Audio() {
      return { addEventListener() {} };
    },
    console: {
      error() {},
      log() {},
      warn() {},
    },
    document,
    fetch() {
      return Promise.reject(new Error("fetch unavailable in unit test"));
    },
    HTMLElement: function HTMLElement() {},
    L: {},
    localStorage,
    setTimeout,
  };

  vm.runInNewContext(source, context, { filename: "app.js" });
  return context;
}

const storage = createStorage({ wisslr_records: "not-json" });
const { saveRecordToLocal } = loadAppWithStorage(storage);

const saved = saveRecordToLocal({
  participantName: "Test Participant",
  mapCountrySelection: "India",
  submittedAt: "2026-05-03T12:00:00.000Z",
});

assert.equal(saved, true);
assert.deepEqual(JSON.parse(storage.getItem("wisslr_records")), [
  {
    participantName: "Test Participant",
    mapCountrySelection: "India",
    submittedAt: "2026-05-03T12:00:00.000Z",
  },
]);
