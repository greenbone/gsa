/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import EntityCommand from './entity';

class InfoEntityCommand extends EntityCommand {
  constructor(http, info_type, model) {
    super(http, 'info', model);
    this.setDefaultParam('info_type', info_type);
    this.setDefaultParam('details', '1');
  }

  getElementFromRoot(root) {
    /* return the first info element from the response
     * the second info element is for the counts */
    return root.get_info.get_info_response.info[0];
  }
}

export default InfoEntityCommand;

// vim: set ts=2 sw=2 tw=80:
