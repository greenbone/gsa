/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Vulnerability from 'gmp/models/vulnerability';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import VulnerabilitiesTableHeader, {
  type VulnerabilitiesTableHeaderProps,
} from 'web/pages/vulnerabilities/VulnerabilitiesTableHeader';
import VulnerabilitiesTableRow, {
  type VulnerabilitiesTableRowProps,
} from 'web/pages/vulnerabilities/VulnerabilitiesTableRow';

export const VulnerabilitiesTable = createEntitiesTable<
  Vulnerability,
  CreateEntitiesFooterProps<Vulnerability>,
  VulnerabilitiesTableHeaderProps,
  VulnerabilitiesTableRowProps
>({
  emptyTitle: _l('No Vulnerabilities available'),
  header: VulnerabilitiesTableHeader,
  footer: createEntitiesFooter<Vulnerability>({
    span: 8,
    download: 'vulnerabilities.xml',
  }),
  row: VulnerabilitiesTableRow,
  // @ts-expect-error toggleDetailsIcon is not in CreateEntitiesTableOptions but is passed to EntitiesTable
  toggleDetailsIcon: false,
});

export default VulnerabilitiesTable;
