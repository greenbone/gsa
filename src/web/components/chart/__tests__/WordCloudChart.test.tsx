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
import {fireEvent, rendererWith, screen} from 'web/testing';
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
      getImageData: (_x: number, _y: number, width: number, height: number) => {
        const pixels = new Uint8ClampedArray(width * height * 4);
        const center = Math.floor(height / 2) * width + Math.floor(width / 2);
        pixels[center * 4 + 3] = 255;
        return {data: pixels};
      },
      measureText: () => ({width: 10}),
      restore: () => {},
      rotate: () => {},
      save: () => {},
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

  test('should render placed words', () => {
    const {render} = rendererWith();

    render(<WordCloudChart data={singleWordData} height={300} width={400} />);

    expect(screen.getByTestId('word-cloud-word-First')).toHaveTextContent(
      'First',
    );
  });

  test('should call onDataClick with the selected word filter', () => {
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

    fireEvent.click(screen.getByTestId('word-cloud-word-First'));

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith('first-filter');
  });

  test('should recalculate words when the data prop changes', () => {
    const {render} = rendererWith();
    const {rerender} = render(
      <WordCloudChart data={singleWordData} height={300} width={400} />,
    );

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

    expect(
      screen.queryByTestId('word-cloud-word-First'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('word-cloud-word-Replacement'),
    ).toBeInTheDocument();
  });

  test('should clear the cloud when the drawing area becomes too small', () => {
    const {render} = rendererWith();
    const {rerender} = render(
      <WordCloudChart data={singleWordData} height={300} width={400} />,
    );

    expect(screen.getByTestId('word-cloud-word-First')).toBeInTheDocument();

    rerender(<WordCloudChart data={singleWordData} height={300} width={8} />);

    expect(screen.getByTestId('word-cloud-empty')).toHaveTextContent(
      'No data available',
    );
    expect(
      screen.queryByTestId('word-cloud-word-First'),
    ).not.toBeInTheDocument();
  });
});
