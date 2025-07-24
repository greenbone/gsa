/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';

describe('NewIconMenu tests', () => {
  test('should render', () => {
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu />);
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

  test('should call onNewClick when New Task is clicked', () => {
    const onNewClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu onNewClick={onNewClick} />);
    fireEvent.click(screen.getByTestId('new-task-menu'));
    expect(onNewClick).toHaveBeenCalled();
  });

  test('calls onNewContainerClick when New Container Task is clicked', () => {
    const onNewContainerClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<NewIconMenu onNewContainerClick={onNewContainerClick} />);
    fireEvent.click(screen.getByTestId('new-container-task-menu'));
    expect(onNewContainerClick).toHaveBeenCalled();
  });
});
