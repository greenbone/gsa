/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesHeader from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import ScannerDetails from 'web/pages/scanners/Details';
import Row from 'web/pages/scanners/Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '30%',
  },
  {
    name: 'host',
    displayName: _l('Host'),
    width: '20%',
  },
  {
    name: 'port',
    displayName: _l('Port'),
    width: '20%',
  },
  {
    name: 'type',
    displayName: _l('Type'),
    width: '10%',
  },
  {
    name: 'credential',
    displayName: _l('Credential'),
    width: '12%',
  },
];

const ScannersTable = createEntitiesTable({
  emptyTitle: _l('No scanners available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('scanner')(ScannerDetails),
  footer: createEntitiesFooter({
    download: 'scanners.xml',
    span: 7,
    trash: true,
  }),
});

export default ScannersTable;
