/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTable from 'web/components/dashboard/display/DataTable';
import PropTypes from 'web/utils/PropTypes';

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
