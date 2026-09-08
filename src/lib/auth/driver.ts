import { httpDriver } from "./http-driver";
import type { AuthDriver } from "./types";

/**
 * Primary authentication driver.
 * Directly forwards all authentication operations to the Django backend over HTTP.
 */
export const authDriver: AuthDriver = httpDriver;
