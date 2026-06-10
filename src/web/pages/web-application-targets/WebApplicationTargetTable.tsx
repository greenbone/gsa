/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import WebApplicationTargetRow, {
  type WebApplicationTargetTableRowProps,
} from 'web/pages/web-application-targets/WebApplicationTargetRow';
import WebApplicationTargetTableHeader, {
  type WebApplicationTargetTableHeaderProps,
} from 'web/pages/web-application-targets/WebApplicationTargetTableHeader';

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'web-application-targets.xml',
});

export default createEntitiesTable<
  WebApplicationTarget,
  CreateEntitiesFooterProps<WebApplicationTarget>,
  WebApplicationTargetTableHeaderProps,
  WebApplicationTargetTableRowProps
>({
  emptyTitle: _l('No web application targets available'),
  row: WebApplicationTargetRow,
  header: WebApplicationTargetTableHeader,
  footer: Footer,
  rowDetails: undefined,
});
