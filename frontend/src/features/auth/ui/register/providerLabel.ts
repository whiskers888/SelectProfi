import type { AuthProviderKey } from '@/components/auth'

const providerNames: Record<AuthProviderKey, string> = {
  vk: 'VK ID',
  yandex: 'Яндекс ID',
  gosuslugi: 'Госуслуги / ЕСИА',
  sber: 'Sber ID',
}

export function providerLabel(provider: AuthProviderKey): string {
  return providerNames[provider]
}
