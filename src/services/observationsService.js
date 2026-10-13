export const OBSERVATIONS_STORAGE_KEY = 'marine-ai-demo-observations';
function isObservation(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value;
    return (typeof candidate.id === 'string' &&
        typeof candidate.locationName === 'string' &&
        (typeof candidate.latitude === 'number' || candidate.latitude === null) &&
        (typeof candidate.longitude === 'number' || candidate.longitude === null) &&
        typeof candidate.timestamp === 'string' &&
        typeof candidate.debrisCategory === 'string' &&
        typeof candidate.condition === 'string' &&
        typeof candidate.detectionConfidence === 'number' &&
        typeof candidate.conditionConfidence === 'number' &&
        typeof candidate.riskScore === 'number' &&
        typeof candidate.severity === 'string' &&
        typeof candidate.reviewStatus === 'string' &&
        typeof candidate.notes === 'string' &&
        typeof candidate.source === 'string' &&
        typeof candidate.demoDataIndicator === 'string');
}
export function safeLocalStorage() {
    try {
        return window.localStorage;
    }
    catch {
        return null;
    }
}
export function loadObservations() {
    const storage = safeLocalStorage();
    if (!storage) {
        return [];
    }
    let rawValue;
    try {
        rawValue = storage.getItem(OBSERVATIONS_STORAGE_KEY);
    }
    catch {
        return [];
    }
    if (!rawValue) {
        return [];
    }
    try {
        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .filter(isObservation)
            .filter((observation) => observation.source !== 'demo' && observation.demoDataIndicator !== 'demonstration fixture');
    }
    catch {
        return [];
    }
}
export function saveObservations(observations) {
    const storage = safeLocalStorage();
    if (!storage) {
        return observations;
    }
    storage.setItem(OBSERVATIONS_STORAGE_KEY, JSON.stringify(observations));
    return observations;
}
export function resetObservations() {
    const storage = safeLocalStorage();
    if (storage) {
        storage.removeItem(OBSERVATIONS_STORAGE_KEY);
    }
    return [];
}
