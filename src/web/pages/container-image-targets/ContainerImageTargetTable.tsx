/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type OciImageTarget from 'gmp/models/oci-image-target';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import ContainerImageTargetRow, {
  type ContainerImageTargetTableRowProps,
} from 'web/pages/container-image-targets/ContainerImageTargetRow';
import ContainerImageTargetTableHeader, {
  type ContainerImageTargetTableHeaderProps,
} from 'web/pages/container-image-targets/ContainerImageTargetTableHeader';

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'oci-image-targets.xml',
});

export default createEntitiesTable<
  OciImageTarget,
  CreateEntitiesFooterProps<OciImageTarget>,
  ContainerImageTargetTableHeaderProps,
  ContainerImageTargetTableRowProps
>({
  emptyTitle: _l('No targets available'),
  row: ContainerImageTargetRow,
  header: ContainerImageTargetTableHeader,
  footer: Footer,
  rowDetails: undefined,
});
