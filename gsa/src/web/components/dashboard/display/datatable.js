/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import styled from 'styled-components';

import Table from '../../table/stripedtable';
import TableHeader from '../../table/header';
import TableHead from '../../table/head';
import TableRow from '../../table/row';
import TableData from '../../table/data';
import TableBody from '../../table/body';

import PropTypes from '../../../utils/proptypes';

const Margin = styled.div`
  margin: 10,
  display: flex;
  flex-grow: 1,
  overflow-y: auto;
`;

const DataTable = ({
  dataTitles = [],
  data = [],
  dataRow: rowFunc,
}) => (
  <Margin>
    <Table>
      <TableHeader>
        <TableRow>
          {dataTitles.map((head, i) => (
            <TableHead key={i}>
              {head}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => {
          const rowData = rowFunc(row);
          return (
            <TableRow key={i}>
              {rowData.map((value, j) => (
                <TableData key={j}>
                  {value}
                </TableData>
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
  dataTitles: PropTypes.arrayOf(PropTypes.string),
};

export default DataTable;

// vim: set ts=2 sw=2 tw=80:
