export const CLEANUP_STORAGE_KEY = 'marine-ai-demo-cleanup-tasks';
function isCleanupTask(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value;
    return (typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.locationName === 'string' &&
        typeof candidate.priority === 'string' &&
        typeof candidate.recommendedAction === 'string' &&
        typeof candidate.assignedTeam === 'string' &&
        typeof candidate.dueDate === 'string' &&
        typeof candidate.status === 'string');
}
export function safeLocalStorage() {
    try {
        return window.localStorage;
    }
    catch {
        return null;
    }
}
export function loadCleanupTasks() {
    const storage = safeLocalStorage();
    if (!storage) {
        return [];
    }
    let rawValue;
    try {
        rawValue = storage.getItem(CLEANUP_STORAGE_KEY);
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
        const validTasks = parsed.filter(isCleanupTask);
        return validTasks.filter((task) => !['TASK-1001', 'TASK-1002', 'TASK-1003', 'TASK-1004'].includes(task.id));
    }
    catch {
        return [];
    }
}
export function saveCleanupTasks(tasks) {
    const storage = safeLocalStorage();
    if (!storage) {
        return tasks;
    }
    storage.setItem(CLEANUP_STORAGE_KEY, JSON.stringify(tasks));
    return tasks;
}
export function resetCleanupTasks() {
    const storage = safeLocalStorage();
    if (storage) {
        storage.removeItem(CLEANUP_STORAGE_KEY);
    }
    return [];
}
