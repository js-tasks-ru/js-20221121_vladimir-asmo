/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export const trimSymbols = (string, size) =>
  hasSizeError(size)
    ? handleError(string, size)
    : [].reduce.call(string, reduceCharsByLimit(size), '');

const hasSizeError = (size) => !size;

const handleError = (string, size) => (size === 0 ? '' : string);

const reduceCharsByLimit = (limit) => (result, char) =>
  isCharInLimit(result, char, limit) ? result.concat(char) : result;

const isCharInLimit = (target, char, limit) =>
  !target.endsWith(char.repeat(limit));


