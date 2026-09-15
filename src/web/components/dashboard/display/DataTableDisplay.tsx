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

type DataTableDisplayRenderProps<TTransformedData extends Array<unknown>> =
  DataTableProps<TTransformedData[number]> & {
    data?: TTransformedData;
  };

type DataTableDisplayChildren<TTransformedData extends Array<unknown>> = (
  props: DataTableDisplayRenderProps<TTransformedData>,
) => React.ReactNode;

export type DataTableDisplayProps<
  TData,
  TTransformedData extends Array<unknown>,
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
  TTransformedData extends Array<unknown>,
  TTransformProps extends object,
  TState extends DisplayState,
> = DataTableDisplayProps<TData, TTransformedData, TTransformProps, TState> &
  TTransformProps;

const DataTableDisplay = <
  TData,
  TTransformedData extends Array<unknown> = TData[],
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
>(
  props: DataTableDisplayComponentProps<
    TData,
    TTransformedData,
    TTransformProps,
    TState
  >,
) => {
  const {children, dataRow, dataTitles} = props;
  return (
    <DataDisplay<
      TData,
      DataTableDisplayComponentProps<
        TData,
        TTransformedData,
        TTransformProps,
        TState
      >,
      TTransformedData,
      TTransformProps,
      TState
    >
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
