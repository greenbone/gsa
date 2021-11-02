/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';

import Table from 'web/components/table/stripedtable';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';
import TableBody from 'web/components/table/body';

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
