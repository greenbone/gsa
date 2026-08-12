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
    const dataRow = testing.fn(row => [row.name, row.count]);

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
    expect(dataRow).toHaveBeenNthCalledWith(1, data[0]);
    expect(dataRow).toHaveBeenNthCalledWith(2, data[1]);
  });

  test('should stringify row values before rendering', () => {
    const customValue = {
      toString: () => 'custom-value',
    };

    render(
      <DataTable
        data={[{value: customValue, count: 42}]}
        dataRow={row => [row.value, row.count]}
        dataTitles={['Value', 'Count']}
      />,
    );

    expect(screen.getByRole('cell', {name: 'custom-value'})).toBeVisible();
    expect(screen.getByRole('cell', {name: '42'})).toBeVisible();
  });

  test('should render no body rows for empty data', () => {
    const dataRow = testing.fn();

    render(
      <DataTable data={[]} dataRow={dataRow} dataTitles={['Only Header']} />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Only Header'}),
    ).toBeVisible();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
    expect(dataRow).not.toHaveBeenCalled();
  });

  test('should use empty defaults when data and titles are omitted', () => {
    const dataRow = testing.fn();

    render(<DataTable dataRow={dataRow} />);

    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
    expect(dataRow).not.toHaveBeenCalled();
  });
});
