/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import Header from './header';
import Row from './row';
import ScanConfigDetails from './details';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'families_total',
    displayName: _l('Families: Total'),
  },
  {
    name: 'families_trend',
    displayName: _l('Families: Trend'),
  },
  {
    name: 'nvts_total',
    displayName: _l('NVTs: Total'),
  },
  {
    name: 'nvts_trend',
    displayName: _l('NVTs: Trend'),
  },
];

const ScanConfigsTable = createEntitiesTable({
  emptyTitle: _l('No Scan Configs available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('scanconfig')(ScanConfigDetails),
  footer: createEntitiesFooter({
    download: 'scanconfigs.xml',
    span: 6,
    trash: true,
  }),
});

export default ScanConfigsTable;

// vim: set ts=2 sw=2 tw=80:
