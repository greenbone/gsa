/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen, within} from 'web/testing';
import {type ScanConfigPreference} from 'gmp/models/scan-config';
import ScanConfigNvtPreferences from 'web/pages/scanconfigs/ScanConfigNvtPreferences';

const createPreferences = (): ScanConfigPreference[] => [
  {
    id: 1,
    name: 'Timeout',
    value: '10',
    nvt: {
      oid: '1.3.6.1.4.1.25623.1.0.100001',
      name: 'NVT One',
    },
  },
  {
    id: 2,
    name: 'Retries',
    value: '3',
    nvt: {
      oid: '1.3.6.1.4.1.25623.1.0.100002',
      name: 'NVT Two',
    },
  },
];

const unfoldSection = () => {
  const section = screen.getByTestId('nvt-preferences-section');
  const foldIcon = section.querySelector('.section-fold-icon');

  expect(foldIcon).not.toBeNull();
  fireEvent.click(foldIcon as HTMLElement);

  return section;
};

describe('ScanConfigNvtPreferences tests', () => {
  test('should render nvt preferences table', () => {
    const preferences = createPreferences();

    render(
      <ScanConfigNvtPreferences
        editTitle="Edit Scan Config NVT Details"
        preferences={preferences}
      />,
    );

    const section = unfoldSection();
    const nvtPreferencesSection = within(section);

    expect(section).toHaveTextContent(
      'Network Vulnerability Test Preferences (2)',
    );
    expect(
      nvtPreferencesSection.getByRole('columnheader', {name: 'NVT'}),
    ).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('columnheader', {name: 'Name'}),
    ).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('columnheader', {name: 'Value'}),
    ).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('columnheader', {name: 'Actions'}),
    ).toBeVisible();

    expect(
      nvtPreferencesSection.getByRole('cell', {name: 'NVT One'}),
    ).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('cell', {name: 'Timeout'}),
    ).toBeVisible();
    expect(nvtPreferencesSection.getByRole('cell', {name: '10'})).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('cell', {name: 'NVT Two'}),
    ).toBeVisible();
    expect(
      nvtPreferencesSection.getByRole('cell', {name: 'Retries'}),
    ).toBeVisible();
    expect(nvtPreferencesSection.getByRole('cell', {name: '3'})).toBeVisible();
  });

  test('should call onEditNvtDetailsClick with nvt oid', () => {
    const preferences = createPreferences();
    const handleEditNvtDetailsClick = testing.fn();

    render(
      <ScanConfigNvtPreferences
        editTitle="Edit Scan Config NVT Details"
        preferences={preferences}
        onEditNvtDetailsClick={handleEditNvtDetailsClick}
      />,
    );

    const section = unfoldSection();
    const editNvtIcons = within(section).getAllByTestId('edit-icon');

    fireEvent.click(editNvtIcons[0]);

    expect(editNvtIcons[0]).toHaveAttribute(
      'title',
      'Edit Scan Config NVT Details',
    );
    expect(handleEditNvtDetailsClick).toHaveBeenCalledWith(
      '1.3.6.1.4.1.25623.1.0.100001',
    );
  });

  test('should render empty state when preferences are not provided', () => {
    render(
      <ScanConfigNvtPreferences editTitle="Edit Scan Config NVT Details" />,
    );

    const section = unfoldSection();
    const editNvtIcons = within(section).queryAllByTestId('edit-icon');

    expect(section).toHaveTextContent(
      'Network Vulnerability Test Preferences (0)',
    );
    expect(editNvtIcons).toHaveLength(0);
  });
});
