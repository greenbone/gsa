/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isFunction} from 'gmp/utils/identity';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTable, {
  type DataTableProps,
} from 'web/components/dashboard/display/DataTable';
import {type DisplayState} from 'web/components/dashboard/display';

type DataTableDisplayRenderProps<TTransformedData> =
  DataTableProps<TTransformedData>;

type DataTableDisplayChildren<TTransformedData> = (
  props: DataTableDisplayRenderProps<TTransformedData>,
) => React.ReactNode;

export type DataTableDisplayProps<
  TData,
  TTransformedData extends Array<any>,
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
> = DataDisplayProps<
  TData,
  TTransformedData,
  TTransformProps,
  TState,
  DataTableDisplayChildren<TTransformedData>
>;

type DataTableDisplayComponentProps<
  TData,
  TTransformedData extends Array<any>,
  TTransformProps extends object,
  TState extends DisplayState,
> = DataTableDisplayProps<TData, TTransformedData, TTransformProps, TState> &
  TTransformProps;

const DataTableDisplay = <
  TData,
  TTransformedData extends Array<any> = TData[],
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
>({
  children,
  dataRow,
  dataTitles,
  ...props
}: DataTableDisplayComponentProps<
  TData,
  TTransformedData,
  TTransformProps,
  TState
>) => (
  <DataDisplay<
    TData,
    DataDisplayProps<TData, TTransformedData, TTransformProps, TState>,
    TTransformedData,
    TTransformProps,
    TState
  >
    {...props}
    dataRow={dataRow}
    dataTitles={dataTitles}
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

export default DataTableDisplay;
