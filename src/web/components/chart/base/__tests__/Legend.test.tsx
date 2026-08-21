/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Legend, {type LegendData} from 'web/components/chart/base/Legend';

const data: LegendData[] = [
  {color: '#008000', label: 'First', toolTip: 'First tooltip'},
  {color: '#0000aa', label: 'Second', toolTip: 'Second tooltip'},
];

describe('Legend', () => {
  test('should render labels with their colors', () => {
    const {render} = rendererWith();

    render(<Legend data={data} />);

    expect(screen.getByText('First')).toBeVisible();
    expect(screen.getByText('Second')).toBeVisible();
    expect(screen.getByText('First').previousElementSibling).toHaveStyle({
      backgroundColor: '#008000',
    });
    expect(screen.getByText('Second').previousElementSibling).toHaveStyle({
      backgroundColor: '#0000aa',
    });
  });

  test('should call onItemClick with the selected legend item', () => {
    const onItemClick = testing.fn();
    const {render} = rendererWith();

    render(<Legend data={data} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('First'));

    expect(onItemClick).toHaveBeenCalledExactlyOnceWith(data[0]);
  });

  test('should render custom children with the item and callbacks', () => {
    const children = testing.fn(({d, onItemClick}) => (
      <button
        data-testid={`legend-${d.label}`}
        onClick={() => onItemClick?.(d)}
      >
        {d.label}
      </button>
    ));
    const onItemClick = testing.fn();
    const {render} = rendererWith();

    render(
      <Legend data={data} onItemClick={onItemClick}>
        {children}
      </Legend>,
    );
    fireEvent.click(screen.getByTestId('legend-First'));

    expect(children).toHaveBeenCalledTimes(2);
    expect(onItemClick).toHaveBeenCalledExactlyOnceWith(data[0]);
  });

  test('should render no items for empty data', () => {
    const {render} = rendererWith();

    render(<Legend data={[]} />);

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
  });

  test('should scroll when a maximum height is provided', () => {
    const {render} = rendererWith();

    render(<Legend data={data} maxHeight={200} />);

    const legend = screen.getByText('First').parentElement?.parentElement;
    expect(legend).toHaveStyle({
      maxHeight: '200px',
      overflowY: 'auto',
    });
  });
});
