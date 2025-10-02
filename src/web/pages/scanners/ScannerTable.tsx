/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import Scanner from 'gmp/models/scanner';
import createEntitiesFooter, {
  CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesHeader, {
  CreateEntitiesHeaderProps,
} from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import ScannerDetails from 'web/pages/scanners/ScannerDetails';
import ScannerRow, {ScannerRowProps} from 'web/pages/scanners/ScannerRow';

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

const ScannerTable = createEntitiesTable<
  Scanner,
  CreateEntitiesFooterProps<Scanner>,
  CreateEntitiesHeaderProps,
  ScannerRowProps
>({
  emptyTitle: _l('No scanners available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: ScannerRow,
  rowDetails: withRowDetails<Scanner>('scanner')(ScannerDetails),
  footer: createEntitiesFooter({
    download: 'scanners.xml',
    span: 7,
    trash: true,
  }),
});

export default ScannerTable;
