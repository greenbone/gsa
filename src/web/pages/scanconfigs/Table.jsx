/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import ScanConfigDetails from 'web/pages/scanconfigs/Details';
import Header from 'web/pages/scanconfigs/Header';
import Row from 'web/pages/scanconfigs/Row';

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
