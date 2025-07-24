/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  testing,
} from '@gsa/testing';
import {rendererWith, wait} from 'web/testing';
import useSettingSave from 'web/pages/user-settings/useSettingSave';

const setEditMode = testing.fn();
describe('useSettingSave hook', () => {
  let saveSettingMock;
  let originalConsoleError;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = testing.fn();
    saveSettingMock = testing.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  function setupHook() {
    const gmp = {
      user: {
        saveSetting: saveSettingMock,

        getSetting: testing.fn().mockResolvedValue({}),
      },
    };
    const {result} = rendererWith({
      store: true,
      gmp,
      router: true,
    }).renderHook(() => useSettingSave());
    return result;
  }

  test('saveSetting calls saveSetting and clears error on success', async () => {
    const result = setupHook();
    await result.current.saveSetting(
      'settingId',
      'settingName',
      'value',
      setEditMode,
    );
    expect(saveSettingMock).toHaveBeenCalledWith('settingId', 'value');
    expect(setEditMode).toHaveBeenCalledWith(false);
    expect(result.current.getErrorMessage('settingName')).toBe('');
  });

  test('saveSetting sets error and calls loadSingleSetting on failure', async () => {
    saveSettingMock.mockRejectedValueOnce(new Error('fail'));
    const result = setupHook();
    await result.current.saveSetting(
      'settingId',
      'settingName',
      'value',
      setEditMode,
    );
    await wait();
    expect(result.current.getErrorMessage('settingName')).toBe('fail');
    expect(setEditMode).toHaveBeenCalledWith(true);
  });

  test('clearErrorMessage clears error for specific setting', async () => {
    const result = setupHook();
    result.current.setErrorMessage('foo', 'bar');
    await wait();
    expect(result.current.getErrorMessage('foo')).toBe('bar');
    result.current.clearErrorMessage('foo');
    await wait();
    expect(result.current.getErrorMessage('foo')).toBe('');
  });

  test('clearAllErrorMessages clears all errors', async () => {
    const result = setupHook();
    result.current.setErrorMessage('foo', 'bar');
    result.current.setErrorMessage('baz', 'qux');
    await wait();
    expect(result.current.getErrorMessage('foo')).toBe('bar');
    expect(result.current.getErrorMessage('baz')).toBe('qux');
    result.current.clearAllErrorMessages();
    await wait();
    expect(result.current.getErrorMessage('foo')).toBe('');
    expect(result.current.getErrorMessage('baz')).toBe('');
  });

  test('setErrorMessage sets error for specific setting', async () => {
    const result = setupHook();
    result.current.setErrorMessage('foo', 'error!');
    await wait();
    expect(result.current.getErrorMessage('foo')).toBe('error!');
  });
});
