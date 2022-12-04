/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export const createGetter = (path) => {
  const paths = path.split('.');

  return (target) =>
    paths.reduce((root, currentLeaf) => root?.[currentLeaf], target);
};
