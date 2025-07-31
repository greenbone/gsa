/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesHeader from 'web/entities/createEntitiesHeader';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import FilterDetails from 'web/pages/filters/Details';
import Row from 'web/pages/filters/Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '37%',
  },
  {
    name: 'term',
    displayName: _l('Term'),
    width: '37%',
  },
  {
    name: 'type',
    displayName: _l('Type'),
    width: '18%',
  },
];

const FiltersTable = createEntitiesTable({
  emptyTitle: _l('No filters available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('filter')(FilterDetails),
  footer: createEntitiesFooter({
    download: 'filters.xml',
    span: 6,
    trash: true,
  }),
});

export default FiltersTable;
