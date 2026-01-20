/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {vi} from 'vitest';

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children}) => (
    <div data-testid="mock-data-display">
      {children({data: [{foo: 'bar'}]})}
    </div>
  ),
}));

vi.mock('web/components/dashboard/display/DataTable', () => ({
  default: ({data, dataTitles}) => (
    <div data-testid="mock-data-table">
      titles:{dataTitles.join(',')} rows:{Array.isArray(data) ? data.length : 0}
    </div>
  ),
}));

import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';

describe('DataTableDisplay', () => {
  test('renders DataTable fallback when children is not a function', () => {
    const dataRow = row => [row.foo];
    const dataTitles = ['Col1'];

    const {render} = rendererWith({router: true});

    render(
      <DataTableDisplay dataRow={dataRow} dataTitles={dataTitles}>
        <span>not a function</span>
      </DataTableDisplay>,
    );

    expect(screen.getByTestId('mock-data-table')).toBeInTheDocument();
  });

  test('calls children render prop when children is a function', () => {
    const dataRow = row => [row.foo];
    const dataTitles = ['Col1'];

    const childFn = testing
      .fn()
      .mockImplementation(({data}) => (
        <div data-testid="custom-render">custom rows:{data.length}</div>
      ));

    const {render} = rendererWith({router: true});

    render(
      <DataTableDisplay dataRow={dataRow} dataTitles={dataTitles}>
        {childFn}
      </DataTableDisplay>,
    );

    expect(childFn).toHaveBeenCalledTimes(1);

    const args = childFn.mock.calls[0][0];
    expect(args).toHaveProperty('data');
    expect(args).toHaveProperty('dataRow');
    expect(args).toHaveProperty('dataTitles');

    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });

  test('renders DataTable fallback when children is undefined', () => {
    const dataRow = row => [row.foo];
    const dataTitles = ['Col1'];

    const {render} = rendererWith({router: true});

    render(<DataTableDisplay dataRow={dataRow} dataTitles={dataTitles} />);

    expect(screen.getByTestId('mock-data-table')).toBeInTheDocument();
  });
});
