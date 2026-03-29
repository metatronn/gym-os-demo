export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function randomHexToken(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function splitFullName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return {
      fullName: null,
      firstName: null,
      lastName: null,
    };
  }

  const [firstName, ...rest] = normalized.split(" ");
  const lastName = rest.length > 0 ? rest.join(" ") : null;

  return {
    fullName: normalized,
    firstName,
    lastName,
  };
}

export function isJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.startsWith("application/json");
}

export function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return origin === new URL(request.url).origin;
}
