/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EmptyTrashButton from 'web/pages/trashcan/EmptyTrashButton';

describe('EmptyTrashButton', () => {
  test('should render button', () => {
    const {render} = rendererWith({
      capabilities: true,
    });
    const handleClick = testing.fn();
    render(<EmptyTrashButton onClick={handleClick} />);

    const button = screen.getByText('Empty Trash');
    expect(button).toBeInTheDocument();
  });

  test('does not render the button when the user lacks the "empty_trashcan" capability', () => {
    const {render} = rendererWith({
      capabilities: new Capabilities(),
    });
    const handleClick = testing.fn();
    render(<EmptyTrashButton onClick={handleClick} />);

    const button = screen.queryByText('Empty Trash');
    expect(button).not.toBeInTheDocument();
  });

  test('calls the onClick handler when the button is clicked', () => {
    const {render} = rendererWith({
      capabilities: true,
    });
    const handleClick = testing.fn();
    render(<EmptyTrashButton onClick={handleClick} />);

    const button = screen.getByText('Empty Trash');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
