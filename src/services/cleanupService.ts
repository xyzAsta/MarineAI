import type { CleanupTask } from '../types';

export const CLEANUP_STORAGE_KEY = 'marine-ai-demo-cleanup-tasks';

function isCleanupTask(value: unknown): value is CleanupTask {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<CleanupTask>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.locationName === 'string' &&
    typeof candidate.priority === 'string' &&
    typeof candidate.recommendedAction === 'string' &&
    typeof candidate.assignedTeam === 'string' &&
    typeof candidate.dueDate === 'string' &&
    typeof candidate.status === 'string'
  );
}

export function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadCleanupTasks(): CleanupTask[] {
  const storage = safeLocalStorage();

  if (!storage) {
    return [];
  }

  let rawValue: string | null;
  try {
    rawValue = storage.getItem(CLEANUP_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validTasks = parsed.filter(isCleanupTask);
    return validTasks.filter((task) => !['TASK-1001', 'TASK-1002', 'TASK-1003', 'TASK-1004'].includes(task.id));
  } catch {
    return [];
  }
}

export function saveCleanupTasks(tasks: CleanupTask[]): CleanupTask[] {
  const storage = safeLocalStorage();
  if (!storage) {
    return tasks;
  }

  storage.setItem(CLEANUP_STORAGE_KEY, JSON.stringify(tasks));
  return tasks;
}

export function resetCleanupTasks(): CleanupTask[] {
  const storage = safeLocalStorage();

  if (storage) {
    storage.removeItem(CLEANUP_STORAGE_KEY);
  }

  return [];
}
