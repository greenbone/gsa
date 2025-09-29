/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Table from 'web/components/table/Table';

interface SimpleTableProps {
  size?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

const SimpleTable = ({
  size = 'auto',
  children,
  'data-testid': dataTestId,
}: SimpleTableProps) => (
  <Table $size={size} data-testid={dataTestId}>
    {children}
  </Table>
);

export default SimpleTable;
