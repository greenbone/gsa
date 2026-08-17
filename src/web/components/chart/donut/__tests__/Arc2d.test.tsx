/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Arc2d from 'web/components/chart/donut/Arc2d';
import path from 'web/components/chart/utils/Path';

const data = {
  color: '#008000',
  label: 'First',
  toolTip: 'First arc',
  value: 10,
};

const arcPath = path().move(0, 0).line(10, 10).close();

describe('Arc2d', () => {
  test('should render the arc path and tooltip target', () => {
    const {render} = rendererWith();

    render(<Arc2d data={data} path={arcPath} x={5} y={6} />);

    const arc = screen.getByTestId('arc-2d');
    expect(arc.querySelector('path')).toHaveAttribute('d', String(arcPath));
    expect(arc.querySelector('path')).toHaveAttribute('fill', '#008000');
    expect(arc.querySelector('circle')).toHaveAttribute('cx', '5');
    expect(arc.querySelector('circle')).toHaveAttribute('cy', '6');
  });

  test('should call onDataClick with the arc data', () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(
      <Arc2d
        data={data}
        path={arcPath}
        x={5}
        y={6}
        onDataClick={onDataClick}
      />,
    );

    fireEvent.click(screen.getByTestId('arc-2d'));

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith(data);
  });
});
