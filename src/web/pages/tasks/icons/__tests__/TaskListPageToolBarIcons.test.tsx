/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
import TaskToolBarIcons from 'web/pages/tasks/icons/TaskListPageToolBarIcons';

const manualUrl = 'test/';

describe('TaskListPageToolBarIcons test', () => {
  test('should render', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleImportTaskCreateClick = testing.fn();
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
        onImportTaskCreateClick={handleImportTaskCreateClick}
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

  test('should call click handlers', async () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleImportTaskCreateClick = testing.fn();
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
        onImportTaskCreateClick={handleImportTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const wizardButton = screen.getByTestId('wizard-icon').closest('button');
    expect(wizardButton).not.toBeNull();
    if (wizardButton) {
      fireEvent.click(wizardButton);
    }

    const taskWizardMenu = await screen.findByTestId('task-wizard-menu');
    expect(taskWizardMenu).toHaveTextContent('Task Wizard');
    fireEvent.click(taskWizardMenu);
    expect(handleTaskWizardClick).toHaveBeenCalled();

    if (wizardButton) {
      fireEvent.click(wizardButton);
    }
    const advancedTaskWizardMenu = await screen.findByTestId(
      'advanced-task-wizard-menu',
    );
    expect(advancedTaskWizardMenu).toHaveTextContent('Advanced Task Wizard');
    fireEvent.click(advancedTaskWizardMenu);
    expect(handleAdvancedTaskWizardClick).toHaveBeenCalled();

    if (wizardButton) {
      fireEvent.click(wizardButton);
    }
    const modifyTaskWizardMenu = await screen.findByTestId(
      'modify-task-wizard-menu',
    );
    expect(modifyTaskWizardMenu).toHaveTextContent('Modify Task Wizard');
    fireEvent.click(modifyTaskWizardMenu);
    expect(handleModifyTaskWizardClick).toHaveBeenCalled();

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreateClick).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreateClick).toHaveBeenCalled();
  });

  test('should call onNewContainerImageTaskClick handler', async () => {
    const handleNewContainerImageClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_CONTAINER_SCANNING']),
      router: true,
    });

    render(
      <TaskToolBarIcons
        onNewContainerImageTaskClick={handleNewContainerImageClick}
      />,
    );

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newContainerImageMenu = await screen.findByTestId(
      'new-container-image-menu',
    );
    expect(newContainerImageMenu).toHaveTextContent('New Container Image');
    fireEvent.click(newContainerImageMenu);
    expect(handleNewContainerImageClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleImportTaskCreateClick = testing.fn();
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
        onImportTaskCreateClick={handleImportTaskCreateClick}
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

    const newImportTaskMenu = screen.queryByTestId('new-container-task-menu');
    expect(newImportTaskMenu).toBeNull();
  });
});
