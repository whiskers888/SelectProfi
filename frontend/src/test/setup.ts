import '@testing-library/jest-dom/vitest'

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {}
}

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = function hasPointerCapture() {
    return false
  }
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = function setPointerCapture() {}
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = function releasePointerCapture() {}
}

if (
  typeof window !== 'undefined' &&
  (typeof window.localStorage.getItem !== 'function' ||
    typeof window.localStorage.setItem !== 'function' ||
    typeof window.localStorage.removeItem !== 'function' ||
    typeof window.localStorage.clear !== 'function')
) {
  const storageMap = new Map<string, string>()

  const localStorageMock: Storage = {
    get length() {
      return storageMap.size
    },
    clear() {
      storageMap.clear()
    },
    getItem(key: string) {
      return storageMap.get(key) ?? null
    },
    key(index: number) {
      return Array.from(storageMap.keys())[index] ?? null
    },
    removeItem(key: string) {
      storageMap.delete(key)
    },
    setItem(key: string, value: string) {
      storageMap.set(key, String(value))
    },
  }

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
    writable: true,
  })
}
