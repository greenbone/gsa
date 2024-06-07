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

const getPage = (rootState = {}) => new PageSelector(rootState.pages);

export default getPage;

// vim: set ts=2 sw=2 tw=80:
