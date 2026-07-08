/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, render, screen, within} from 'web/testing';
import {type ScanConfigPreference} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import ScanConfigScannerPreferences from 'web/pages/scanconfigs/ScanConfigScannerPreferences';

const createPreferences = (): ScanConfigPreference[] => [
  {
    default: '20',
    hr_name: 'Maximum hosts',
    name: 'max_hosts',
    value: '20',
  },
  {
    default: YES_VALUE,
    hr_name: 'Ping Hosts',
    name: 'ping_hosts',
    value: YES_VALUE,
  },
];

const createValues = () => ({
  max_hosts: '10',
  ping_hosts: YES_VALUE,
});

const unfoldSection = () => {
  const section = screen.getByTestId('scanner-preferences-section');
  const foldIcon = section.querySelector('.section-fold-icon');

  expect(foldIcon).not.toBeNull();
  fireEvent.click(foldIcon as HTMLElement);

  return section;
};

describe('ScanConfigScannerPreferences tests', () => {
  test('should render scanner preferences', () => {
    const preferences = createPreferences();
    const values = createValues();
    const handleValuesChange = testing.fn();

    render(
      <ScanConfigScannerPreferences
        preferences={preferences}
        values={values}
        onValuesChange={handleValuesChange}
      />,
    );

    const section = unfoldSection();

    expect(section).toHaveTextContent('Edit Scanner Preferences (2)');
    expect(section).toHaveTextContent('Name');
    expect(section).toHaveTextContent('New Value');
    expect(section).toHaveTextContent('Default Value');
    expect(section).toHaveTextContent('Maximum hosts');
    expect(section).toHaveTextContent('Ping Hosts');
    expect(section).toHaveTextContent('20');

    expect(within(section).getByName('max_hosts')).toHaveValue('10');

    const pingHostsRow = screen.getByText('Ping Hosts').closest('tr');
    expect(pingHostsRow).not.toBeNull();
    expect(
      within(pingHostsRow as HTMLElement).getByTestId('radio-yes'),
    ).toBeChecked();
  });

  test('should call change handler when changing preference values', () => {
    const preferences = createPreferences();
    const values = createValues();
    const handleValuesChange = testing.fn();

    render(
      <ScanConfigScannerPreferences
        preferences={preferences}
        values={values}
        onValuesChange={handleValuesChange}
      />,
    );

    const section = unfoldSection();

    changeInputValue(within(section).getByName('max_hosts'), '25');
    expect(handleValuesChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {max_hosts: '25'},
    });

    const pingHostsRow = screen.getByText('Ping Hosts').closest('tr');
    expect(pingHostsRow).not.toBeNull();

    fireEvent.click(
      within(pingHostsRow as HTMLElement).getByTestId('radio-no'),
    );
    expect(handleValuesChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {ping_hosts: NO_VALUE},
    });
  });
});
