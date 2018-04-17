/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {is_defined, has_value} from 'gmp/utils/index';

class DashboardSetting {

  constructor(rootState) {
    this.state = rootState;
  }

  getItemsById(id) {
    if (is_defined(this.state) && has_value(this.state.items)) {
      const items = this.state.items[id];
      return is_defined(items) ? items : null;
    }
    return undefined;
  }

  getError() {
    return is_defined(this.state) ? this.state.error : undefined;
  }

  getIsLoading() {
    return is_defined(this.state) ? this.state.isLoading : false;
  }

}

const getDashboardSettings = rootState => {
  const dashboardSettings = is_defined(rootState) ?
    rootState.dashboardSettings : undefined;

  return new DashboardSetting(dashboardSettings);
};

export default getDashboardSettings;

// vim: set ts=2 sw=2 tw=80:

