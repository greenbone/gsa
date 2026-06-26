/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {act} from '@testing-library/react';
import {WEB_APPLICATION_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import Task, {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  SCAN_MODE_ACTIVE,
  SCAN_MODE_SAFE,
} from 'gmp/models/task';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {useWebApplicationTaskDialog} from 'web/pages/tasks/hooks/useWebApplicationTaskDialog';

const createMockTask = (): Task => {
  const task = new Task({
    id: 'task-123',
    name: 'Test Task',
    comment: 'Test comment',
    alterable: YES_VALUE,
    apply_overrides: YES_VALUE,
    in_assets: NO_VALUE,
    schedule_periods: NO_VALUE,
  });
  return task;
};

const createMockWebApplicationTask = (): Task => {
  return Task.fromElement({
    _id: 'web-application-task-123',
    name: 'Web Application Test Task',
    comment: 'Web Application test comment',
    alterable: 1,
    schedule_periods: 1,
    web_application_target: {
      _id: 'web-application-target-456',
      name: 'Test Web Application Target',
      trash: 0,
    },
    schedule: {
      _id: 'schedule-789',
      name: 'Test Schedule',
      trash: 0,
    },
  });
};

describe('useWebApplicationTaskDialog', () => {
  test('should initialize with correct default state', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
    expect(result.current.task).toBeUndefined();
    expect(result.current.name).toBeUndefined();
    expect(result.current.comment).toBeUndefined();
    expect(result.current.addTag).toBeUndefined();
    expect(result.current.alterable).toBeUndefined();
    expect(result.current.applyOverrides).toBeUndefined();
    expect(result.current.inAssets).toBeUndefined();
    expect(result.current.schedulePeriods).toBeUndefined();
    expect(result.current.webApplicationTargetId).toBeUndefined();
    expect(result.current.scheduleId).toBeUndefined();
    expect(result.current.scannerId).toBe(WEB_APPLICATION_DEFAULT_SCANNER_ID);
    expect(result.current.title).toBe('');
  });

  test('should open dialog for new web application task', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.openWebApplicationTaskDialog();
    });

    expect(result.current.webApplicationTaskDialogVisible).toBe(true);
    expect(result.current.task).toBeUndefined();
    expect(result.current.name).toBe('Unnamed');
    expect(result.current.comment).toBe('');
    expect(result.current.addTag).toBe(false);
    expect(result.current.alterable).toBe(false);
    expect(result.current.applyOverrides).toBe(true);
    expect(result.current.inAssets).toBe(false);
    expect(result.current.schedulePeriods).toBe(false);
    expect(result.current.webApplicationTargetId).toBeUndefined();
    expect(result.current.scheduleId).toBeUndefined();
    expect(result.current.scannerId).toBe(WEB_APPLICATION_DEFAULT_SCANNER_ID);
    expect(result.current.title).toBe('New Web Application Task');
  });

  test('should open dialog for editing existing task', () => {
    const mockTask = createMockTask();
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.openWebApplicationTaskDialog(mockTask);
    });

    expect(result.current.webApplicationTaskDialogVisible).toBe(true);
    expect(result.current.task).toBe(mockTask);
    expect(result.current.name).toBe('Test Task');
    expect(result.current.comment).toBe('Test comment');
    expect(result.current.addTag).toBe(false);
    expect(result.current.alterable).toBe(true);
    expect(result.current.applyOverrides).toBe(true);
    expect(result.current.inAssets).toBe(false);
    expect(result.current.schedulePeriods).toBe(false);
    expect(result.current.title).toBe('Edit Web Application Task Test Task');
  });

  test('should open dialog for editing web application task with web_application_target', () => {
    const mockWebApplicationTask = createMockWebApplicationTask();
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.openWebApplicationTaskDialog(mockWebApplicationTask);
    });

    expect(result.current.webApplicationTaskDialogVisible).toBe(true);
    expect(result.current.task).toBe(mockWebApplicationTask);
    expect(result.current.name).toBe('Web Application Test Task');
    expect(result.current.comment).toBe('Web Application test comment');
    expect(result.current.webApplicationTargetId).toBe(
      'web-application-target-456',
    );
    expect(result.current.scheduleId).toBe('schedule-789');
    expect(result.current.title).toBe(
      'Edit Web Application Task Web Application Test Task',
    );
  });

  test('should close dialog', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    // First open the dialog
    act(() => {
      result.current.openWebApplicationTaskDialog();
    });
    expect(result.current.webApplicationTaskDialogVisible).toBe(true);

    // Then close it
    act(() => {
      result.current.closeWebApplicationTaskDialog();
    });
    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
  });

  test('should correctly set preferences when editing task', () => {
    const mockTask = Task.fromElement({
      _id: 'task-with-preferences',
      name: 'Task with Preferences',
      comment: 'Task comment',
      web_application_target: {
        _id: 'web-application-target-123',
        name: 'Test Web Application Target',
        trash: 0,
      },
      preferences: {
        preference: [
          {
            scanner_name: 'scan_mode',
            value: 'active',
          },
          {
            scanner_name: 'ajax_spider_timeout',
            value: '3600',
          },
        ],
      },
    });

    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.openWebApplicationTaskDialog(mockTask);
    });

    expect(result.current.scanMode).toBe('active');
    expect(result.current.ajaxSpiderTimeout).toBe(3600);
  });

  test('should use default preference values for new task', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.openWebApplicationTaskDialog();
    });

    expect(result.current.scanMode).toBe('safe');
    expect(result.current.ajaxSpiderTimeout).toBe(3600);
  });

  test('should handle web application target change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.handleWebApplicationTargetChange('target-123');
    });

    expect(result.current.webApplicationTargetId).toBe('target-123');
  });

  test('should handle scanner change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.handleScannerChange('scanner-456');
    });

    expect(result.current.scannerId).toBe('scanner-456');
  });

  test('should handle schedule change', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.handleScheduleChange('schedule-789');
    });

    expect(result.current.scheduleId).toBe('schedule-789');
  });

  test('should update web application target ID directly via setWebApplicationTargetId', () => {
    const {renderHook} = rendererWith({gmp: {}, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    act(() => {
      result.current.setWebApplicationTargetId('target-direct-123');
    });

    expect(result.current.webApplicationTargetId).toBe('target-direct-123');
  });

  test('should create new web application task successfully', async () => {
    const createResponse = {id: 'new-task-123'};
    const createWebApplicationTask = testing
      .fn()
      .mockResolvedValue(createResponse);
    const onWebAppCreated = testing.fn();
    const onWebAppCreateError = testing.fn();

    const gmp = {
      task: {
        createWebApplicationTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useWebApplicationTaskDialog({
        onWebAppCreated,
        onWebAppCreateError,
      }),
    );

    const taskData = {
      name: 'New Task',
      comment: 'New task comment',
      inAssets: false,
      webApplicationTargetId: 'target-123',
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
      scanMode: SCAN_MODE_ACTIVE as typeof SCAN_MODE_ACTIVE,
      ajaxSpiderTimeout: 3600,
    };

    await act(async () => {
      await result.current.handleSaveWebApplicationTask(taskData);
    });

    expect(createWebApplicationTask).toHaveBeenCalledWith({
      comment: 'New task comment',
      name: 'New Task',
      webApplicationTargetId: 'target-123',
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
      scanMode: SCAN_MODE_ACTIVE as typeof SCAN_MODE_ACTIVE,
      ajaxSpiderTimeout: 3600,
    });

    expect(onWebAppCreated).toHaveBeenCalledWith(createResponse);
    expect(onWebAppCreateError).not.toHaveBeenCalled();
    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
  });

  test('should save existing web application task successfully', async () => {
    const saveResponse = {id: 'task-123'};
    const saveWebApplicationTask = testing.fn().mockResolvedValue(saveResponse);
    const onWebAppSaved = testing.fn();
    const onWebAppSaveError = testing.fn();

    const gmp = {
      task: {
        saveWebApplicationTask: saveWebApplicationTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useWebApplicationTaskDialog({
        onWebAppSaved,
        onWebAppSaveError,
      }),
    );

    const taskData = {
      id: 'task-123',
      name: 'Updated Task',
      comment: 'Updated comment',
      inAssets: true,
      webApplicationTargetId: 'target-456',
      scannerId: 'scanner-789',
      alertIds: ['alert-3'],
      scheduleId: 'schedule-456',
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_NO as typeof AUTO_DELETE_NO,
      autoDeleteData: 60,
      minQod: 80,
      schedulePeriods: false,
      scanMode: SCAN_MODE_SAFE as typeof SCAN_MODE_SAFE,
      ajaxSpiderTimeout: 3600,
    };

    await act(async () => {
      await result.current.handleSaveWebApplicationTask(taskData);
    });

    expect(saveWebApplicationTask).toHaveBeenCalledWith({
      id: 'task-123',
      comment: 'Updated comment',
      inAssets: true,
      name: 'Updated Task',
      webApplicationTargetId: 'target-456',
      scannerId: 'scanner-789',
      alertIds: ['alert-3'],
      scheduleId: 'schedule-456',
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_NO,
      autoDeleteData: 60,
      minQod: 80,
      schedulePeriods: false,
      scanMode: SCAN_MODE_SAFE as typeof SCAN_MODE_SAFE,
      ajaxSpiderTimeout: 3600,
    });

    expect(onWebAppSaved).toHaveBeenCalledWith(saveResponse);
    expect(onWebAppSaveError).not.toHaveBeenCalled();
    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
  });

  test('should handle create error', async () => {
    const error = new Error('Create failed');
    const createWebApplicationTask = testing.fn().mockRejectedValue(error);
    const onWebAppCreated = testing.fn();
    const onWebAppCreateError = testing.fn();

    const gmp = {
      task: {
        createWebApplicationTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useWebApplicationTaskDialog({
        onWebAppCreated,
        onWebAppCreateError,
      }),
    );

    const taskData = {
      name: 'Failed Task',
      comment: '',
      inAssets: true,
      webApplicationTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      addTag: false,
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
      schedulePeriods: false,
    };

    await act(async () => {
      await result.current.handleSaveWebApplicationTask(taskData);
    });

    expect(createWebApplicationTask).toHaveBeenCalled();
    expect(onWebAppCreated).not.toHaveBeenCalled();
    expect(onWebAppCreateError).toHaveBeenCalledWith(error);
    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
  });

  test('should handle save error', async () => {
    const error = new Error('Save failed');
    const saveWebApplicationTask = testing.fn().mockRejectedValue(error);
    const onWebAppSaved = testing.fn();
    const onWebAppSaveError = testing.fn();

    const gmp = {
      task: {
        saveWebApplicationTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useWebApplicationTaskDialog({
        onWebAppSaved,
        onWebAppSaveError,
      }),
    );

    const taskData = {
      id: 'task-123',
      name: 'Failed Task',
      comment: '',
      inAssets: true,
      webApplicationTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      alterable: false,
      applyOverrides: true,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
      schedulePeriods: false,
    };

    await act(async () => {
      await result.current.handleSaveWebApplicationTask(taskData);
    });

    expect(saveWebApplicationTask).toHaveBeenCalled();
    expect(onWebAppSaved).not.toHaveBeenCalled();
    expect(onWebAppSaveError).toHaveBeenCalledWith(error);
    expect(result.current.webApplicationTaskDialogVisible).toBe(false);
  });

  test('should handle boolean conversion for YES_VALUE/NO_VALUE correctly', async () => {
    const createWebApplicationTask = testing.fn().mockResolvedValue({});
    const gmp = {
      task: {
        createWebApplicationTask,
      },
    };

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() => useWebApplicationTaskDialog({}));

    // Test with false values
    const taskDataWithFalse = {
      name: 'Test Task',
      comment: '',
      inAssets: false,
      webApplicationTargetId: 'target-123',
      scannerId: 'scanner-456',
      alertIds: [],
      addTag: false,
      alterable: false,
      applyOverrides: false,
      schedulePeriods: false,
      autoDelete: AUTO_DELETE_KEEP as typeof AUTO_DELETE_KEEP,
    };

    await act(async () => {
      await result.current.handleSaveWebApplicationTask(taskDataWithFalse);
    });

    expect(createWebApplicationTask).toHaveBeenCalledWith(
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
