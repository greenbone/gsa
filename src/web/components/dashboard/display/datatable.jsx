/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
import PropTypes from 'web/utils/proptypes';

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

// vim: set ts=2 sw=2 tw=80:
