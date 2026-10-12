const DEMO_EMAIL = 'demo@marineai.com';
const DEMO_PASSWORD = 'MarineAI@123';
const DEMO_SESSION_KEY = 'marine-ai-demo-session';
const DEMO_SESSION_MARKER = 'authenticated';

export type DemoSession = { email: string };

export function readDemoSession(): DemoSession | null {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === DEMO_SESSION_MARKER
    ? { email: DEMO_EMAIL }
    : null;
}

export function createDemoSession(email: string, password: string): DemoSession | null {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return null;
  }

  sessionStorage.setItem(DEMO_SESSION_KEY, DEMO_SESSION_MARKER);
  return { email: DEMO_EMAIL };
}

export function clearDemoSession(): void {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}
