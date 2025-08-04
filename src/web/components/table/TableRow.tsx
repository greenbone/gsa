/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ReactNode} from 'react';

interface Item {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  items?: Item[] | ReactNode[];
  children?: ReactNode;
}

const TableRow = ({items = [], children, ...other}: TableRowProps) => {
  const data = items.map((item: Item | ReactNode, index: number) => {
    return (
      <th
        key={
          (item as Item).id && (item as Item).name
            ? `${(item as Item).id}-${(item as Item).name}`
            : index
        }
      >
        {item as ReactNode}
      </th>
    );
  });
  return (
    <tr {...other}>
      {data}
      {children}
    </tr>
  );
};

export default TableRow;
