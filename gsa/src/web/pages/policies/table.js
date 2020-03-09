/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import {_l} from 'gmp/locale/lang';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import Header from './header';
import Row from './row';
import PolicyDetails from 'web/pages/policies/details';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
];

const PoliciesTable = createEntitiesTable({
  emptyTitle: _l('No Policies available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('policy')(PolicyDetails),
  footer: createEntitiesFooter({
    download: 'policies.xml',
    span: 2,
    trash: true,
    tags: false,
  }),
});

export default PoliciesTable;

// vim: set ts=2 sw=2 tw=80:
