/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import WordCloudChart from 'web/components/chart/WordCloudChart';

const data = [
  {
    color: '#008000',
    filterValue: 'first-filter',
    label: 'First',
    toolTip: 'First word',
    value: 10,
  },
  {
    color: '#0000aa',
    filterValue: 'second-filter',
    label: 'Second',
    toolTip: 'Second word',
    value: 20,
  },
];

const singleWordData = [data[0]];

describe('WordCloudChart', () => {
  beforeEach(() => {
    testing.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: () => {},
      fillText: () => {},
      fillStyle: '',
      font: '',
      getImageData: () => ({data: new Uint8ClampedArray(4)}),
      measureText: () => ({width: 10}),
      restore: () => {},
      rotate: () => {},
      save: () => {},
      scale: () => {},
      strokeText: () => {},
      translate: () => {},
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    testing.restoreAllMocks();
  });

  test('should render an empty cloud when there is no data', () => {
    const {render} = rendererWith();

    render(<WordCloudChart data={[]} height={300} width={400} />);

    expect(screen.getByTestId('word-cloud-chart-svg')).toBeInTheDocument();
    expect(screen.getByTestId('word-cloud-empty')).toHaveTextContent(
      'No data available',
    );
    expect(
      screen.queryByTestId('word-cloud-word-First'),
    ).not.toBeInTheDocument();
  });

  test('should render data words after the cloud layout completes', async () => {
    const {render} = rendererWith();

    render(<WordCloudChart data={singleWordData} height={300} width={400} />);

    await wait();

    expect(screen.getByTestId('word-cloud-word-First')).toHaveTextContent(
      'First',
    );
  });

  test('should call onDataClick with the selected word filter', async () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(
      <WordCloudChart
        data={singleWordData}
        height={300}
        width={400}
        onDataClick={onDataClick}
      />,
    );

    await wait();
    fireEvent.click(screen.getByTestId('word-cloud-word-First'));

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith('first-filter');
  });

  test('should recalculate words when the data prop changes', async () => {
    const {render} = rendererWith();
    const {rerender} = render(
      <WordCloudChart data={singleWordData} height={300} width={400} />,
    );

    await wait();
    expect(screen.getByTestId('word-cloud-word-First')).toBeInTheDocument();

    const replacementData = [
      {
        color: '#aa0000',
        filterValue: 'replacement-filter',
        label: 'Replacement',
        toolTip: 'Replacement word',
        value: 20,
      },
    ];
    rerender(
      <WordCloudChart data={replacementData} height={300} width={400} />,
    );

    await wait();
    expect(
      screen.queryByTestId('word-cloud-word-First'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('word-cloud-word-Replacement'),
    ).toBeInTheDocument();
  });
});
