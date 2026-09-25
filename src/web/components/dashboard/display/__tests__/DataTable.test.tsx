/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import DataTable from 'web/components/dashboard/display/DataTable';

describe('DataTable component tests', () => {
  test('should render column headers and table rows', () => {
    const data = [
      {id: '1', name: 'Alpha', count: 3},
      {id: '2', name: 'Beta', count: 7},
    ];
    const dataRow = testing.fn(
      data => data?.map(row => [row.name, row.count]) ?? [],
    );

    render(
      <DataTable
        data={data}
        dataRow={dataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(screen.getByRole('columnheader', {name: 'Name'})).toBeVisible();
    expect(screen.getByRole('columnheader', {name: 'Count'})).toBeVisible();
    expect(screen.getByRole('cell', {name: 'Alpha'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '3'})).toBeVisible();
    expect(screen.getByRole('cell', {name: 'Beta'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '7'})).toBeVisible();
    expect(dataRow).toHaveBeenCalledWith(data);
  });

  test('should stringify row values before rendering', () => {
    const customValue = {
      toString: () => 'custom-value',
    };

    render(
      <DataTable
        data={[{value: customValue, count: 42}]}
        dataRow={data => data?.map(row => [row.value, row.count]) ?? []}
        dataTitles={['Value', 'Count']}
      />,
    );

    expect(screen.getByRole('cell', {name: 'custom-value'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '42'})).toBeVisible();
  });

  test('should rerender when dataRow changes', () => {
    const data = [{name: 'Alpha', count: 3}];
    const initialDataRow = testing.fn(
      rows => rows?.map(row => [row.name, row.count]) ?? [],
    );
    const updatedDataRow = testing.fn(
      rows => rows?.map(row => [row.name.toUpperCase(), row.count * 2]) ?? [],
    );

    const {rerender} = render(
      <DataTable
        data={data}
        dataRow={initialDataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(screen.getByRole('cell', {name: 'Alpha'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '3'})).toBeVisible();

    rerender(
      <DataTable
        data={data}
        dataRow={updatedDataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(screen.queryByRole('cell', {name: 'Alpha'})).not.toBeInTheDocument();
    expect(screen.queryByRole('cell', {name: '3'})).not.toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'ALPHA'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '6'})).toBeVisible();
    expect(initialDataRow).toHaveBeenCalledWith(data);
    expect(updatedDataRow).toHaveBeenCalledWith(data);
  });

  test('should rerender when data changes', () => {
    const initialData = [{name: 'Alpha', count: 3}];
    const updatedData = [{name: 'Beta', count: 7}];
    const dataRow = testing.fn(
      rows => rows?.map(row => [row.name, row.count]) ?? [],
    );

    const {rerender} = render(
      <DataTable
        data={initialData}
        dataRow={dataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(screen.getByRole('cell', {name: 'Alpha'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '3'})).toBeVisible();

    rerender(
      <DataTable
        data={updatedData}
        dataRow={dataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(screen.queryByRole('cell', {name: 'Alpha'})).not.toBeInTheDocument();
    expect(screen.queryByRole('cell', {name: '3'})).not.toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'Beta'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '7'})).toBeVisible();
    expect(dataRow).toHaveBeenCalledWith(initialData);
    expect(dataRow).toHaveBeenCalledWith(updatedData);
  });

  test('should not recalculate rows when data and dataRow are unchanged', () => {
    const data = [{name: 'Alpha', count: 3}];
    const dataRow = testing.fn(
      rows => rows?.map(row => [row.name, row.count]) ?? [],
    );

    const {rerender} = render(
      <DataTable
        data={data}
        dataRow={dataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    rerender(
      <DataTable
        data={data}
        dataRow={dataRow}
        dataTitles={['Name', 'Count']}
      />,
    );

    expect(dataRow).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('cell', {name: 'Alpha'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '3'})).toBeVisible();
  });

  test('should render no body rows for empty data', () => {
    const dataRow = testing.fn(() => []);

    render(
      <DataTable data={[]} dataRow={dataRow} dataTitles={['Only Header']} />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Only Header'}),
    ).toBeVisible();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
    expect(dataRow).toHaveBeenCalledWith([]);
  });

  test('should use empty defaults when data and titles are omitted', () => {
    const dataRow = testing.fn(() => []);

    render(<DataTable dataRow={dataRow} />);

    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
    expect(dataRow).toHaveBeenCalledWith(undefined);
  });
});
