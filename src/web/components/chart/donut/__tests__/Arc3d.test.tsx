/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Arc3d from 'web/components/chart/donut/Arc3d';
import path from 'web/components/chart/utils/Path';

const data = {
  color: '#008000',
  label: 'First',
  toolTip: 'First arc',
  value: 10,
};

const arcPath = path().move(0, 0).line(10, 10).close();

const props = {
  data,
  donutHeight: 10,
  endAngle: Math.PI,
  innerRadiusX: 10,
  innerRadiusY: 8,
  outerRadiusX: 50,
  outerRadiusY: 40,
  path: arcPath,
  startAngle: 0,
  x: 5,
  y: 6,
};

describe('Arc3d', () => {
  test('should render the 3D arc paths and tooltip target', () => {
    const {render} = rendererWith();

    render(<Arc3d {...props} />);

    const arc = screen.getByTestId('arc-3d');
    expect(arc.querySelectorAll('path')).toHaveLength(3);
    expect(arc.querySelector('circle')).toHaveAttribute('cx', '5');
    expect(arc.querySelector('circle')).toHaveAttribute('cy', '6');
  });

  test('should call onDataClick with the arc data', () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(<Arc3d {...props} onDataClick={onDataClick} />);

    fireEvent.click(screen.getByTestId('arc-3d'));

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith(data);
  });
});
