/**
 * compare
 * @param {string} str1
 * @param {string} str2
 * @param {'upper'|'lower'} [caseFirst='upper']
 * @returns number
 */
const compare = (str1, str2, caseFirst = 'upper') =>
  str1.localeCompare(str2, ['ru', 'en'], { caseFirst });

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export const sortStrings = (arr, param = 'asc') =>
  [...arr].sort((a, b) =>
    param === 'asc' ? compare(a, b) : compare(b, a, 'lower')
  );
