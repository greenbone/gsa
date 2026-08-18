/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import {scaleLinear} from 'd3-scale';
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

    expect(mainContainer.querySelectorAll('.tick text').length).toEqual(0);
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
});
