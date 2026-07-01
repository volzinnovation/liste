const assert = require("node:assert/strict");

const { decodeHash, encodeList, normalizeItem } = require("../app.js");

const cases = [
  [],
  ["Milch", "Brot", "Butter"],
  ["  viele   Leerzeichen  ", "Umlaute: ä ö ü ß", "Semikolon; bleibt"],
  ["emoji 🚗", "https://example.com/?a=1&b=2"],
];

for (const items of cases) {
  const expected = items.map(normalizeItem).filter(Boolean);
  const encoded = encodeList(items);
  assert.deepEqual(decodeHash(`#${encoded}`), expected);
}

assert.equal(encodeList(["", "   "]), "");
assert.deepEqual(decodeHash("#Milch;Brot;"), ["Milch", "Brot"]);

console.log("URL hash round-trips passed.");
