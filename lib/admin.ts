import { createHash } from "crypto";

export function createAdminSessionValue() {
  const password = process.env.ADMIN_PASSWORD ?? "bostonnest";
  const salt = process.env.ADMIN_SESSION_SALT ?? "boston-nest";

  return createHash("sha256").update(`${password}:${salt}`).digest("hex");
}
