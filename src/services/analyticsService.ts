import type { CleanupTask, Observation, RiskSeverity } from '../types';

export function getSeverityBreakdown(observations: Observation[]): Record<RiskSeverity, number> {
  return {
    Low: observations.filter((observation) => observation.severity === 'Low').length,
    Moderate: observations.filter((observation) => observation.severity === 'Moderate').length,
    High: observations.filter((observation) => observation.severity === 'High').length,
    Critical: observations.filter((observation) => observation.severity === 'Critical').length,
  };
}

export function getCategoryDistribution(observations: Observation[]): Array<{ label: string; value: number }> {
  const categories = new Map<string, number>();

  observations.forEach((observation) => {
    const current = categories.get(observation.debrisCategory) ?? 0;
    categories.set(observation.debrisCategory, current + 1);
  });

  return [...categories.entries()].map(([label, value]) => ({ label, value }));
}

export function getTaskCompletionStats(tasks: CleanupTask[]): Array<{ label: string; value: number }> {
  return [
    { label: 'Pending', value: tasks.filter((task) => task.status === 'Pending').length },
    { label: 'In progress', value: tasks.filter((task) => task.status === 'In progress').length },
    { label: 'Completed', value: tasks.filter((task) => task.status === 'Completed').length },
  ];
}

export function getCountByDate(observations: Observation[]): Array<{ label: string; value: number }> {
  const map = new Map<string, number>();

  observations.forEach((observation) => {
    const label = observation.timestamp.slice(0, 10);
    map.set(label, (map.get(label) ?? 0) + 1);
  });

  return [...map.entries()].map(([label, value]) => ({ label, value }));
}
