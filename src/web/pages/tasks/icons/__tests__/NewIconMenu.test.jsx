/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';

const capabilities = new Capabilities(['everything']);

describe('NewIconMenu tests', () => {
  test('renders without crashing', () => {
    const {render} = rendererWith({capabilities});

    render(<NewIconMenu />);

    expect(screen.getByTestId('new-icon')).toBeInTheDocument();
  });

  test('calls onClick handler when menu item is clicked', () => {
    const handleClick = testing.fn();
    const handleContainerClick = testing.fn();
    const {render} = rendererWith({capabilities});

    render(
      <NewIconMenu
        onNewClick={handleClick}
        onNewContainerClick={handleContainerClick}
      />,
    );

    const taskMenu = screen.getByTestId('new-task-menu');
    fireEvent.click(taskMenu);
    expect(handleClick).toHaveBeenCalled();

    const containerTaskMenu = screen.getByTestId('new-container-task-menu');
    fireEvent.click(containerTaskMenu);
    expect(handleContainerClick).toHaveBeenCalled();
  });

  test("should not render if user doesn't have the right capabilities", () => {
    const {render} = rendererWith({capabilities: new Capabilities([])});

    render(<NewIconMenu />);

    expect(screen.queryByTestId('new-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('new-task-menu')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('new-container-task-menu'),
    ).not.toBeInTheDocument();
  });
});
