const DEMO_EMAIL = 'demo@marineai.com';
const DEMO_PASSWORD = 'MarineAI@123';
const DEMO_SESSION_KEY = 'marine-ai-demo-session';
const DEMO_SESSION_MARKER = 'authenticated';
export function readDemoSession() {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === DEMO_SESSION_MARKER
        ? { email: DEMO_EMAIL }
        : null;
}
export function createDemoSession(email, password) {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        return null;
    }
    sessionStorage.setItem(DEMO_SESSION_KEY, DEMO_SESSION_MARKER);
    return { email: DEMO_EMAIL };
}
export function clearDemoSession() {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
}
