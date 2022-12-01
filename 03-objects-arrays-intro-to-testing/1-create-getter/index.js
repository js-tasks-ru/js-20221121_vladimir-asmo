/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export const createGetter = (path) => (target) =>
  path.split('.').reduce((root, currentLeaf) => root?.[currentLeaf], target);
