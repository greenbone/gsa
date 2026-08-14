/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';

import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';

interface TestData {
  foo: string;
}

const createProps = (overrides = {}) => ({
  data: {foo: 'raw'},
  dataRow: row => [row.foo],
  dataTitles: ['Foo'],
  dataTransform: data => [{foo: `${data.foo}-transformed`}],
  height: 100,
  icons: () => null,
  id: 'table-1',
  initialState: {},
  onRemoveClick: () => {},
  onSelectFilterClick: () => {},
  setState: () => ({}),
  showCsvDownload: true,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: true,
  showToggleLegend: true,
  state: {},
  title: ({data}) => data[0]?.foo ?? 'empty',
  width: 200,
  ...overrides,
});

describe('DataTableDisplay component tests', () => {
  test('should render DataTable fallback when children is not a function', () => {
    render(
      <DataTableDisplay<TestData> {...createProps()}>
        {/* @ts-expect-error testing children as not a function */}
        <span>not a function</span>
      </DataTableDisplay>,
    );

    expect(screen.getByRole('columnheader', {name: 'Foo'})).toBeVisible();
    expect(screen.getByRole('cell', {name: 'raw-transformed'})).toBeVisible();
  });

  test('should call children render prop when children is a function', () => {
    const childFn = testing
      .fn()
      .mockImplementation(({data}) => (
        <div data-testid="custom-render">{data[0].foo}</div>
      ));

    render(
      <DataTableDisplay<TestData> {...createProps()}>
        {childFn}
      </DataTableDisplay>,
    );

    expect(childFn).toHaveBeenCalledTimes(1);

    const args = childFn.mock.calls[0][0];
    expect(args).toEqual({
      data: [{foo: 'raw-transformed'}],
      dataRow: expect.any(Function),
      dataTitles: ['Foo'],
    });

    expect(screen.getByTestId('custom-render')).toHaveTextContent(
      'raw-transformed',
    );
  });

  test('should disable SVG and legend icons', () => {
    const icons = testing.fn(() => null);

    render(<DataTableDisplay<TestData> {...createProps({icons})} />);

    expect(icons).toHaveBeenCalledWith(
      expect.objectContaining({
        showSvgDownload: false,
        showToggleLegend: false,
      }),
    );
  });
});
