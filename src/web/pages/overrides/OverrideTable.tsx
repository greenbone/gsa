/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Override from 'gmp/models/override';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import OverrideDetails from 'web/pages/overrides/OverrideDetails';
import OverrideTableHeader, {
  type OverrideTableHeaderProps,
} from 'web/pages/overrides/OverrideTableHeader';
import OverrideTableRow, {
  type OverrideTableRowProps,
} from 'web/pages/overrides/OverrideTableRow';

export default createEntitiesTable<
  Override,
  CreateEntitiesFooterProps<Override>,
  OverrideTableHeaderProps,
  OverrideTableRowProps
>({
  emptyTitle: _l('No Overrides available'),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'overrides.xml',
  }),
  header: OverrideTableHeader,
  row: OverrideTableRow,
  rowDetails: withRowDetails<Override>('override', 8)(OverrideDetails),
});
