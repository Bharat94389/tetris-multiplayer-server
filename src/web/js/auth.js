// Shared auth + API helpers. Include with `data-require-auth` on pages that need a logged-in user.
const TOKEN_KEY = 'jwt';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

const parseToken = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (err) {
        return null;
    }
};

const isTokenValid = (token) => {
    const payload = token && parseToken(token);
    // exp is in seconds while Date.now() is in milliseconds
    return Boolean(payload && (!payload.exp || payload.exp * 1000 > Date.now()));
};

const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('/login');
};

const api = async (method, url, body) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (err) {
        // non JSON responses (eg. rate limiter) are surfaced as the error message
        data = { message: text };
    }

    if (!res.ok) {
        const error = new Error(data?.message || `Request failed (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return data;
};

const escapeHtml = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );

let userDetails = null;

if (document.currentScript?.hasAttribute('data-require-auth')) {
    const token = getToken();
    if (isTokenValid(token)) {
        const payload = parseToken(token);
        userDetails = { token, username: payload.username, email: payload.email };
    } else {
        logout();
    }
}
