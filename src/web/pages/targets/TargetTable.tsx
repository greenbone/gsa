/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Target from 'gmp/models/target';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import TargetDetails from 'web/pages/targets/Details';
import TargetTableHeader, {
  type TargetTableHeaderProps,
} from 'web/pages/targets/TargetTableHeader';
import TargetRow, {
  type TargetTableRowProps,
} from 'web/pages/targets/TargetTableRow';

export default createEntitiesTable<
  Target,
  CreateEntitiesFooterProps<Target>,
  TargetTableHeaderProps,
  TargetTableRowProps
>({
  emptyTitle: _l('No targets available'),
  row: TargetRow,
  header: TargetTableHeader,
  footer: createEntitiesFooter<Target>({
    download: 'targets.xml',
    span: 6,
    trash: true,
  }),
  rowDetails: withRowDetails<Target>('target', 10)(TargetDetails),
});
