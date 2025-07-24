/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import TaskToolBarIcons from 'web/pages/tasks/icons/TaskToolBarIcons';

const manualUrl = 'test/';

describe('TaskPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <TaskToolBarIcons
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Tasks',
    );
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );
  });

  test('should call click handlers', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <TaskToolBarIcons
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const taskWizardMenu = screen.getByTestId('task-wizard-menu');
    expect(taskWizardMenu).toHaveTextContent('Task Wizard');
    fireEvent.click(taskWizardMenu);
    expect(handleTaskWizardClick).toHaveBeenCalled();

    const advancedTaskWizardMenu = screen.getByTestId(
      'advanced-task-wizard-menu',
    );
    expect(advancedTaskWizardMenu).toHaveTextContent('Advanced Task Wizard');
    fireEvent.click(advancedTaskWizardMenu);
    expect(handleAdvancedTaskWizardClick).toHaveBeenCalled();

    const modifyTaskWizardMenu = screen.getByTestId('modify-task-wizard-menu');
    expect(modifyTaskWizardMenu).toHaveTextContent('Modify Task Wizard');
    fireEvent.click(modifyTaskWizardMenu);
    expect(handleModifyTaskWizardClick).toHaveBeenCalled();

    const newTaskMenu = screen.getByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreateClick).toHaveBeenCalled();

    const newContainerTaskMenu = screen.getByTestId('new-container-task-menu');
    expect(newContainerTaskMenu).toHaveTextContent('New Container Task');
    fireEvent.click(newContainerTaskMenu);
    expect(handleContainerTaskCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: new Capabilities(),
      router: true,
    });
    render(
      <TaskToolBarIcons
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const taskWizardMenu = screen.queryByTestId('task-wizard-menu');
    expect(taskWizardMenu).toBeNull();

    const advancedTaskWizardMenu = screen.queryByTestId(
      'advanced-task-wizard-menu',
    );
    expect(advancedTaskWizardMenu).toBeNull();

    const modifyTaskWizardMenu = screen.queryByTestId(
      'modify-task-wizard-menu',
    );
    expect(modifyTaskWizardMenu).toBeNull();

    const newTaskMenu = screen.queryByTestId('new-task-menu');
    expect(newTaskMenu).toBeNull();

    const newContainerTaskMenu = screen.queryByTestId(
      'new-container-task-menu',
    );
    expect(newContainerTaskMenu).toBeNull();
  });
});
