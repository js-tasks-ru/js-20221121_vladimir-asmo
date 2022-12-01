/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export const invertObj = (obj) =>
  !!obj
    ? Object.fromEntries(Object.entries(obj).map((entry) => entry.reverse()))
    : obj;
