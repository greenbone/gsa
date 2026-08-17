/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Pie, {type PieRenderProps} from 'web/components/chart/donut/Pie';

interface TestData {
  label: string;
  score: number;
}

const data: TestData[] = [
  {label: 'First', score: 10},
  {label: 'Second', score: 20},
];

const renderPieData = ({data: datum, index}: PieRenderProps<TestData>) => (
  <text data-testid={`pie-item-${index}`}>{datum.label}</text>
);

describe('Pie', () => {
  test('should render one child for each data item', () => {
    const {render} = rendererWith();

    render(
      <Pie<TestData> data={data} outerRadiusX={100}>
        {renderPieData}
      </Pie>,
    );

    expect(screen.getByTestId('pie-item-0')).toHaveTextContent('First');
    expect(screen.getByTestId('pie-item-1')).toHaveTextContent('Second');
  });

  test('should forward arc geometry and path data to children', () => {
    const child = testing.fn(
      ({data: datum, path, x, y}: PieRenderProps<TestData>) => (
        <text data-testid={datum.label}>{`${x},${y},${String(path)}`}</text>
      ),
    );
    const {render} = rendererWith();

    render(
      <Pie<TestData> data={data} outerRadiusX={100}>
        {child}
      </Pie>,
    );

    expect(child).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('First')).not.toHaveTextContent('undefined');
    expect(screen.getByTestId('Second')).not.toHaveTextContent('undefined');
  });

  test('should apply pieValue and padAngle', () => {
    const child = testing.fn(
      ({data: datum, padAngle}: PieRenderProps<TestData>) => (
        <text data-testid={datum.label}>{String(padAngle)}</text>
      ),
    );
    const {render} = rendererWith();

    render(
      <Pie<TestData>
        data={data}
        left={25}
        outerRadiusX={100}
        padAngle={0.1}
        pieValue={datum => datum.score}
        top={30}
      >
        {child}
      </Pie>,
    );

    expect(child).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('First')).toHaveTextContent('0.1');
    expect(screen.getByTestId('Second')).toHaveTextContent('0.1');
  });
});
