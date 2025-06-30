/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Table from 'web/components/table/Table';

interface SimpleTableProps {
  size?: string;
  children?: React.ReactNode;
}

const SimpleTable = ({size = 'auto', children}: SimpleTableProps) => (
  <Table $size={size}>{children}</Table>
);

export default SimpleTable;
