// Which auth backend the app talks to.
//
// `mock` runs entirely in-process against mock-driver.ts; `http` talks to
// Django. Nothing above this file changes between them.
import { httpDriver } from "./http-driver";
import { mockDriver } from "./mock-driver";
import type { AuthDriver } from "./types";

const driver = process.env.AUTH_DRIVER ?? "mock";
const isProduction = process.env.NODE_ENV === "production";

export const usingMockAuth = driver !== "http";

/**
 * Whether the mock may reveal the code it "sent".
 *
 * Separate from `usingMockAuth` on purpose: a demo deployment running the mock
 * still shouldn't print codes into a page anyone can load.
 */
export const revealMockCode = usingMockAuth && !isProduction;

/**
 * A mock that hands out real sessions must never be what serves users.
 *
 * It authenticates anyone who can read a code it prints on the page, so a
 * deploy that merely forgot to set AUTH_DRIVER would be an open door with no
 * outward sign. This refuses to authenticate at all instead.
 *
 * Checked on first use rather than at import: `next build` evaluates this
 * module with NODE_ENV=production while compiling, and the build environment
 * legitimately lacks the deploy's variables. Build-phase flags are no help —
 * `process.env.NEXT_PHASE` is inlined into the server bundle, so its build-time
 * value survives into the running server and any check against it is dead code.
 * A driver method, by contrast, is only ever reached by a real request.
 *
 * ALLOW_MOCK_AUTH=1 opts a preview or demo deployment back in, deliberately.
 */
function assertDriverIsSafe(): void {
  if (isProduction && usingMockAuth && process.env.ALLOW_MOCK_AUTH !== "1") {
    throw new Error(
      "Refusing to authenticate: AUTH_DRIVER is not 'http' in a production " +
        "server. The mock auth driver issues sessions to anyone. Set " +
        "AUTH_DRIVER=http, or ALLOW_MOCK_AUTH=1 for a deliberate demo deploy.",
    );
  }
}

const selected: AuthDriver = usingMockAuth ? mockDriver : httpDriver;

export const authDriver: AuthDriver = new Proxy(selected, {
  get(target, property, receiver) {
    assertDriverIsSafe();
    return Reflect.get(target, property, receiver) as unknown;
  },
});
