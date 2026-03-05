const AUTH_STORAGE_KEY = "aism.currentUser";

function normalizeAuthUser(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.user && typeof payload.user === "object") {
    return payload.user;
  }

  return payload;
}

async function request(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "认证请求失败。");
  }

  return normalizeAuthUser(data);
}

export async function login(credentials) {
  return request("/api/auth/login", credentials);
}

export async function merchantLogin(credentials) {
  return request("/api/auth/merchant/login", credentials);
}

export async function register(payload) {
  return request("/api/auth/register", payload);
}

export async function registerMerchant(payload) {
  return request("/api/auth/merchant/register", payload);
}

export function loadStoredUser() {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeUser(user) {
  const normalized = normalizeAuthUser(user);

  if (!normalized) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearStoredUser() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
