/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';

describe('RowDetailsToggle tests', () => {
  test('should render without crashing', () => {
    const {render} = rendererWith();

    render(<RowDetailsToggle name="test" />);

    expect(screen.getByTestId('row-details-toggle')).toBeInTheDocument();
  });

  test('should call onClick handler when row is clicked', async () => {
    const handleClick = testing.fn();
    const {render} = rendererWith();

    render(<RowDetailsToggle name="test" onClick={handleClick} />);

    const row = screen.getByTestId('row-details-toggle');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledWith(undefined, 'test');
  });

  test('should pass value to onClick handler when provided', () => {
    const handleClick = testing.fn();
    const {render} = rendererWith();

    render(
      <RowDetailsToggle name="test" value="value" onClick={handleClick} />,
    );

    const row = screen.getByTestId('row-details-toggle');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledWith('value', 'test');
  });

  test('should pass arbitrary value to onClick handler', () => {
    const handleClick = testing.fn();
    const {render} = rendererWith();

    render(
      <RowDetailsToggle name="test" value={{id: 1}} onClick={handleClick} />,
    );

    const row = screen.getByTestId('row-details-toggle');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledWith({id: 1}, 'test');
  });
});
