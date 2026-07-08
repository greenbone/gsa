/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen, within} from 'web/testing';
import {
  type ScanConfigFamilyTrends,
  type ScanConfigNvtsSelected,
} from 'gmp/commands/scan-config';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  WHOLE_SELECTION_FAMILIES,
  type ScanConfigFamilies,
  type ScanConfigFamily,
} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import ScanConfigNvtFamilies from 'web/pages/scanconfigs/ScanConfigNvtFamilies';

const createFamilies = (): ScanConfigFamily[] => [
  {
    name: 'family1',
    nvts: {
      max: 5,
    },
  },
  {
    name: WHOLE_SELECTION_FAMILIES[0],
    nvts: {
      max: 7,
    },
  },
];

const createConfigFamilies = (): ScanConfigFamilies => ({
  family1: {
    name: 'family1',
    nvts: {
      count: 2,
      max: 5,
    },
    trend: SCANCONFIG_TREND_DYNAMIC,
  },
  [WHOLE_SELECTION_FAMILIES[0]]: {
    name: WHOLE_SELECTION_FAMILIES[0],
    nvts: {
      count: 3,
      max: 7,
    },
    trend: SCANCONFIG_TREND_STATIC,
  },
});

const createSelect = (): ScanConfigNvtsSelected => ({
  family1: YES_VALUE,
  [WHOLE_SELECTION_FAMILIES[0]]: NO_VALUE,
});

const createTrend = (): ScanConfigFamilyTrends => ({
  family1: SCANCONFIG_TREND_DYNAMIC,
  [WHOLE_SELECTION_FAMILIES[0]]: SCANCONFIG_TREND_STATIC,
});

const unfoldSection = () => {
  const section = screen.getByTestId('nvt-families-section');
  const foldIcon = section.querySelector('.section-fold-icon');

  expect(foldIcon).not.toBeNull();
  fireEvent.click(foldIcon as HTMLElement);

  return section;
};

describe('NvtFamilies tests', () => {
  test('should render nvt families section', () => {
    const handleEditConfigFamilyClick = testing.fn();
    const handleValueChange = testing.fn();
    const families = createFamilies();
    const configFamilies = createConfigFamilies();
    const select = createSelect();
    const trend = createTrend();

    render(
      <ScanConfigNvtFamilies
        configFamilies={configFamilies}
        editTitle="Edit Scan Config Family"
        families={families}
        select={select}
        trend={trend}
        onEditConfigFamilyClick={handleEditConfigFamilyClick}
        onValueChange={handleValueChange}
      />,
    );

    const section = unfoldSection();
    const nvtFamiliesSection = within(section);

    expect(section).toHaveTextContent(
      'Edit Network Vulnerability Test Families (2)',
    );
    expect(
      nvtFamiliesSection.getByRole('columnheader', {name: 'Family'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('columnheader', {name: 'NVTs selected'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('columnheader', {name: 'Trend'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('columnheader', {name: 'Select all NVTs'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('columnheader', {name: 'Actions'}),
    ).toBeVisible();

    expect(
      nvtFamiliesSection.getByRole('cell', {name: 'family1'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('cell', {name: '2 of 5'}),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('cell', {
        name: WHOLE_SELECTION_FAMILIES[0],
      }),
    ).toBeVisible();
    expect(
      nvtFamiliesSection.getByRole('cell', {name: '3 of 7'}),
    ).toBeVisible();

    const editButtons = nvtFamiliesSection.getAllByRole('button', {
      name: /edit icon/i,
    });
    expect(editButtons).toHaveLength(1);

    fireEvent.click(editButtons[0]);
    expect(handleEditConfigFamilyClick).toHaveBeenCalledWith('family1');
  });

  test('should call onValueChange when changing a regular family', () => {
    const handleEditConfigFamilyClick = testing.fn();
    const handleValueChange = testing.fn();
    const families = createFamilies();
    const configFamilies = createConfigFamilies();
    const select = createSelect();
    const trend = createTrend();

    render(
      <ScanConfigNvtFamilies
        configFamilies={configFamilies}
        editTitle="Edit Scan Config Family"
        families={families}
        select={select}
        trend={trend}
        onEditConfigFamilyClick={handleEditConfigFamilyClick}
        onValueChange={handleValueChange}
      />,
    );

    const section = unfoldSection();
    const row = within(section)
      .getByRole('cell', {name: 'family1'})
      .closest('tr');
    expect(row).not.toBeNull();
    const familyRow = within(row as HTMLElement);

    const trendRadios = familyRow.getAllByRole('radio');
    fireEvent.click(trendRadios[1]);
    expect(handleValueChange).toHaveBeenCalledWith(
      {
        family1: SCANCONFIG_TREND_STATIC,
        [WHOLE_SELECTION_FAMILIES[0]]: SCANCONFIG_TREND_STATIC,
      },
      'trend',
    );

    const selectAllCheckbox = familyRow.getByRole('checkbox');
    fireEvent.click(selectAllCheckbox);
    expect(handleValueChange).toHaveBeenCalledWith(
      {
        family1: NO_VALUE,
        [WHOLE_SELECTION_FAMILIES[0]]: NO_VALUE,
      },
      'select',
    );
  });

  test('should update trend and selection for whole-selection families', () => {
    const handleEditConfigFamilyClick = testing.fn();
    const handleValueChange = testing.fn();
    const families = createFamilies();
    const configFamilies = createConfigFamilies();
    const select = createSelect();
    const trend = createTrend();
    const familyName = WHOLE_SELECTION_FAMILIES[0];

    render(
      <ScanConfigNvtFamilies
        configFamilies={configFamilies}
        editTitle="Edit Scan Config Family"
        families={families}
        select={select}
        trend={trend}
        onEditConfigFamilyClick={handleEditConfigFamilyClick}
        onValueChange={handleValueChange}
      />,
    );

    const section = unfoldSection();
    const row = within(section)
      .getByRole('cell', {name: familyName})
      .closest('tr');
    expect(row).not.toBeNull();
    const familyRow = within(row as HTMLElement);

    const selectAllCheckbox = familyRow.getByRole('checkbox');
    fireEvent.click(selectAllCheckbox);

    expect(handleValueChange).toHaveBeenNthCalledWith(
      1,
      {
        family1: SCANCONFIG_TREND_DYNAMIC,
        [familyName]: SCANCONFIG_TREND_DYNAMIC,
      },
      'trend',
    );
    expect(handleValueChange).toHaveBeenNthCalledWith(
      2,
      {
        family1: YES_VALUE,
        [familyName]: YES_VALUE,
      },
      'select',
    );
  });
});
