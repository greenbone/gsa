/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';
import {type DataRowFunc} from 'web/components/dashboard/display/DataDisplay';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';

export interface DataTableProps<TData> {
  dataTitles?: ToString[];
  data?: TData;
  dataRow?: DataRowFunc<TData>;
}

const Margin = styled.div`
  margin: 10px;
  margin-right: ${MENU_PLACEHOLDER_WIDTH + 10}px;
  display: flex;
  flex-grow: 1;
  overflow-y: auto;
`;

const DataTable = <TData,>({
  dataTitles = [],
  data,
  dataRow: rowFunc,
}: DataTableProps<TData>) => {
  const rowData = useMemo(
    () => (isDefined(rowFunc) ? rowFunc(data) : []),
    [rowFunc, data],
  );
  return (
    <Margin>
      <Table>
        <TableHeader>
          <TableRow>
            {dataTitles.map(head => (
              <TableHead key={String(head)}>{String(head)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowData.map((row, i) => {
            return (
              <TableRow key={i}>
                {row.map((value, j) => (
                  <TableData key={j}>{String(value)}</TableData>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Margin>
  );
};

export default DataTable;
