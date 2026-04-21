/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {scaleLinear} from 'd3-scale';
import Axis from 'web/components/chart/base/Axis';

describe('Axis tests', () => {
  test('should render ticks and axis class names', () => {
    const {render} = rendererWith();
    const scale = scaleLinear().range([0, 200]).domain([0, 100]);

    render(
      <svg>
        <Axis orientation="bottom" scale={scale} top={20} />
      </svg>,
    );

    const mainContainer = screen.getByTestId('main-container');
    expect(mainContainer.querySelector('.axis-line')).toBeInTheDocument();
    expect(mainContainer.querySelectorAll('.axis-tick').length).toBeGreaterThan(
      0,
    );
  });

  test('should hide tick labels when hideTickLabels is true', () => {
    const {render} = rendererWith();
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);

    render(
      <svg>
        <Axis hideTickLabels orientation="left" scale={scale} top={0} />
      </svg>,
    );

    const mainContainer = screen.getByTestId('main-container');
    expect(mainContainer.querySelectorAll('.tick text').length).toEqual(0);
  });

  test('should apply custom tick formatter', () => {
    const {render} = rendererWith();
    const scale = scaleLinear().range([0, 100]).domain([0, 10]);

    render(
      <svg>
        <Axis
          orientation="bottom"
          scale={scale}
          tickFormat={value => `v-${String(value)}`}
          top={20}
        />
      </svg>,
    );

    const mainContainer = screen.getByTestId('main-container');
    const tickTexts = Array.from(mainContainer.querySelectorAll('.tick text'));
    expect(tickTexts.length).toBeGreaterThan(0);
    expect(tickTexts.every(node => node.textContent?.startsWith('v-'))).toBe(
      true,
    );
  });
});
