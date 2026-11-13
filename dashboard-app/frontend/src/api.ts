import type { Dashboard, RoleKey } from './types';

const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export async function fetchDashboard(role: RoleKey): Promise<Dashboard> {
  const response = await fetch(`${API_URL}/dashboard/${role}`);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить дашборд (${response.status})`);
  }
  return (await response.json()) as Dashboard;
}
