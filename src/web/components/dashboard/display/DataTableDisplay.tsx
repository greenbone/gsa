/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isFunction} from 'gmp/utils/identity';
import DataDisplay, {
  type State,
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTable, {
  type DataTableProps,
} from 'web/components/dashboard/display/DataTable';

type DataTableDisplayRenderProps<TTransformedData> =
  DataTableProps<TTransformedData>;

type DataTableDisplayChildren<TTransformedData> = (
  props: DataTableDisplayRenderProps<TTransformedData>,
) => React.ReactNode;

export interface DataTableDisplayProps<
  TData,
  TState extends State = State,
  TTransformedData = TData,
  TTransformProps extends object = object,
> extends DataDisplayProps<
  TData,
  TState,
  TTransformedData,
  TTransformProps,
  DataTableDisplayChildren<TTransformedData>
> {
  dataTitles: string[];
}

type DataTableDisplayComponentProps<
  TData,
  TState extends State,
  TTransformedData,
  TTransformProps extends object,
> = DataTableDisplayProps<TData, TState, TTransformedData, TTransformProps> &
  TTransformProps;

const DataTableDisplay = <
  TData,
  TState extends State = State,
  TTransformedData = TData,
  TTransformProps extends object = object,
>({
  children,
  dataRow,
  dataTitles,
  ...props
}: DataTableDisplayComponentProps<
  TData,
  TState,
  TTransformedData,
  TTransformProps
>) => (
  <DataDisplay<
    TData,
    DataDisplayProps<TData, TState, TTransformedData, TTransformProps>,
    TState,
    TTransformedData,
    TTransformProps
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
