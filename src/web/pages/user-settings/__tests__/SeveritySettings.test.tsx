/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, wait, rendererWith} from 'web/testing';
import SeveritySettings from 'web/pages/user-settings/SeveritySettings';

describe('SeveritySettings', () => {
  const dynamicSeveritySetting = {
    id: 'd1',
    name: 'dynamicseverity',
    value: '1',
    comment: 'Dynamic severity comment',
  };
  const defaultSeveritySetting = {
    id: 'd2',
    name: 'defaultseverity',
    value: '5.0',
    comment: 'Default severity comment',
  };
  const settingsData = {
    dynamicseverity: dynamicSeveritySetting,
    defaultseverity: defaultSeveritySetting,
    getByName: (name: string) => settingsData[name],
  };
  const rendererOptions = {
    gmp: {
      settings: {manualUrl: 'test/'},
      user: {
        renewSession: testing.fn().mockResolvedValue({data: 123}),
        getSetting: testing.fn().mockResolvedValue({data: {value: '1'}}),
        saveSetting: testing.fn().mockResolvedValue({data: {value: '0'}}),
      },
    },
    store: true,
  };

  test('renders both settings rows with correct labels and values', async () => {
    const {render, store} = rendererWith(rendererOptions);
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });
    render(<SeveritySettings />);
    expect(screen.getByText('Dynamic Severity')).toBeVisible();
    expect(screen.getByText('Default Severity')).toBeVisible();
    expect(screen.getByText('Yes')).toBeVisible();
    expect(screen.getByText('5.0')).toBeVisible();
  });

  test('edit mode toggles for Dynamic Severity and saves value', async () => {
    const {render, store} = rendererWith(rendererOptions);
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });
    render(<SeveritySettings />);
    const dynamicSeverityValue = screen.getByText(/yes/i);
    expect(dynamicSeverityValue).toBeVisible();
    expect(dynamicSeverityValue).toBeVisible();
    const editButtons = screen.getAllByRole('button', {name: /edit/i});
    fireEvent.click(editButtons[0]);
    await wait();
    const checkbox = screen.getByTestId('opensight-checkbox');
    fireEvent.click(checkbox);
    await wait();
    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);
    await wait();
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: {
        ...settingsData,
        dynamicseverity: {
          ...dynamicSeveritySetting,
          value: '0',
        },
      },
    });
    await wait();
    expect(screen.getByText(/No/i)).toBeVisible();
  });

  test('edit mode toggles for Default Severity and saves value', async () => {
    const {render, store} = rendererWith(rendererOptions);
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });
    render(<SeveritySettings />);
    const editButtons = screen.getAllByRole('button', {name: /edit/i});
    fireEvent.click(editButtons[1]);
    const spinner = screen.getByTestId('number-input');
    fireEvent.change(spinner, {target: {value: 5.5}});
    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);
    await wait();
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: {
        ...settingsData,
        defaultseverity: {
          ...defaultSeveritySetting,
          value: '5.5',
        },
      },
    });
    await wait();
    expect(screen.getByText('5.5')).toBeVisible();
  });

  test('canceling edit mode restores previous value for Dynamic Severity', async () => {
    const {render, store} = rendererWith(rendererOptions);
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });
    render(<SeveritySettings />);
    const editButtons = screen.getAllByRole('button', {name: /edit/i});
    fireEvent.click(editButtons[0]);
    const cancelButton = screen.getByTestId('X-icon');
    fireEvent.click(cancelButton);
    expect(screen.getByText('Yes')).toBeVisible();
  });

  test('canceling edit mode restores previous value for Default Severity', async () => {
    const {render, store} = rendererWith(rendererOptions);
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });
    render(<SeveritySettings />);
    const editButtons = screen.getAllByRole('button', {name: /edit/i});
    fireEvent.click(editButtons[1]);
    const cancelButton = screen.getByTestId('X-icon');
    fireEvent.click(cancelButton);
    const viewSpan = screen.getByText('5.0');
    expect(viewSpan).toBeVisible();
  });
});
