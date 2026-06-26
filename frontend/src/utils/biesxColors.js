/**
 * biesxColors.js — BIESX Tag Visualization Utilities
 *
 * Maps BIESX tags to display colors and provides helper functions
 * for zipping tokens with tags and assembling word segments.
 *
 * BIESX Tag Scheme:
 *   B = Begin    — first character of a multi-char word
 *   I = Inside   — middle character(s) of a multi-char word
 *   E = End      — last character of a multi-char word
 *   S = Single   — a word consisting of a single character
 *   X = External — space, punctuation, or non-word tokens
 */

// ── Tag → Color Mapping ─────────────────────

export const BIESX_MAP = {
  B: {
    color: '#0A6C7A',
    bg: 'rgba(10, 108, 122, 0.14)',
    border: 'rgba(10, 108, 122, 0.35)',
    label: 'Begin',
    emoji: '▶',
  },
  I: {
    color: '#065A68',
    bg: 'rgba(6, 90, 104, 0.10)',
    border: 'rgba(6, 90, 104, 0.30)',
    label: 'Inside',
    emoji: '─',
  },
  E: {
    color: '#02343F',
    bg: 'rgba(2, 52, 63, 0.14)',
    border: 'rgba(2, 52, 63, 0.35)',
    label: 'End',
    emoji: '◀',
  },
  S: {
    color: '#2E7D32',
    bg: 'rgba(46, 125, 50, 0.12)',
    border: 'rgba(46, 125, 50, 0.35)',
    label: 'Single',
    emoji: '●',
  },
  X: {
    color: '#9E9E9E',
    bg: 'rgba(158, 158, 158, 0.08)',
    border: 'rgba(158, 158, 158, 0.25)',
    label: 'External',
    emoji: '·',
  },
}

// Fallback for unknown tags
const UNKNOWN_STYLE = {
  color: '#666',
  bg: 'rgba(100, 100, 100, 0.08)',
  border: 'rgba(100, 100, 100, 0.2)',
  label: '?',
  emoji: '?',
}

/**
 * Get style info for a BIESX tag.
 * @param {string} tag — one of B, I, E, S, X
 * @returns {{ color, bg, border, label, emoji }}
 */
export function getTagStyle(tag) {
  return BIESX_MAP[tag?.toUpperCase()] || UNKNOWN_STYLE
}


// ── Zip Tokens + Tags ───────────────────────

/**
 * Zip tokens and tags into an array of { token, tag, style } objects.
 * Useful for rendering each token with its tag color.
 *
 * @param {string[]} tokens — array of character tokens
 * @param {string[]} tags   — BIESX tag array (same length)
 * @returns {Array<{ token: string, tag: string, style: object, index: number }>}
 */
export function zipTokensWithTags(tokens, tags) {
  if (!tokens || !tags || tokens.length !== tags.length) {
    console.warn('[biesxColors] tokens and tags length mismatch', {
      tokensLen: tokens?.length,
      tagsLen: tags?.length,
    })
    return []
  }

  return tokens.map((token, index) => ({
    token,
    tag: tags[index],
    style: getTagStyle(tags[index]),
    index,
  }))
}


// ── Group Tokens by Word ────────────────────

/**
 * Group consecutive tokens into word-level groups based on BIESX boundaries.
 * Each group represents one assembled word with its constituent tokens and tags.
 *
 * @param {string[]} tokens
 * @param {string[]} tags
 * @returns {Array<{ word: string, chars: Array<{ token, tag, style }>, isExternal: boolean }>}
 */
export function groupTokensByWord(tokens, tags) {
  if (!tokens || !tags || tokens.length === 0) return []

  const groups = []
  let currentGroup = null

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const tag = tags[i]?.toUpperCase()
    const style = getTagStyle(tag)

    if (tag === 'X') {
      // Flush current group
      if (currentGroup) {
        groups.push(currentGroup)
        currentGroup = null
      }
      // External tokens can be grouped or kept separate
      // Skip spaces for cleaner display
      continue
    }

    if (tag === 'S') {
      // Flush and create standalone group
      if (currentGroup) {
        groups.push(currentGroup)
      }
      groups.push({
        word: token,
        chars: [{ token, tag, style }],
        isExternal: false,
      })
      currentGroup = null
      continue
    }

    if (tag === 'B') {
      // Start new group
      if (currentGroup) {
        groups.push(currentGroup)
      }
      currentGroup = {
        word: token,
        chars: [{ token, tag, style }],
        isExternal: false,
      }
      continue
    }

    if (tag === 'I' || tag === 'E') {
      if (currentGroup) {
        currentGroup.word += token
        currentGroup.chars.push({ token, tag, style })
      } else {
        // Orphaned I/E — start a new group anyway
        currentGroup = {
          word: token,
          chars: [{ token, tag, style }],
          isExternal: false,
        }
      }

      if (tag === 'E') {
        groups.push(currentGroup)
        currentGroup = null
      }
    }
  }

  // Flush remaining
  if (currentGroup) {
    groups.push(currentGroup)
  }

  return groups
}


// ── Tag Legend Data ──────────────────────────

/**
 * Get legend items for displaying a BIESX color key.
 * @returns {Array<{ tag, label, color, bg, border, emoji }>}
 */
export function getTagLegend() {
  return Object.entries(BIESX_MAP).map(([tag, style]) => ({
    tag,
    ...style,
  }))
}
