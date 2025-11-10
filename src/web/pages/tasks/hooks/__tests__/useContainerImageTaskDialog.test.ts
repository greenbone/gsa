/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {act} from '@testing-library/react';
import {
  CONTAINER_IMAGE_DEFAULT_SCANNER_ID,
  CONTAINER_IMAGE_SCANNER_TYPE,
} from 'gmp/models/scanner';
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
      scannerType:
        CONTAINER_IMAGE_SCANNER_TYPE as typeof CONTAINER_IMAGE_SCANNER_TYPE,
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
      scannerType: CONTAINER_IMAGE_SCANNER_TYPE,
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
      scannerType:
        CONTAINER_IMAGE_SCANNER_TYPE as typeof CONTAINER_IMAGE_SCANNER_TYPE,
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
      scannerType: CONTAINER_IMAGE_SCANNER_TYPE,
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
