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

export interface DataTableDisplayProps<
  TData,
  TState extends State = State,
  TTransformedData = TData,
  TTransformProps = Record<string, unknown>,
> extends Omit<
  DataDisplayProps<TData, TState, TTransformedData, TTransformProps>,
  'children'
> {
  dataTitles: string[];
  children?:
    | ((
        props: DataTableDisplayRenderProps<TTransformedData>,
      ) => React.ReactNode)
    | unknown;
}

const DataTableDisplay = <
  TData,
  TState extends State = State,
  TTransformedData = TData,
  TTransformProps = Record<string, unknown>,
>({
  children,
  dataRow,
  dataTitles,
  ...props
}: DataTableDisplayProps<TData, TState, TTransformedData, TTransformProps>) => (
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
