/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import {scaleBand, scaleLinear, scaleUtc} from 'd3-scale';
import Axis from 'web/components/chart/base/Axis';

const renderAxis = (props: React.ComponentProps<typeof Axis>) => {
  const {render} = rendererWith();

  render(
    <svg>
      <Axis {...props} />
    </svg>,
  );

  return screen.getByTestId('main-container');
};

describe('Axis tests', () => {
  test('should render ticks and axis class names', () => {
    const scale = scaleLinear().range([0, 200]).domain([0, 100]);
    const mainContainer = renderAxis({orientation: 'bottom', scale, top: 20});

    expect(mainContainer.querySelector('.axis-line')).toBeInTheDocument();
    expect(mainContainer.querySelectorAll('.axis-tick').length).toBeGreaterThan(
      0,
    );
  });

  test('should hide tick labels when hideTickLabels is true', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);
    const mainContainer = renderAxis({
      hideTickLabels: true,
      orientation: 'left',
      scale,
      top: 0,
    });

    expect(mainContainer.querySelectorAll('.tick text')).toHaveLength(0);
  });

  test('should apply custom tick formatter', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickFormat: value => `v-${String(value)}`,
      top: 20,
    });

    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.length).toBeGreaterThan(0);
    expect(tickTexts.every(node => node.textContent?.startsWith('v-'))).toBe(
      true,
    );
  });

  test.each([
    [0, '0'],
    [0.1, '0.1'],
    [0.25, '0.25'],
    [0.5, '0.5'],
    [0.001, '0.001'],
    [999, '999'],
    [999.9, '999.9'],
    [1000, '1k'],
    [1001, '1k'],
    [1500, '1.5k'],
    [12000, '12k'],
    [1250000, '1.3M'],
    [1000000000, '1G'],
    [-0.5, '\u22120.5'],
    [-1500, '\u22121.5k'],
  ])('should format numeric tick value %s as %s', (value, expected) => {
    const scale = scaleLinear().range([0, 100]).domain([value, value]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: [value],
    });

    expect(mainContainer.querySelector('.tick text')).toHaveTextContent(
      expected,
    );
  });

  test('should format large numeric tick values compactly', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 1250000]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: [0, 1250000],
    });

    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.map(tick => tick.textContent)).toEqual(['0', '1.3M']);
  });

  test('should keep decimal tick values readable', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 2]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: [0, 0.5, 1, 1.5, 2],
    });

    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.map(tick => tick.textContent)).toEqual([
      '0',
      '0.5',
      '1',
      '1.5',
      '2',
    ]);
  });

  test('should let a custom tick formatter override compact formatting', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 1500]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickFormat: value => `${String(value)} results`,
      tickValues: [1500],
    });

    expect(mainContainer.querySelector('.tick text')).toHaveTextContent(
      '1500 results',
    );
  });

  test('should keep categorical tick values unchanged', () => {
    const scale = scaleBand<string>().range([0, 100]).domain(['0.5', '1000']);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: ['0.5', '1000'],
    });

    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.map(tick => tick.textContent)).toEqual(['0.5', '1000']);
  });

  test('should keep time tick values date-formatted', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const scale = scaleUtc().range([0, 100]).domain([start, start]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: [start],
    });

    expect(mainContainer.querySelector('.tick text')).not.toHaveTextContent(
      'm',
    );
  });

  test('should render a top axis label with the expected position', () => {
    const scale = scaleLinear().range([0, 200]).domain([0, 100]);
    renderAxis({
      dataTestId: 'top-axis',
      label: 'Top axis',
      orientation: 'top',
      scale,
    });

    const axis = screen.getByTestId('top-axis');
    expect(axis.querySelector('.axis-label')).toHaveTextContent('Top axis');
    expect(axis.querySelector('.axis-label')).toHaveAttribute('y', '-23');
  });

  test('should render only the provided tick values', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickValues: [0, 5, 10],
    });

    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.map(tick => tick.textContent)).toEqual(['0', '5', '10']);
  });

  test('should rotate tick labels when configured', () => {
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);
    const mainContainer = renderAxis({
      orientation: 'bottom',
      scale,
      tickLabelRotation: -30,
    });

    const tickLabel = mainContainer.querySelector('.tick text');
    expect(tickLabel).toHaveAttribute('transform', 'rotate(-30)');
    expect(tickLabel).toHaveAttribute('text-anchor', 'end');
    expect(tickLabel).toHaveAttribute('dx', '-0.5em');
    expect(tickLabel).toHaveAttribute('dy', '0.5em');
  });
});
