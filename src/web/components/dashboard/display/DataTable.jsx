/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/Constants';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import Table from 'web/components/table/StripedTable';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import PropTypes from 'web/utils/PropTypes';

const Margin = styled.div`
  margin: 10px;
  margin-right: ${MENU_PLACEHOLDER_WIDTH + 10}px;
  display: flex;
  flex-grow: 1;
  overflow-y: auto;
`;

const DataTable = ({dataTitles = [], data = [], dataRow: rowFunc}) => (
  <Margin>
    <Table>
      <TableHeader>
        <TableRow>
          {dataTitles.map((head, i) => (
            <TableHead key={i}>{`${head}`}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => {
          const rowData = rowFunc(row);
          return (
            <TableRow key={i}>
              {rowData.map((value, j) => (
                <TableData key={j}>{value}</TableData>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Margin>
);

DataTable.propTypes = {
  data: PropTypes.array,
  dataRow: PropTypes.func.isRequired,
  dataTitles: PropTypes.arrayOf(PropTypes.toString),
};

export default DataTable;
