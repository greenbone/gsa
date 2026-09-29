/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isFunction} from 'gmp/utils/identity';
import {type DisplayState} from 'web/components/dashboard/display';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTable, {
  type DataTableProps,
} from 'web/components/dashboard/display/DataTable';

type DataTableDisplayRenderProps<TData extends object> =
  DataTableProps<TData> & {
    data?: TData;
  };

type DataTableDisplayChildren<TData extends object> = (
  props: DataTableDisplayRenderProps<TData>,
) => React.ReactNode;

export type DataTableDisplayProps<
  TData extends object,
  TState extends DisplayState = DisplayState,
> = DataDisplayProps<TData, TState, DataTableDisplayChildren<TData>>;

type DataTableDisplayComponentProps<
  TData extends object,
  TState extends DisplayState,
> = DataTableDisplayProps<TData, TState>;

const DataTableDisplay = <
  TData extends object,
  TState extends DisplayState = DisplayState,
>(
  props: DataTableDisplayComponentProps<TData, TState>,
) => {
  const {children, dataRow, dataTitles} = props;
  return (
    <DataDisplay<TData, DataTableDisplayComponentProps<TData, TState>, TState>
      {...props}
      showSvgDownload={false}
      showToggleLegend={false}
    >
      {({data}) =>
        isFunction(children) ? (
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
};

export default DataTableDisplay;
