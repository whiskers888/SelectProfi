import type { RoleKey } from '../types';

export const CHIP_GROUP_MAP: Record<RoleKey, Record<string, string | null>> = {
  executor: {
    'Требуют действия': 'Требуют вашего действия',
    'Ожидают заказчика': 'Ожидают заказчика',
    Архив: null
  },
  customer: {
    'Требуют решения': 'Требуют вашего решения',
    'В работе': 'В работе',
    Архив: null
  },
  applicant: {
    Приглашения: 'Требуют ответа',
    'На рассмотрении': 'На рассмотрении',
    Архив: null
  }
};

export function chipBaseLabel(chip: string): string {
  return chip.replace(/\s*\(\d+\)$/, '').trim();
}

export function isAllChip(chip: string): boolean {
  return chipBaseLabel(chip).startsWith('Все');
}

export function chipGroup(chip: string, role: RoleKey): string | null {
  return CHIP_GROUP_MAP[role][chipBaseLabel(chip)] ?? null;
}
