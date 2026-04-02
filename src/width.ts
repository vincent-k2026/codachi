/**
 * Returns the terminal display width of a single character.
 * East Asian Wide/Fullwidth characters occupy 2 cells; most others occupy 1.
 */
export function charWidth(ch: string): number {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return 0;

  // East Asian Wide / Fullwidth ranges that are 2 cells wide in terminals
  if (
    (cp >= 0x1100 && cp <= 0x115F) ||   // Hangul Jamo
    (cp >= 0x2E80 && cp <= 0x303E) ||   // CJK Radicals, Kangxi, Symbols
    (cp >= 0x3040 && cp <= 0x33BF) ||   // Hiragana, Katakana, CJK compat (づ, つ here)
    (cp >= 0x3400 && cp <= 0x4DBF) ||   // CJK Ext A
    (cp >= 0x4E00 && cp <= 0xA4CF) ||   // CJK Unified + Yi
    (cp >= 0xAC00 && cp <= 0xD7A3) ||   // Hangul Syllables
    (cp >= 0xF900 && cp <= 0xFAFF) ||   // CJK Compat Ideographs
    (cp >= 0xFE10 && cp <= 0xFE6F) ||   // CJK Forms
    (cp >= 0xFF01 && cp <= 0xFF60) ||   // Fullwidth ASCII
    (cp >= 0xFFE0 && cp <= 0xFFE6) ||   // Fullwidth signs
    (cp >= 0x1F300 && cp <= 0x1FAFF) || // Emoji
    (cp >= 0x20000 && cp <= 0x3FFFD)    // CJK Ext B+
  ) {
    return 2;
  }

  return 1;
}

/** Calculate the visual terminal width of a string (ignoring ANSI escapes). */
export function stringWidth(str: string): number {
  // Strip ANSI
  const clean = str.replace(/\x1b\[[0-9;]*m/g, '');
  let w = 0;
  for (const ch of clean) {
    w += charWidth(ch);
  }
  return w;
}
