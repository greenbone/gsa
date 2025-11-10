/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
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

    await screen.findByTestId('new-task-menu');
    expect(screen.getByTestId('new-task-menu')).toBeInTheDocument();
    expect(screen.getByTestId('new-container-task-menu')).toBeInTheDocument();
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

  describe.each([
    [
      'ENABLE_CONTAINER_SCANNING' as
        | 'ENABLE_CONTAINER_SCANNING'
        | 'ENABLE_AGENTS',
      'new-container-image-menu',
      'onNewContainerImageTaskClick',
    ],
    [
      'ENABLE_AGENTS' as 'ENABLE_CONTAINER_SCANNING' | 'ENABLE_AGENTS',
      'new-agent-task-menu',
      'onNewAgentTaskClick',
    ],
  ])('%s feature', (feature, menuTestId, callbackName) => {
    test('should show menu when the feature is enabled', async () => {
      const features = new Features([feature]);
      const {render} = rendererWith({capabilities: true, features});
      render(<NewIconMenu />);

      const button = screen.getByTestId('new-icon').closest('button');
      expect(button).not.toBeUndefined();
      if (button) {
        fireEvent.click(button);
      }

      await screen.findByTestId(menuTestId);
      expect(screen.getByTestId(menuTestId)).toBeInTheDocument();
    });

    test('should hide menu when the feature is disabled', async () => {
      const features = new Features();
      const {render} = rendererWith({capabilities: true, features});
      render(<NewIconMenu />);

      const button = screen.getByTestId('new-icon').closest('button');
      expect(button).not.toBeUndefined();
      if (button) {
        fireEvent.click(button);
      }

      expect(screen.queryByTestId(menuTestId)).not.toBeInTheDocument();
    });

    test(`should call ${callbackName} when menu item is clicked`, async () => {
      const callback = testing.fn();
      const features = new Features([feature]);
      const props = {[callbackName]: callback};
      const {render} = rendererWith({capabilities: true, features});
      render(<NewIconMenu {...props} />);

      const button = screen.getByTestId('new-icon').closest('button');
      expect(button).not.toBeUndefined();
      if (button) {
        fireEvent.click(button);
      }

      const menuItem = await screen.findByTestId(menuTestId);
      fireEvent.click(menuItem);
      expect(callback).toHaveBeenCalled();
    });
  });
});
