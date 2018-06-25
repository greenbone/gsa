/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

export default compose;

// vim: set ts=2 sw=2 tw=80:
