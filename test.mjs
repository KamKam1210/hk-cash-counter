import assert from "node:assert/strict";
import { calculateLineCents, calculateTotals, formatHKD, sanitizeCount } from "./calculator.mjs";

assert.equal(sanitizeCount("12abc"), 12);
assert.equal(sanitizeCount(-4), 4);
assert.equal(sanitizeCount(""), 0);
assert.equal(sanitizeCount(1000000), 99999);
assert.equal(calculateLineCents(0.1, 3), 30);
assert.deepEqual(calculateTotals({ "notes-500": 2, "notes-20": 3, "coins-10": 4, "coins-0.1": 5 }), { notes: 106000, coins: 4050, grand: 110050 });
assert.equal(formatHKD(110050), "HK$1,100.50");

console.log("All calculator tests passed.");
