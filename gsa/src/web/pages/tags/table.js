/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale.js';

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import TagDetails from './details.js';
import Row from './row.js';

export const SORT_FIELDS = [
  ['name', _('Name'), '30%'],
  ['value', _('Value'), '30%'],
  ['active', _('Active'), '8%'],
  ['resource_type', _('Resource Type'), '8%'],
  ['resource_count', _('Number of Resources'), '8%'],
  ['modified', _('Modified'), '8%'],
];

const TagsTable = createEntitiesTable({
  emptyTitle: _('No tags available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('tag')(TagDetails),
  footer: createEntitiesFooter({
    download: 'tags.xml',
    span: 7,
    trash: true,
  }),
});

export default TagsTable;

// vim: set ts=2 sw=2 tw=80:
