/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import ReportFormatDetails from 'web/pages/reportformats/Details';
import Row from 'web/pages/reportformats/Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '35%',
  },
  {
    name: 'extension',
    displayName: _l('Extension'),
    width: '14%',
  },
  {
    name: 'content_type',
    displayName: _l('Content Type'),
    width: '18%',
  },
  {
    name: 'trust',
    displayName: _l('Trust (Last Verified)'),
    width: '15%',
  },
  {
    name: 'active',
    displayName: _l('Active'),
    width: '10%',
  },
];

const ReportFormatsTable = createEntitiesTable({
  emptyTitle: _l('No report formats available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('reportformat', 10)(ReportFormatDetails),
  footer: createEntitiesFooter({
    span: 6,
    trash: true,
  }),
});

export default ReportFormatsTable;
