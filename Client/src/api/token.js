// In-memory auth store (XSS-safe)
// Tokens are never written to disk. Session persistence relies on the HTTP-only refresh cookie.

let _accessToken = null;
let _user = null;

export const setAuthData = (data) => {
  if (data?.token) _accessToken = data.token;
  if (data?.user) _user = data.user;
};

export const clearAuthData = () => {
  _accessToken = null;
  _user = null;
};

export const getToken = () => _accessToken;
export const getStoredUser = () => _user;
export const getUserRole = () => _user?.role ?? null;
export const getUserName = () => _user?.name || _user?.username || "";

// ✅ FIX: Only check token — _user is populated AFTER getMe() returns.
// On reload: token is set by the refresh call, but _user is still null at that point.
// The old check (!!_accessToken && !!_user) caused getMe() in authApi.js to bail
// early and return null, which then triggered clearAuth() and wiped the valid session.
export const isAuthenticated = () => !!_accessToken;

export const getLastLogin = () =>
  _user?.lastLogin ? new Date(_user.lastLogin) : null;

