/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';

describe('RowDetailsToggle tests', () => {
  test('renders without crashing', () => {
    const {render} = rendererWith();

    render(<RowDetailsToggle name="test" />);

    expect(screen.getByTestId('row-details-toggle')).toBeInTheDocument();
  });

  test('calls onClick handler when row is clicked', async () => {
    const handleClick = testing.fn();
    const {render} = rendererWith();

    render(<RowDetailsToggle name="test" onClick={handleClick} />);

    const row = screen.getByTestId('row-details-toggle');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledWith(undefined, 'test');
  });
});
