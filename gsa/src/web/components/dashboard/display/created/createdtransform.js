/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {shortDate} from 'gmp/locale/date';

import {parseInt, parseDate} from 'gmp/parser';

const transformCreated = (data = {}) => {
  const {groups = []} = data;
  return groups.map(group => {
    const {value, count, c_count} = group;
    const createdDate = parseDate(value);
    return {
      x: createdDate,
      label: shortDate(createdDate),
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });
};

export default transformCreated;

// vim: set ts=2 sw=2 tw=80:
