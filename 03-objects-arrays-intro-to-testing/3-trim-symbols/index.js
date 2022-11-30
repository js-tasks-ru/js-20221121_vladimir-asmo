/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }
  if (!size) {
    return string;
  }

  let result = '';

  for (const char of string) {
    if (!result.endsWith(char.repeat(size))) {
      result += char;
    }
  }

  return result;
}
