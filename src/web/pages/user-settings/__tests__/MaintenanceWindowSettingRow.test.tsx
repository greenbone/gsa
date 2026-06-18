/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  rendererWithTableBody,
  screen,
  wait,
  within,
} from 'web/testing';
import {createSession} from 'gmp/testing';
import MaintenanceWindowSettingRow from 'web/pages/user-settings/MaintenanceWindowSettingRow';

const ICAL_DAILY =
  'BEGIN:VCALENDAR\r\n' +
  'PRODID:-//Greenbone.net//NONSGML Greenbone Security Assistant\r\n' +
  'VERSION:2.0\r\n' +
  'BEGIN:VEVENT\r\n' +
  'UID:test-mw-daily-0001\r\n' +
  'DTSTART:20240117T220000Z\r\n' +
  'DURATION:PT8H\r\n' +
  'RRULE:FREQ=DAILY;INTERVAL=1\r\n' +
  'SUMMARY:Maintenance Window\r\n' +
  'END:VEVENT\r\n' +
  'END:VCALENDAR';

const ICAL_OPEN_END =
  'BEGIN:VCALENDAR\r\n' +
  'PRODID:-//Greenbone.net//NONSGML Greenbone Security Assistant\r\n' +
  'VERSION:2.0\r\n' +
  'BEGIN:VEVENT\r\n' +
  'UID:test-mw-open-0001\r\n' +
  'DTSTART:20240117T220000Z\r\n' +
  'SUMMARY:Maintenance Window\r\n' +
  'END:VEVENT\r\n' +
  'END:VCALENDAR';

const createGmp = () => ({
  settings: {manualUrl: 'test/'},
  session: createSession({timezone: 'UTC'}),
  user: {
    saveSetting: testing.fn().mockResolvedValue(undefined),
  },
});

const defaultSetting = {
  id: 'mw-setting-id',
  value: undefined as string | undefined,
  comment: 'Maintenance window setting',
};

const rendererOptions = (gmp = createGmp()) => ({
  gmp,
  store: true as const,
  router: true,
});

describe('MaintenanceWindowSettingRow', () => {
  test('renders "No" when no iCal value is set', () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: undefined}}
      />,
    );

    expect(screen.getByText('Maintenance Window')).toBeVisible();
    expect(screen.getByText('No')).toBeVisible();
  });

  test('displays formatted time range from iCal (daily)', () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    expect(row.textContent).toContain('22:00');
    expect(row.textContent).toContain('06:00');
    expect(row.textContent).toContain('daily');
  });

  test('displays "Open End" when iCal has no duration', () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_OPEN_END}}
      />,
    );

    const row = screen.getByRole('row');
    expect(row.textContent).toContain('22:00');
    expect(row.textContent).toContain('Open End');
  });

  test('opens edit form when edit icon is clicked', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    const editButton = within(row).getByTestId('edit-icon');
    fireEvent.click(editButton);

    expect(await screen.findByText('Start')).toBeVisible();
    expect(screen.getByText('End')).toBeVisible();
    expect(screen.getByText('Timezone')).toBeVisible();
    expect(screen.getByText('Repeat')).toBeVisible();
  });

  test('populates form fields from iCal on edit', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));

    expect(await screen.findByDisplayValue('22:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('06:00')).toBeInTheDocument();

    expect(screen.getByTestId('repeat-select')).toHaveValue('Daily');
  });

  test('Open End checkbox is checked and pickers are disabled for open-end iCal', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_OPEN_END}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));

    const checkbox = await screen.findByTestId('opensight-checkbox');
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    const datePickers = screen.getAllByTestId('datepicker-input');
    expect(datePickers[1]).toBeDisabled();
  });

  test('unchecking Open End enables end date/time pickers', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_OPEN_END}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));

    const checkbox = await screen.findByTestId('opensight-checkbox');
    fireEvent.click(checkbox);

    const datePickers = screen.getAllByTestId('datepicker-input');
    expect(datePickers[1]).not.toBeDisabled();
  });

  test('cancel restores original view', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));
    await screen.findByText('Start');

    fireEvent.click(screen.getByTestId('X-icon'));

    const restoredRow = screen.getByRole('row');
    expect(restoredRow.textContent).toContain('22:00');
    expect(screen.queryByText('Start')).toBeNull();
  });

  test('calls saveSetting with built iCal on save', async () => {
    const gmp = createGmp();
    const {render} = rendererWithTableBody(rendererOptions(gmp));
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));
    await screen.findByText('Start');

    fireEvent.click(screen.getByTestId('save-icon'));
    await wait();

    expect(gmp.user.saveSetting).toHaveBeenCalledWith(
      'mw-setting-id',
      expect.stringContaining('BEGIN:VCALENDAR'),
    );
  });

  test('shows error when setting ID is missing', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{id: undefined, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));
    await screen.findByText('Start');

    fireEvent.click(screen.getByTestId('save-icon'));
    await wait();

    expect(
      await screen.findByText(
        'Cannot save maintenance window: missing setting ID.',
      ),
    ).toBeVisible();
  });

  test('disableEditIcon hides the edit button', () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        disableEditIcon
        maintenanceWindow={defaultSetting}
      />,
    );

    const row = screen.getByRole('row');
    expect(within(row).queryByTestId('edit-icon')).toBeNull();
  });

  test('calls saveSetting with empty string on clear and closes edit mode', async () => {
    const gmp = createGmp();
    const {render} = rendererWithTableBody(rendererOptions(gmp));
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{...defaultSetting, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));
    await screen.findByText('Start');

    fireEvent.click(screen.getByTestId('reset-icon'));
    await wait();

    expect(gmp.user.saveSetting).toHaveBeenCalledWith('mw-setting-id', '');
    expect(screen.queryByText('Start')).toBeNull();
  });

  test('shows error when setting ID is missing on clear', async () => {
    const {render} = rendererWithTableBody(rendererOptions());
    render(
      <MaintenanceWindowSettingRow
        maintenanceWindow={{id: undefined, value: ICAL_DAILY}}
      />,
    );

    const row = screen.getByRole('row');
    fireEvent.click(within(row).getByTestId('edit-icon'));
    await screen.findByText('Start');

    fireEvent.click(screen.getByTestId('reset-icon'));
    await wait();

    expect(
      await screen.findByText(
        'Cannot clear maintenance window: missing setting ID.',
      ),
    ).toBeVisible();
  });
});
