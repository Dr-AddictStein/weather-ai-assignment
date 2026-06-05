import type { TreeAnalysis, TreeHealth, TreeHistoryResponse } from '@/types';

export function getTreeHealth(analysis: TreeAnalysis): TreeHealth | undefined {
  return analysis.tree_health;
}

export function getHealthyCount(health?: TreeHealth): number {
  return health?.healthy ?? 0;
}

export function getNeedsCareCount(health?: TreeHealth): number {
  return health?.needs_care ?? 0;
}

export function getNeedsReplacementCount(health?: TreeHealth): number {
  return health?.needs_replacement ?? 0;
}

export function getHealthyRatio(analysis: TreeAnalysis): number {
  const health = getTreeHealth(analysis);
  if (!health?.healthy) return 0;
  const total =
    getHealthyCount(health) +
    getNeedsCareCount(health) +
    getNeedsReplacementCount(health);
  return total > 0 ? Math.round((health.healthy / total) * 100) : 0;
}

export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatCanopy(pct: number): string {
  return `${Math.round(pct * 10) / 10}%`;
}

export function formatAnalysisDate(timestamp?: string): string {
  if (!timestamp) return '—';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export function getHistoryAnalyses(data?: TreeHistoryResponse): TreeAnalysis[] {
  return data?.analyses ?? [];
}
