/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type PortList from 'gmp/models/portlist';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import PortListDetails from 'web/pages/portlists/PortListDetails';
import PortListTableHeader, {
  type PortListTableHeaderProps,
} from 'web/pages/portlists/PortListTableHeader';
import PortListTableRow, {
  type PortListTableRowProps,
} from 'web/pages/portlists/PortListTableRow';

export default createEntitiesTable<
  PortList,
  CreateEntitiesFooterProps<PortList>,
  PortListTableHeaderProps,
  PortListTableRowProps
>({
  emptyTitle: _l('No port lists available'),
  row: PortListTableRow,
  rowDetails: withRowDetails<PortList>('portlist', 10)(PortListDetails),
  header: PortListTableHeader,
  footer: createEntitiesFooter<PortList>({
    download: 'portlists.xml',
    span: 6,
    trash: true,
  }),
});
