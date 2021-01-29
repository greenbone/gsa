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
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseProgressElement} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

/*
 * Use own task model for reports to avoid cyclic dependencies
 */

class ReportTask extends Model {
  static entityType = 'task';

  static parseElement(element) {
    const copy = super.parseElement(element);

    const {target} = element;
    if (isDefined(target) && !isEmpty(target._id)) {
      copy.target = parseModelFromElement(target, 'target');
    } else {
      delete copy.target;
    }

    copy.progress = parseProgressElement(element.progress);

    return copy;
  }

  isContainer() {
    return !isDefined(this.target);
  }
}

export default ReportTask;

// vim: set ts=2 sw=2 tw=80:
