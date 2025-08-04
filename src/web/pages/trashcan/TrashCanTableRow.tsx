/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InnerLink from 'web/components/link/InnerLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';

interface TrashCanTableRowProps {
  type: string;
  title: string;
  count: number;
}

const TrashCanTableRow = ({type, title, count}: TrashCanTableRowProps) => {
  return (
    <TableRow key={type}>
      <TableData>
        <InnerLink to={type}>{title}</InnerLink>
      </TableData>
      <TableData>{count}</TableData>
    </TableRow>
  );
};

export default TrashCanTableRow;
