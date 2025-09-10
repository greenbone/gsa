/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent, waitFor} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';

describe('NewIconMenu tests', () => {
  test('should render', async () => {
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu />);

    const button = screen.getByTestId('new-icon').closest('button');
    expect(button).not.toBeNull();
    if (button) {
      fireEvent.click(button);
    }

    await waitFor(() => {
      expect(screen.getByTestId('new-task-menu')).toBeInTheDocument();
      expect(screen.getByTestId('new-container-task-menu')).toBeInTheDocument();
    });
  });

  test('should not render when capabilities do not allow creating tasks', () => {
    const {render} = rendererWith({capabilities: new Capabilities()});
    render(<NewIconMenu />);
    expect(screen.queryByTestId('new-task-menu')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('new-container-task-menu'),
    ).not.toBeInTheDocument();
  });

  test('should call onNewClick when New Task is clicked', async () => {
    const onNewClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu onNewClick={onNewClick} />);

    const button = screen.getByTestId('new-icon').closest('button');
    expect(button).not.toBeNull();
    if (button) {
      fireEvent.click(button);
    }

    const menuItem = await screen.findByTestId('new-task-menu');
    fireEvent.click(menuItem);
    expect(onNewClick).toHaveBeenCalled();
  });

  test('calls onNewContainerClick when New Container Task is clicked', async () => {
    const onNewContainerClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu onNewContainerClick={onNewContainerClick} />);

    const button = screen.getByTestId('new-icon').closest('button');
    expect(button).not.toBeNull();
    if (button) {
      fireEvent.click(button);
    }

    const menuItem = await screen.findByTestId('new-container-task-menu');
    fireEvent.click(menuItem);
    expect(onNewContainerClick).toHaveBeenCalled();
  });
});
