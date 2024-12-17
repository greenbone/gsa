/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Compose several HOCs
 *
 * Instead of
 *
 *   withHOC1(params1)(withHOC2(params2)(MyComponent));
 *
 * using
 *
 *   const MyEnhancedComponent = compose(
 *    withHoc1(params1),
 *    withHoc2(params2),
 *   )(MyComponent);
 *
 * or
 *
 *  const myHOC = compose(
 *    withHoc1(params1),
 *    withHoc2(params2),
 *   );
 *
 *  const MyEnhancedComponent1 = myHOC(MyComponent1);
 *  const MyEnhancedComponent2 = myHOC(MyComponent2);
 *
 * is much cleaner.
 *
 * @see https://github.com/acdlite/recompose/blob/master/docs/API.md#compose
 *
 * @param {...Function} [funcs] The HOCs to compose.
 * @returns {Function} New HOC that wraps
 */
const compose = (...funcs) => {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
  );
};

export default compose;
