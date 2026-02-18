/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {createActionResultResponse} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import {CONTAINER_IMAGE_SCANNER_TYPE} from 'gmp/models/scanner';
import Setting from 'gmp/models/setting';
import Task from 'gmp/models/task';
import Button from 'web/components/form/Button';
import TaskComponent from 'web/pages/tasks/TaskComponent';

const createGmp = ({
  alerts = [],
  targets = [],
  schedules = [],
  scanConfigs = [],
  scanners = [],
  credentials = [],
  tags = [],
} = {}) => {
  return {
    settings: {
      enableGreenboneSensor: true,
      enableKrb5: false,
    },
    user: {
      currentSettings: testing.fn().mockResolvedValue(
        new Response({
          detailsexportfilename: new Setting({
            _id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
            name: 'Details Export File Name',
            value: '%T-%U',
          }),
        }),
      ),
    },
    alerts: {
      getAll: testing.fn().mockResolvedValue(new Response(alerts)),
      get: testing.fn().mockResolvedValue({data: alerts, meta: {filter: {}}}),
    },
    targets: {
      getAll: testing.fn().mockResolvedValue(new Response(targets)),
      get: testing.fn().mockResolvedValue({data: targets, meta: {filter: {}}}),
    },
    schedules: {
      getAll: testing.fn().mockResolvedValue(new Response(schedules)),
      get: testing
        .fn()
        .mockResolvedValue({data: schedules, meta: {filter: {}}}),
    },
    scanconfigs: {
      getAll: testing.fn().mockResolvedValue(new Response(scanConfigs)),
      get: testing
        .fn()
        .mockResolvedValue({data: scanConfigs, meta: {filter: {}}}),
    },
    scanners: {
      getAll: testing.fn().mockResolvedValue(new Response(scanners)),
      get: testing.fn().mockResolvedValue({data: scanners, meta: {filter: {}}}),
    },
    credentials: {
      getAll: testing.fn().mockResolvedValue(new Response(credentials)),
      get: testing
        .fn()
        .mockResolvedValue({data: credentials, meta: {filter: {}}}),
    },
    tags: {
      getAll: testing.fn().mockResolvedValue(new Response(tags)),
      get: testing.fn().mockResolvedValue({data: tags, meta: {filter: {}}}),
    },
    task: {
      create: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'new-id'})),
      save: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'saved-id'})),
      clone: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'cloned-id'})),
      export: testing.fn().mockResolvedValue(new Response('some-data')),
      start: testing.fn().mockResolvedValue(new Response({})),
      stop: testing.fn().mockResolvedValue(new Response({})),
      resume: testing.fn().mockResolvedValue(new Response({})),
      delete: testing.fn().mockResolvedValue(new Response({})),
    },
    agentGroups: {
      getAll: testing.fn().mockResolvedValue(new Response([])),
    },
    agentgroup: {
      create: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'new-agent-group'})),
      clone: testing
        .fn()
        .mockResolvedValue(
          createActionResultResponse({id: 'cloned-agent-group'}),
        ),
      delete: testing.fn().mockResolvedValue(new Response({})),
      export: testing.fn().mockResolvedValue(new Response('agent-group-data')),
      save: testing
        .fn()
        .mockResolvedValue(
          createActionResultResponse({id: 'saved-agent-group'}),
        ),
    },
    ociImageTargets: {
      getAll: testing.fn().mockResolvedValue(new Response([])),
    },
    ociimagetargets: {
      get: testing.fn().mockResolvedValue({data: [], meta: {filter: {}}}),
    },
    ociimagetarget: {
      create: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'new-oci-id'})),
      save: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'saved-oci-id'})),
      clone: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'cloned-oci-id'})),
      delete: testing.fn().mockResolvedValue(new Response({})),
    },
    agentgroups: {
      get: testing.fn().mockResolvedValue({data: [], meta: {filter: {}}}),
      getAll: testing.fn().mockResolvedValue(new Response([])),
    },
    oci_image_targets: {
      get: testing.fn().mockResolvedValue({data: [], meta: {filter: {}}}),
    },
  };
};

describe('TaskComponent tests', () => {
  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <TaskComponent>{() => <Button data-testid="button" />}</TaskComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should open correct dialog on edit for container image task', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    const containerImageTask = Task.fromElement({
      _id: 'container-task-id',
      name: 'Container Image Task',
      scanner: {
        _id: 'scanner-id',
        name: 'Container Image Scanner',
        type: CONTAINER_IMAGE_SCANNER_TYPE,
      },
      oci_image_target: {
        _id: 'oci-target-id',
        name: 'OCI Target',
      },
    });

    render(
      <TaskComponent>
        {({edit}) => (
          <Button
            data-testid="edit-container-task"
            onClick={() => edit(containerImageTask)}
          />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('edit-container-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/Container Image Task/i)).toBeInTheDocument();
  });

  test('should open correct dialog on edit for import task', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    const importTask = Task.fromElement({
      _id: 'import-task-id',
      name: 'Import Task',
      usage_type: 'scan',
    });

    render(
      <TaskComponent>
        {({edit}) => (
          <Button
            data-testid="edit-import-task"
            onClick={() => edit(importTask)}
          />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('edit-import-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/Edit Import Task/i)).toBeInTheDocument();
  });

  test('should open correct dialog on edit for agent task', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    const agentTask = Task.fromElement({
      _id: 'agent-task-id',
      name: 'Agent Task',
      agent_group: {
        _id: 'agent-group-id',
        name: 'Agent Group',
      },
    });

    render(
      <TaskComponent>
        {({edit}) => (
          <Button
            data-testid="edit-agent-task"
            onClick={() => edit(agentTask)}
          />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('edit-agent-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/Edit Agent Task/i)).toBeInTheDocument();
  });

  test('should open correct dialog on edit for standard task', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    const standardTask = Task.fromElement({
      _id: 'standard-task-id',
      name: 'Standard Task',
      target: {
        _id: 'target-id',
        name: 'Standard Target',
      },
    });

    render(
      <TaskComponent>
        {({edit}) => (
          <Button
            data-testid="edit-standard-task"
            onClick={() => edit(standardTask)}
          />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('edit-standard-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
  });

  test('should open standard task dialog for new task creation', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TaskComponent>
        {({create}) => (
          <Button data-testid="create-task" onClick={() => create()} />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('create-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/New Task/i)).toBeInTheDocument();
  });

  test('should handle edit task with container image scanner type correctly', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    const taskWithContainerImageScanner = Task.fromElement({
      _id: 'edge-case-task-id',
      name: 'Edge Case Task',
      scanner: {
        _id: 'scanner-id',
        name: 'Container Image Scanner',
        type: CONTAINER_IMAGE_SCANNER_TYPE,
      },
    });

    render(
      <TaskComponent>
        {({edit}) => (
          <Button
            data-testid="edit-edge-case-task"
            onClick={() => edit(taskWithContainerImageScanner)}
          />
        )}
      </TaskComponent>,
    );

    const button = screen.getByTestId('edit-edge-case-task');
    fireEvent.click(button);

    await wait();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    expect(screen.getByText(/Container Image Task/i)).toBeInTheDocument();
  });
});
