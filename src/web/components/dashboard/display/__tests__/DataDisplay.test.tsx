/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {render, screen} from 'web/testing';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import {type DisplayProps} from 'web/components/dashboard/display/Display';

interface TestData {
  value: string;
}

interface TestState extends State {
  showLegend: boolean;
}

type TestProps = DataDisplayProps<TestData, TestState> &
  Pick<DisplayProps, 'isLoading' | 'onRemoveClick'>;

const createProps = (overrides: Partial<TestProps> = {}): TestProps => ({
  children: testing.fn(({data}) => (
    <div data-testid="chart">{data[0].value}</div>
  )),
  data: {value: 'raw'},
  dataRow: row => [row.value],
  dataTitles: ['Value'],
  dataTransform: data => [{value: `${data.value}-transformed`}],
  height: 100,
  icons: () => <div data-testid="icons" />,
  id: 'chart-1',
  initialState: {showLegend: false},
  onSelectFilterClick: () => {},
  setState: () => ({showLegend: false}),
  showCsvDownload: true,
  showFilterSelection: true,
  showFilterString: false,
  showSvgDownload: true,
  showToggleLegend: true,
  state: {showLegend: false},
  title: ({data, id}) => `${id}: ${data[0]?.value ?? 'empty'}`,
  width: 200,
  ...overrides,
});

describe('DataDisplay component tests', () => {
  beforeEach(() => {
    testing.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:test');
    testing.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    testing.restoreAllMocks();
  });

  test('should transform data and render the chart with its title', () => {
    const props = createProps();

    render(
      <DataDisplay<TestData, TestProps, TestState, TestData> {...props} />,
    );

    expect(screen.getByText('chart-1: raw-transformed')).toBeInTheDocument();
    expect(screen.getByTestId('chart')).toHaveTextContent('raw-transformed');
    expect(screen.getByTestId('icons')).toBeInTheDocument();
  });

  test('should not render chart children while loading', () => {
    const children = testing.fn(() => <div data-testid="chart" />);
    const props = createProps({
      children,
      data: undefined as unknown as TestData,
      dataTransform: () => [],
      isLoading: true,
    });

    render(
      <DataDisplay<TestData, TestProps, TestState, TestData> {...props} />,
    );

    expect(children).not.toHaveBeenCalled();
    expect(screen.getByTestId('loading')).toBeVisible();
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
  });

  test('should forward display settings and handlers to the icon renderer', () => {
    const icons = testing.fn(() => <div data-testid="icons" />);
    const props = createProps({
      icons,
      showCsvDownload: false,
      showFilterSelection: false,
      showSvgDownload: false,
      showToggleLegend: false,
    });

    render(
      <DataDisplay<TestData, TestProps, TestState, TestData> {...props} />,
    );

    expect(icons).toHaveBeenCalledTimes(1);
    expect(icons).toHaveBeenCalledWith(
      expect.objectContaining({
        showCsvDownload: true,
        showFilterSelection: false,
        showSvgDownload: false,
        showToggleLegend: false,
        onDownloadCsvClick: expect.any(Function),
        onDownloadSvgClick: expect.any(Function),
        onSelectFilterClick: props.onSelectFilterClick,
        setState: expect.any(Function),
        state: props.state,
      }),
    );
  });

  test('should create a CSV download with escaped data', async () => {
    const icons = testing.fn(({onDownloadCsvClick}) => (
      <button data-testid="download-csv" onClick={onDownloadCsvClick} />
    ));
    const props = createProps({
      data: {value: 'raw, "value"'},
      dataRow: row => [row.value, 'second'],
      dataTitles: ['Value', 'Other'],
      icons,
    });

    render(
      <DataDisplay<TestData, TestProps, TestState, TestData> {...props} />,
    );

    screen.getByTestId('download-csv').click();

    const createObjectURL = window.URL.createObjectURL as ReturnType<
      typeof testing.fn
    >;
    expect(createObjectURL).toHaveBeenCalled();
    const csvBlob = createObjectURL.mock.calls.at(-1)?.[0] as Blob;
    expect(await csvBlob.text()).toBe(
      '"chart-1: raw, ""value""-transformed"\n"Value","Other"\n"raw, ""value""-transformed","second"',
    );
    const download = document.querySelector('a');
    expect(download).toHaveAttribute('download', 'data.csv');
    expect(download).toHaveAttribute('href', 'blob:test');
  });

  test('should create an SVG download from the rendered chart', () => {
    const icons = testing.fn(({onDownloadSvgClick}) => (
      <button data-testid="download-svg" onClick={onDownloadSvgClick} />
    ));
    const props = createProps({
      children: ({svgRef}) => (
        <svg ref={svgRef}>
          <circle />
        </svg>
      ),
      icons,
    });

    render(
      <DataDisplay<TestData, TestProps, TestState, TestData> {...props} />,
    );

    screen.getByTestId('download-svg').click();

    const createObjectURL = window.URL.createObjectURL as ReturnType<
      typeof testing.fn
    >;
    expect(createObjectURL).toHaveBeenCalled();
    const svgBlob = createObjectURL.mock.calls.at(-1)?.[0] as Blob;
    expect(svgBlob.type).toBe('image/svg+xml');
    const download = document.querySelector('a');
    expect(download).toHaveAttribute('download', 'chart.svg');
    expect(download).toHaveAttribute('href', 'blob:test');
  });
});
