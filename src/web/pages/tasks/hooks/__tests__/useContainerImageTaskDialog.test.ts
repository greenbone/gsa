/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {act} from '@testing-library/react';
import {CONTAINER_IMAGE_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import Task, {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {useContainerImageTaskDialog} from 'web/pages/tasks/hooks/useContainerImageTaskDialog';

const createMockTask = (): Task => {
  const task = new Task({
    id: 'task-123',
    name: 'Test Task',
    comment: 'Test comment',
    alterable: YES_VALUE,
    apply_overrides: YES_VALUE,
    in_assets: YES_VALUE,
    schedule_periods: NO_VALUE,
  });
  return task;
};

const createMockContainerImageTask = (): Task => {
  return Task.fromElement({
    _id: 'container-task-123',
    name: 'Container Test Task',
    comment: 'Container test comment',
    alterable: 1,
    schedule_periods: 1,
    oci_image_target: {
      _id: 'oci-target-456',
      name: 'Test OCI Target',
      trash: 0,
    },
    schedule: {
      _id: 'schedule-789',
      name: 'Test Schedule',
      trash: 0,
    },
  });
};

describe('useContainerImageTaskDialog', () => {
  test('should initialize with correct default state', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    expect(result.current.containerImageTaskDialogVisible).toBe(false);
    expect(result.current.task).toBeUndefined();
    expect(result.current.name).toBeUndefined();
    expect(result.current.comment).toBeUndefined();
    expect(result.current.addTag).toBeUndefined();
    expect(result.current.alterable).toBeUndefined();
    expect(result.current.applyOverrides).toBeUndefined();
    expect(result.current.inAssets).toBeUndefined();
    expect(result.current.schedulePeriods).toBeUndefined();
    expect(result.current.ociImageTargetId).toBeUndefined();
    expect(result.current.scheduleId).toBeUndefined();
    expect(result.current.scannerId).toBe(CONTAINER_IMAGE_DEFAULT_SCANNER_ID);
    expect(result.current.title).toBe('');
  });

  test('should open dialog for new container image task', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.openContainerImageTaskDialog();
    });

    expect(result.current.containerImageTaskDialogVisible).toBe(true);
    expect(result.current.task).toBeUndefined();
    expect(result.current.name).toBe('Unnamed');
    expect(result.current.comment).toBe('');
    expect(result.current.addTag).toBe(false);
    expect(result.current.alterable).toBe(false);
    expect(result.current.applyOverrides).toBe(true);
    expect(result.current.inAssets).toBe(true);
    expect(result.current.schedulePeriods).toBe(false);
    expect(result.current.ociImageTargetId).toBeUndefined();
    expect(result.current.scheduleId).toBeUndefined();
    expect(result.current.scannerId).toBe(CONTAINER_IMAGE_DEFAULT_SCANNER_ID);
    expect(result.current.title).toBe('New Container Image Task');
  });

  test('should open dialog for editing existing task', () => {
    const mockTask = createMockTask();
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.openContainerImageTaskDialog(mockTask);
    });

    expect(result.current.containerImageTaskDialogVisible).toBe(true);
    expect(result.current.task).toBe(mockTask);
    expect(result.current.name).toBe('Test Task');
    expect(result.current.comment).toBe('Test comment');
    expect(result.current.addTag).toBe(false);
    expect(result.current.alterable).toBe(true);
    expect(result.current.applyOverrides).toBe(true);
    expect(result.current.inAssets).toBe(true);
    expect(result.current.schedulePeriods).toBe(false);
    expect(result.current.title).toBe('Edit Container Image Task Test Task');
  });

  test('should open dialog for editing container image task with oci_image_target', () => {
    const mockContainerTask = createMockContainerImageTask();
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.openContainerImageTaskDialog(mockContainerTask);
    });

    expect(result.current.containerImageTaskDialogVisible).toBe(true);
    expect(result.current.task).toBe(mockContainerTask);
    expect(result.current.name).toBe('Container Test Task');
    expect(result.current.comment).toBe('Container test comment');
    expect(result.current.ociImageTargetId).toBe('oci-target-456');
    expect(result.current.scheduleId).toBe('schedule-789');
    expect(result.current.title).toBe(
      'Edit Container Image Task Container Test Task',
    );
  });

  test('should close dialog', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    // First open the dialog
    act(() => {
      result.current.openContainerImageTaskDialog();
    });
    expect(result.current.containerImageTaskDialogVisible).toBe(true);

    // Then close it
    act(() => {
      result.current.closeContainerImageTaskDialog();
    });
    expect(result.current.containerImageTaskDialogVisible).toBe(false);
  });

  test('should correctly set boolean preferences when editing task', () => {
    const mockTask = Task.fromElement({
      _id: 'task-with-preferences',
      name: 'Task with Preferences',
      comment: 'Task comment',
      oci_image_target: {
        _id: 'oci-target-123',
        name: 'Test OCI Target',
        trash: 0,
      },
      preferences: {
        preference: [
          {
            scanner_name: 'accept_invalid_certs',
            value: '1',
          },
          {
            scanner_name: 'registry_allow_insecure',
            value: '0',
          },
        ],
      },
    });

    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.openContainerImageTaskDialog(mockTask);
    });

    expect(result.current.acceptInvalidCerts).toBe(true);
    expect(result.current.registryAllowInsecure).toBe(false);
  });

  test('should use default boolean preference values for new task', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.openContainerImageTaskDialog();
    });

    expect(result.current.acceptInvalidCerts).toBe(true);
    expect(result.current.registryAllowInsecure).toBe(false);
  });

  test('should handle OCI image target change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.handleOciImageTargetChange('target-123');
    });

    expect(result.current.ociImageTargetId).toBe('target-123');
  });

  test('should handle scanner change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.handleScannerChange('scanner-456');
    });

    expect(result.current.scannerId).toBe('scanner-456');
  });

  test('should handle schedule change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.handleScheduleChange('schedule-789');
    });

    expect(result.current.scheduleId).toBe('schedule-789');
  });

  test('should update OCI image target ID directly via setOciImageTargetId', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    act(() => {
      result.current.setOciImageTargetId('target-direct-123');
    });

    expect(result.current.ociImageTargetId).toBe('target-direct-123');
  });

  test('should create new container image task successfully', async () => {
    const createResponse = {id: 'new-task-123'};
    const createContainerImageTask = testing
      .fn()
      .mockResolvedValue(createResponse);
    const onContainerCreated = testing.fn();
    const onContainerCreateError = testing.fn();

    const gmp = {
      task: {
        createContainerImageTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useContainerImageTaskDialog({
        onContainerCreated,
        onContainerCreateError,
      }),
    );

    const taskData = {
      name: 'New Task',
      comment: 'New task comment',
      inAssets: false,
      ociImageTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: ['alert-1', 'alert-2'],
      scheduleId: 'schedule-123',
      addTag: true,
      tagId: 'tag-123',
      alterable: true,
      applyOverrides: false,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
      autoDeleteData: 30,
      minQod: 70,
      schedulePeriods: true,
      acceptInvalidCerts: true,
      registryAllowInsecure: false,
    };

    await act(async () => {
      await result.current.handleSaveContainerImageTask(taskData);
    });

    expect(createContainerImageTask).toHaveBeenCalledWith({
      comment: 'New task comment',
      name: 'New Task',
      ociImageTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: ['alert-1', 'alert-2'],
      scheduleId: 'schedule-123',
      addTag: true,
      tagId: 'tag-123',
      alterable: true,
      applyOverrides: false,
      autoDelete: AUTO_DELETE_KEEP,
      autoDeleteData: 30,
      inAssets: false,
      minQod: 70,
      schedulePeriods: true,
      acceptInvalidCerts: true,
      registryAllowInsecure: false,
    });

    expect(onContainerCreated).toHaveBeenCalledWith(createResponse);
    expect(onContainerCreateError).not.toHaveBeenCalled();
    expect(result.current.containerImageTaskDialogVisible).toBe(false);
  });

  test('should save existing container image task successfully', async () => {
    const saveResponse = {id: 'task-123'};
    const saveContainerImageTask = testing.fn().mockResolvedValue(saveResponse);
    const onContainerSaved = testing.fn();
    const onContainerSaveError = testing.fn();

    const gmp = {
      task: {
        saveContainerImageTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useContainerImageTaskDialog({
        onContainerSaved,
        onContainerSaveError,
      }),
    );

    const taskData = {
      id: 'task-123',
      name: 'Updated Task',
      comment: 'Updated comment',
      inAssets: true,
      ociImageTargetId: 'target-456',
      scannerId: 'scanner-789',
      alertIds: ['alert-3'],
      scheduleId: 'schedule-456',
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_NO as typeof AUTO_DELETE_NO,
      autoDeleteData: 60,
      minQod: 80,
      schedulePeriods: false,
      acceptInvalidCerts: false,
      registryAllowInsecure: true,
    };

    await act(async () => {
      await result.current.handleSaveContainerImageTask(taskData);
    });

    expect(saveContainerImageTask).toHaveBeenCalledWith({
      id: 'task-123',
      comment: 'Updated comment',
      inAssets: true,
      name: 'Updated Task',
      ociImageTargetId: 'target-456',
      scannerId: 'scanner-789',
      alertIds: ['alert-3'],
      scheduleId: 'schedule-456',
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_NO,
      autoDeleteData: 60,
      minQod: 80,
      schedulePeriods: false,
      acceptInvalidCerts: false,
      registryAllowInsecure: true,
    });

    expect(onContainerSaved).toHaveBeenCalledWith(saveResponse);
    expect(onContainerSaveError).not.toHaveBeenCalled();
    expect(result.current.containerImageTaskDialogVisible).toBe(false);
  });

  test('should handle create error', async () => {
    const error = new Error('Create failed');
    const createContainerImageTask = testing.fn().mockRejectedValue(error);
    const onContainerCreated = testing.fn();
    const onContainerCreateError = testing.fn();

    const gmp = {
      task: {
        createContainerImageTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useContainerImageTaskDialog({
        onContainerCreated,
        onContainerCreateError,
      }),
    );

    const taskData = {
      name: 'Failed Task',
      comment: '',
      inAssets: true,
      ociImageTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      addTag: false,
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
      schedulePeriods: false,
    };

    await act(async () => {
      await result.current.handleSaveContainerImageTask(taskData);
    });

    expect(createContainerImageTask).toHaveBeenCalled();
    expect(onContainerCreated).not.toHaveBeenCalled();
    expect(onContainerCreateError).toHaveBeenCalledWith(error);
    expect(result.current.containerImageTaskDialogVisible).toBe(false);
  });

  test('should handle save error', async () => {
    const error = new Error('Save failed');
    const saveContainerImageTask = testing.fn().mockRejectedValue(error);
    const onContainerSaved = testing.fn();
    const onContainerSaveError = testing.fn();

    const gmp = {
      task: {
        saveContainerImageTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useContainerImageTaskDialog({
        onContainerSaved,
        onContainerSaveError,
      }),
    );

    const taskData = {
      id: 'task-123',
      name: 'Failed Task',
      comment: '',
      inAssets: true,
      ociImageTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
      schedulePeriods: false,
    };

    await act(async () => {
      await result.current.handleSaveContainerImageTask(taskData);
    });

    expect(saveContainerImageTask).toHaveBeenCalled();
    expect(onContainerSaved).not.toHaveBeenCalled();
    expect(onContainerSaveError).toHaveBeenCalledWith(error);
    expect(result.current.containerImageTaskDialogVisible).toBe(false);
  });

  test('should handle boolean conversion for YES_VALUE/NO_VALUE correctly', async () => {
    const createContainerImageTask = testing.fn().mockResolvedValue({});
    const gmp = {
      task: {
        createContainerImageTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() => useContainerImageTaskDialog({}));

    // Test with false values
    const taskDataWithFalse = {
      name: 'Test Task',
      comment: '',
      inAssets: false,
      ociImageTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      addTag: false,
      alterable: false,
      applyOverrides: false,
      schedulePeriods: false,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
    };

    await act(async () => {
      await result.current.handleSaveContainerImageTask(taskDataWithFalse);
    });

    expect(createContainerImageTask).toHaveBeenCalledWith(
      expect.objectContaining({
        addTag: false,
        alterable: false,
        applyOverrides: false,
        inAssets: false,
        schedulePeriods: false,
      }),
    );
  });
});
