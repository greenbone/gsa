/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Labels from 'web/components/chart/donut/Labels';

const renderLabels = (data: Array<{value: number; toolTip: string}>) => {
  const {render} = rendererWith();
  render(
    <Labels
      centerX={150}
      centerY={150}
      data={data}
      innerRadiusX={20}
      innerRadiusY={20}
      outerRadiusX={100}
      outerRadiusY={100}
    />,
  );
};

describe('Labels', () => {
  test('should render labels for slices larger than the minimum angle', () => {
    renderLabels([
      {toolTip: 'Large slice', value: 99},
      {toolTip: 'Small slice', value: 1},
    ]);

    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  test('should render labels for all sufficiently large slices', () => {
    renderLabels([
      {toolTip: 'First slice', value: 50},
      {toolTip: 'Second slice', value: 50},
    ]);

    expect(screen.queryAllByText('50')).toHaveLength(2);
  });

  test('should render no labels for an empty data set', () => {
    renderLabels([]);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
