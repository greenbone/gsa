/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import LineChart from 'web/components/chart/base/Line';

describe('Line chart integration tests', () => {
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
});
