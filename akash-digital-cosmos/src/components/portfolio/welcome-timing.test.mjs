import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldRevealWelcome } from "./welcome-timing.ts";

test("first visit reveals ready content at two seconds", () => {
  assert.equal(shouldRevealWelcome(1999, true, false, false), false);
  assert.equal(shouldRevealWelcome(2000, true, false, false), true);
});
test("slow content never blocks beyond the fallback", () => {
  assert.equal(shouldRevealWelcome(2000, false, false, false), false);
  assert.equal(shouldRevealWelcome(4500, false, false, false), true);
});
test("returning visitors have no forced delay", () => {
  assert.equal(shouldRevealWelcome(0, true, true, false), true);
});
test("reduced motion skips the extended animation", () => {
  assert.equal(shouldRevealWelcome(150, true, false, true), true);
});
