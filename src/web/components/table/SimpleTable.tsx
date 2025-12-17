/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Table, {type TableProps} from 'web/components/table/Table';

interface SimpleTableProps extends TableProps {
  size?: string;
}

const SimpleTable = ({size = 'auto', ...other}: SimpleTableProps) => (
  <Table {...other} $size={size} />
);

export default SimpleTable;
