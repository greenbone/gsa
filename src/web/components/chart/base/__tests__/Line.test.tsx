/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import LineChart from 'web/components/chart/base/Line';

describe('Line chart integration tests', () => {
  test('should render a clear empty state when there is no data', () => {
    const {render} = rendererWith();

    render(
      <LineChart
        data={[]}
        height={300}
        width={400}
        yLine={{color: '#008000', label: 'Primary'}}
      />,
    );

    expect(screen.getByTestId('line-chart-empty')).toHaveTextContent(
      'No data available',
    );
  });

  test('should render y and y2 line paths for multi-point data', () => {
    const {render} = rendererWith();

    render(
      <LineChart
        data={[
          {x: 1, y: 10, y2: 3, label: 'p1'},
          {x: 2, y: 20, y2: 4, label: 'p2'},
        ]}
        height={300}
        showLegend={false}
        width={900}
        xAxisLabel="X"
        y2AxisLabel="Y2"
        y2Line={{color: '#0000aa', label: 'Second'}}
        yAxisLabel="Y"
        yLine={{color: '#00aa00', label: 'First'}}
      />,
    );

    const mainContainer = screen.getByTestId('main-container');
    expect(
      mainContainer.querySelector('path[stroke="#00aa00"]'),
    ).toBeInTheDocument();
    expect(
      mainContainer.querySelector('path[stroke="#0000aa"]'),
    ).toBeInTheDocument();
  });

  test('should keep the hover info box within the plot bounds', () => {
    const {render} = rendererWith();

    render(
      <LineChart
        data={[
          {x: 1, y: 10, y2: 3, label: 'First point'},
          {x: 2, y: 20, y2: 4, label: 'Second point'},
        ]}
        height={300}
        showLegend={false}
        width={400}
        yLine={{color: '#00aa00', label: 'First'}}
      />,
    );

    const svg = screen.getByTestId('main-container').querySelector('svg');
    expect(svg).toBeInTheDocument();

    fireEvent.mouseOver(svg as SVGSVGElement);
    fireEvent.mouseMove(svg as SVGSVGElement, {clientX: 399, clientY: 299});

    const infoBox = screen.getByTestId('line-chart-info');
    const infoGroup = infoBox.parentElement;
    expect(infoGroup).toBeInTheDocument();
    expect(
      Number(
        infoGroup?.getAttribute('transform')?.match(/translate\(([^,]+)/)?.[1],
      ),
    ).toBeLessThanOrEqual(240);
  });

  test('should call onRangeSelected on mouse range selection', () => {
    const {render} = rendererWith();
    const onRangeSelected = testing.fn();

    render(
      <LineChart
        data={[
          {x: 1, y: 10, y2: 3, label: 'p1'},
          {x: 2, y: 20, y2: 4, label: 'p2'},
          {x: 3, y: 30, y2: 5, label: 'p3'},
        ]}
        height={300}
        showLegend={false}
        width={900}
        yLine={{color: '#00aa00', label: 'First'}}
        onRangeSelected={onRangeSelected}
      />,
    );

    const svg = screen.getByTestId('main-container').querySelector('svg');
    expect(svg).toBeInTheDocument();

    fireEvent.mouseDown(svg as SVGSVGElement, {clientX: 120, clientY: 100});
    fireEvent.mouseMove(svg as SVGSVGElement, {clientX: 200, clientY: 110});
    fireEvent.mouseUp(svg as SVGSVGElement);

    expect(onRangeSelected).toHaveBeenCalledTimes(1);
    expect(onRangeSelected.mock.calls[0][0]).toBeDefined();
    expect(onRangeSelected.mock.calls[0][1]).toBeDefined();
  });

  test('should not select a range when an endpoint is removed before mouse up', () => {
    const onRangeSelected = testing.fn();
    const {render} = rendererWith();

    const rendered = render(
      <LineChart
        data={[
          {x: 1, y: 10, y2: 3, label: 'p1'},
          {x: 2, y: 20, y2: 4, label: 'p2'},
        ]}
        height={300}
        showLegend={false}
        width={900}
        yLine={{color: '#00aa00', label: 'First'}}
        onRangeSelected={onRangeSelected}
      />,
    );

    const svg = screen.getByTestId('main-container').querySelector('svg');
    expect(svg).toBeInTheDocument();

    fireEvent.mouseDown(svg as SVGSVGElement, {clientX: 120, clientY: 100});
    fireEvent.mouseMove(svg as SVGSVGElement, {clientX: 200, clientY: 110});

    rendered.rerender(
      <LineChart
        data={[
          {x: 2, y: 20, y2: 4, label: 'p2'},
          {x: 3, y: 30, y2: 5, label: 'p3'},
        ]}
        height={300}
        showLegend={false}
        width={900}
        yLine={{color: '#00aa00', label: 'First'}}
        onRangeSelected={onRangeSelected}
      />,
    );

    fireEvent.mouseUp(svg as SVGSVGElement);

    expect(onRangeSelected).not.toHaveBeenCalled();
  });
});
