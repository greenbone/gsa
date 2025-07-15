/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, within, fireEvent} from 'web/testing';
import GeneralSettings from 'web/pages/user-settings/GeneralSettings';

describe('General tab', () => {
  test('displays user settings in the General tab', async () => {
    const Setting = {
      fromElement: ({_id, name, value, comment}) => ({
        _id,
        name,
        value,
        comment,
      }),
    };

    const dateFormatSetting = Setting.fromElement({
      _id: 'g1',
      name: 'userInterfaceDateFormat',
      value: 'MM/DD/YYYY',
      comment: 'Date format comment',
    });
    const timeFormatSetting = Setting.fromElement({
      _id: 'g2',
      name: 'userInterfaceTimeFormat',
      value: '24',
      comment: 'Time format comment',
    });
    const rowsPerPageSetting = Setting.fromElement({
      _id: 'g3',
      name: 'rowsperpage',
      value: '50',
      comment: 'Rows per page comment',
    });
    const detailsExportFilenameSetting = Setting.fromElement({
      _id: 'g4',
      name: 'detailsexportfilename',
      value: 'details-export-{{name}}.xml',
      comment: 'Details export filename comment',
    });
    const listExportFilenameSetting = Setting.fromElement({
      _id: 'g5',
      name: 'listexportfilename',
      value: 'list-export-{{name}}.csv',
      comment: 'List export filename comment',
    });
    const reportExportFilenameSetting = Setting.fromElement({
      _id: 'g6',
      name: 'reportexportfilename',
      value: 'report-{{name}}.pdf',
      comment: 'Report export filename comment',
    });
    const maxRowsPerPageSetting = Setting.fromElement({
      _id: 'g7',
      name: 'maxrowsperpage',
      value: '100',
      comment: 'Max rows per page comment',
    });
    const languageSetting = Setting.fromElement({
      _id: 'g8',
      name: 'userinterfacelanguage',
      value: 'en',
      comment: 'Language comment',
    });
    const autoCacheRebuildSetting = Setting.fromElement({
      _id: 'g9',
      name: 'autocacherebuild',
      value: '1',
      comment: 'Auto cache rebuild comment',
    });

    const settingsData = {
      userInterfaceDateFormat: dateFormatSetting,
      userInterfaceTimeFormat: timeFormatSetting,
      rowsperpage: rowsPerPageSetting,
      detailsexportfilename: detailsExportFilenameSetting,
      listexportfilename: listExportFilenameSetting,
      reportexportfilename: reportExportFilenameSetting,
      maxrowsperpage: maxRowsPerPageSetting,
      userinterfacelanguage: languageSetting,
      autocacherebuild: autoCacheRebuildSetting,
    };

    const USER_SETTINGS_DEFAULTS_LOADING_SUCCESS =
      'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS';
    const setTimezone = tz => ({type: 'SET_TIMEZONE', timezone: tz});
    const createGmpMock = () => ({settings: {manualUrl: 'test/'}});
    const UserSettingsPage = GeneralSettings;

    const {render, store} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmpMock(),
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: settingsData,
    });

    render(<UserSettingsPage />);

    const rows = screen.getAllByRole('row');
    const timezoneRow = rows.find(row => row.textContent?.includes('Timezone'));
    expect(timezoneRow).toBeTruthy();
    const timezoneCells = timezoneRow ? timezoneRow.querySelectorAll('td') : [];
    expect(timezoneCells.length).toBeGreaterThan(1);

    const dateTimeRow = rows.find(row =>
      row.textContent?.includes('Date & Time Format'),
    );
    expect(dateTimeRow).toBeTruthy();
    const dateTimeCells = dateTimeRow ? dateTimeRow.querySelectorAll('td') : [];
    expect(dateTimeCells.length).toBeGreaterThan(1);
    const valueCell = dateTimeCells[1];
    expect(valueCell.textContent).toMatch(/Time Format/i);
    expect(valueCell.textContent).toMatch(/Date Format/i);

    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.getByText('********')).toBeVisible();

    expect(screen.getByText('User Interface Language')).toBeVisible();
    expect(screen.getByText('English')).toBeVisible();

    expect(screen.getByText('Rows Per Page')).toBeVisible();
    expect(screen.getByText('50')).toBeVisible();

    expect(screen.getByText('Details Export File Name')).toBeVisible();
    expect(screen.getByText('details-export-{{name}}.xml')).toBeVisible();

    expect(screen.getByText('List Export File Name')).toBeVisible();
    expect(screen.getByText('list-export-{{name}}.csv')).toBeVisible();

    expect(screen.getByText('Report Export File Name')).toBeVisible();
    expect(screen.getByText('report-{{name}}.pdf')).toBeVisible();

    expect(screen.getByText(/Max Rows Per Page/i)).toBeVisible();
    expect(screen.getByText('100')).toBeVisible();

    expect(screen.getByText('Auto Cache Rebuild')).toBeVisible();
    expect(screen.getByText(/Yes/i)).toBeVisible();
  });

  const Setting = {
    fromElement: ({_id, name, value, comment}) => ({
      _id,
      name,
      value,
      comment,
    }),
  };
  const USER_SETTINGS_DEFAULTS_LOADING_SUCCESS =
    'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS';
  const setTimezone = tz => ({type: 'SET_TIMEZONE', timezone: tz});
  const createGmpMock = () => ({
    settings: {manualUrl: 'test/'},
    user: {
      renewSession: testing.fn().mockResolvedValue({data: 123}),
    },
  });
  const UserSettingsPage = GeneralSettings;

  function setupStore(settingsData) {
    const {render, store} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmpMock(),
      store: true,
    });
    store.dispatch(setTimezone('UTC'));
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: settingsData,
    });
    render(<UserSettingsPage />);
    return store;
  }

  test('can edit and save Rows Per Page', async () => {
    const settingsData = {
      rowsperpage: Setting.fromElement({
        _id: 'g3',
        name: 'rowsperpage',
        value: '50',
        comment: 'Rows per page comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const rppRow = rows.find(row => row.textContent?.includes('Rows Per Page'));
    expect(rppRow).toBeTruthy();
    expect(rppRow).toBeTruthy();
    const editButton = within(rppRow as HTMLElement).getByTestId('edit-icon');
    expect(editButton).toBeTruthy();
    editButton.click();
    const input = await screen.findByTestId('form-input');
    expect(input).toBeVisible();
    input.focus();
    (input as HTMLInputElement).value = '75';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        rowsperpage: Setting.fromElement({
          _id: 'g3',
          name: 'rowsperpage',
          value: '75',
          comment: 'Rows per page comment',
        }),
      },
    });
    await screen.findByDisplayValue('75');
  });

  test('can edit and save Details Export File Name', async () => {
    const settingsData = {
      detailsexportfilename: Setting.fromElement({
        _id: 'g4',
        name: 'detailsexportfilename',
        value: 'details-export-{{name}}.xml',
        comment: 'Details export filename comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const detailsRow = rows.find(row =>
      row.textContent?.includes('Details Export File Name'),
    );
    expect(detailsRow).toBeTruthy();
    expect(detailsRow).toBeTruthy();
    const editButton = within(detailsRow as HTMLElement).getByTestId(
      'edit-icon',
    );
    expect(editButton).toBeTruthy();
    editButton.click();
    const input = await screen.findByTestId('form-input');
    expect(input).toBeVisible();
    input.focus();
    (input as HTMLInputElement).value = 'details-new.xml';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        detailsexportfilename: Setting.fromElement({
          _id: 'g4',
          name: 'detailsexportfilename',
          value: 'details-new.xml',
          comment: 'Details export filename comment',
        }),
      },
    });
    await screen.findByDisplayValue('details-new.xml');
  });

  test('can edit and save List Export File Name', async () => {
    const settingsData = {
      listexportfilename: Setting.fromElement({
        _id: 'g5',
        name: 'listexportfilename',
        value: 'list-export-{{name}}.csv',
        comment: 'List export filename comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const listRow = rows.find(row =>
      row.textContent?.includes('List Export File Name'),
    );
    expect(listRow).toBeTruthy();
    expect(listRow).toBeTruthy();
    const editButton = within(listRow as HTMLElement).getByTestId('edit-icon');
    expect(editButton).toBeTruthy();
    editButton.click();
    const input = await screen.findByTestId('form-input');
    expect(input).toBeVisible();
    input.focus();
    (input as HTMLInputElement).value = 'list-new.csv';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        listexportfilename: Setting.fromElement({
          _id: 'g5',
          name: 'listexportfilename',
          value: 'list-new.csv',
          comment: 'List export filename comment',
        }),
      },
    });
    await screen.findByDisplayValue('list-new.csv');
  });

  test('can edit and save Report Export File Name', async () => {
    const settingsData = {
      reportexportfilename: Setting.fromElement({
        _id: 'g6',
        name: 'reportexportfilename',
        value: 'report-{{name}}.pdf',
        comment: 'Report export filename comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const reportRow = rows.find(row =>
      row.textContent?.includes('Report Export File Name'),
    );
    expect(reportRow).toBeTruthy();
    expect(reportRow).toBeTruthy();
    const editButton = within(reportRow as HTMLElement).getByTestId(
      'edit-icon',
    );
    expect(editButton).toBeTruthy();
    editButton.click();
    const input = await screen.findByTestId('form-input');
    expect(input).toBeVisible();
    input.focus();
    (input as HTMLInputElement).value = 'report-new.pdf';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        reportexportfilename: Setting.fromElement({
          _id: 'g6',
          name: 'reportexportfilename',
          value: 'report-new.pdf',
          comment: 'Report export filename comment',
        }),
      },
    });
    await screen.findByDisplayValue('report-new.pdf');
  });

  test('can edit and save User Interface Language', async () => {
    const settingsData = {
      userinterfacelanguage: Setting.fromElement({
        _id: 'g8',
        name: 'userinterfacelanguage',
        value: 'en',
        comment: 'Language comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const langRow = rows.find(row =>
      row.textContent?.includes('User Interface Language'),
    );
    screen.getByText('English');
    expect(langRow).toBeTruthy();
    expect(langRow).toBeTruthy();
    const editButton = within(langRow as HTMLElement).getByTestId('edit-icon');
    expect(editButton).toBeTruthy();
    editButton.click();
    const select = await screen.findByTestId('form-select');
    expect(select).toBeVisible();
    select.focus();
    fireEvent.change(select, {target: {value: 'de'}});
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        userinterfacelanguage: Setting.fromElement({
          _id: 'g8',
          name: 'userinterfacelanguage',
          value: 'de',
          comment: 'Language comment',
        }),
      },
    });
    screen.getByText(/German|Deutsch/i);
  });

  test('can edit and save Auto Cache Rebuild', async () => {
    const settingsData = {
      autocacherebuild: Setting.fromElement({
        _id: 'g9',
        name: 'autocacherebuild',
        value: '0',
        comment: 'Auto cache rebuild comment',
      }),
    };
    const store = setupStore(settingsData);
    const rows = screen.getAllByRole('row');
    const autoCacheRow = rows.find(row =>
      row.textContent?.includes('Auto Cache Rebuild'),
    );
    expect(autoCacheRow).toBeTruthy();
    expect(autoCacheRow).toBeTruthy();
    const editButton = within(autoCacheRow as HTMLElement).getByTestId(
      'edit-icon',
    );
    expect(editButton).toBeTruthy();
    editButton.click();
    const checkbox = await screen.findByTestId('opensight-checkbox');
    expect(checkbox).toBeVisible();
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    checkbox.click();
    const saveButton = screen.getByTestId('save-icon');
    expect(saveButton).toBeVisible();
    saveButton.click();
    store.dispatch({
      type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
      data: {
        autocacherebuild: Setting.fromElement({
          _id: 'g9',
          name: 'autocacherebuild',
          value: '1',
          comment: 'Auto cache rebuild comment',
        }),
      },
    });
    const autoCacheInput = await screen.findByTestId('opensight-checkbox');
    expect((autoCacheInput as HTMLInputElement).checked).toBe(true);
  });
});
