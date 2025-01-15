/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

class PageSelector {
  constructor(state = {}) {
    this.state = state;
  }

  getFilter(name) {
    const page = this.state[name];
    return isDefined(page) ? page.filter : undefined;
  }
}

/**
 * Get a PageSelector from the root state
 *
 * @param {Object} rootState
 * @returns {PageSelector} A PageSelector instance
 */
const getPage = (rootState = {}) => new PageSelector(rootState.pages);

export default getPage;
