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

import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DataDisplay from './datadisplay';
import DataTable from './datatable';

const DataTableDisplay = ({
  children,
  dataRow,
  dataTitles,
  ...props
}) => (
  <DataDisplay
    {...props}
    dataRow={dataRow}
    dataTitles={dataTitles}
  >
    {({data}) => (
      is_defined(children) ?
        children({
          data,
          dataRow,
          dataTitles,
        }) :
        <DataTable
          data={data}
          dataRow={dataRow}
          dataTitles={dataTitles}
        />
    )}
  </DataDisplay>
);

DataTableDisplay.propTypes = {
  children: PropTypes.func,
  data: PropTypes.any,
  dataRow: PropTypes.func.isRequired,
  dataTitles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DataTableDisplay;

// vim: set ts=2 sw=2 tw=80:
