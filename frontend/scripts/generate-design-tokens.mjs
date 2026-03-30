import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const sourcePath = resolve(projectRoot, 'src/design/tokens.json')
const targetPath = resolve(projectRoot, 'src/design/tokens.css')

function hexToHslTriplet(hex) {
  const normalized = hex.trim().replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized

  const red = Number.parseInt(value.slice(0, 2), 16) / 255
  const green = Number.parseInt(value.slice(2, 4), 16) / 255
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6
    } else if (max === green) {
      hue = (blue - red) / delta + 2
    } else {
      hue = (red - green) / delta + 4
    }
  }

  hue = Math.round(hue * 60)
  if (hue < 0) {
    hue += 360
  }

  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}

function toCssVarValue(value) {
  if (typeof value !== 'string') {
    return String(value)
  }

  if (value.startsWith('#')) {
    return hexToHslTriplet(value)
  }

  return value
}

function createThemeBlock(selector, themeTokens, radius, colorScheme) {
  const entries = Object.entries(themeTokens).map(([name, value]) => `  --${name}: ${toCssVarValue(value)};`)
  entries.push(`  --radius: ${radius};`)
  if (colorScheme) {
    entries.push(`  color-scheme: ${colorScheme};`)
  }

  return `${selector} {\n${entries.join('\n')}\n}`
}

const tokenDocument = JSON.parse(readFileSync(sourcePath, 'utf8'))
const lightBlock = createThemeBlock(
  ':root',
  tokenDocument.themes.light,
  tokenDocument.dimension.radius,
  'light',
)
const darkBlock = createThemeBlock('.dark', tokenDocument.themes.dark, tokenDocument.dimension.radius, 'dark')

const content = `${lightBlock}\n\n${darkBlock}\n`
writeFileSync(targetPath, content, 'utf8')
