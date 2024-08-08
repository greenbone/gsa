/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DataDisplay from './datadisplay';
import DataTable from './datatable';

const DataTableDisplay = ({children, dataRow, dataTitles, ...props}) => (
  <DataDisplay
    {...props}
    dataRow={dataRow}
    dataTitles={dataTitles}
    showSvgDownload={false}
    showToggleLegend={false}
  >
    {({data}) =>
      isDefined(children) ? (
        children({
          data,
          dataRow,
          dataTitles,
        })
      ) : (
        <DataTable data={data} dataRow={dataRow} dataTitles={dataTitles} />
      )
    }
  </DataDisplay>
);

DataTableDisplay.propTypes = {
  children: PropTypes.func,
  data: PropTypes.any,
  dataRow: PropTypes.func.isRequired,
  dataTitles: PropTypes.arrayOf(PropTypes.toString).isRequired,
};

export default DataTableDisplay;

// vim: set ts=2 sw=2 tw=80:
