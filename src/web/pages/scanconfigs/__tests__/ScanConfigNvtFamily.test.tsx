/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableBody, screen, within} from 'web/testing';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  WHOLE_SELECTION_FAMILIES,
} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import ScanConfigNvtFamily from 'web/pages/scanconfigs/ScanConfigNvtFamily';

describe('NvtFamily tests', () => {
  test('should render a regular family and call handlers', () => {
    const handleEditConfigFamilyClick = testing.fn();
    const handleSelectChange = testing.fn();
    const handleTrendChange = testing.fn();
    const {render} = rendererWithTableBody();

    render(
      <ScanConfigNvtFamily
        familyMaxNvtCount={5}
        familyName="family1"
        familyNvtCount={2}
        select={YES_VALUE}
        title="Edit Family"
        trend={SCANCONFIG_TREND_DYNAMIC}
        onEditConfigFamilyClick={handleEditConfigFamilyClick}
        onSelectChange={handleSelectChange}
        onTrendChange={handleTrendChange}
      />,
    );

    const row = screen.getByRole('cell', {name: 'family1'}).closest('tr');
    expect(row).not.toBeNull();
    const familyRow = within(row as HTMLElement);

    expect(familyRow.getByText('family1')).toBeVisible();
    expect(familyRow.getByText('2 of 5')).toBeVisible();

    const trendRadios = familyRow.getAllByRole('radio');
    expect(trendRadios).toHaveLength(2);
    expect(trendRadios[0]).toBeChecked();
    expect(trendRadios[1]).not.toBeChecked();
    expect(trendRadios[0]).toBeEnabled();
    expect(trendRadios[1]).toBeEnabled();

    const selectAllCheckbox = familyRow.getByRole('checkbox');
    expect(selectAllCheckbox).toBeChecked();

    fireEvent.click(trendRadios[1]);
    expect(handleTrendChange).toHaveBeenCalledWith(
      SCANCONFIG_TREND_STATIC,
      'family1',
    );

    fireEvent.click(selectAllCheckbox);
    expect(handleSelectChange).toHaveBeenCalledWith(NO_VALUE, 'family1');

    const editIcon = familyRow.getByRole('button', {name: /edit icon/i});
    expect(editIcon).toHaveAttribute('title', 'Edit Family');
    fireEvent.click(editIcon);
    expect(handleEditConfigFamilyClick).toHaveBeenCalledWith('family1');
  });

  test('should disable trend editing for whole-selection families', () => {
    const handleEditConfigFamilyClick = testing.fn();
    const handleSelectChange = testing.fn();
    const handleTrendChange = testing.fn();
    const {render} = rendererWithTableBody();
    const familyName = WHOLE_SELECTION_FAMILIES[0];

    render(
      <ScanConfigNvtFamily
        familyMaxNvtCount={7}
        familyName={familyName}
        familyNvtCount={3}
        select={NO_VALUE}
        title="Edit Family"
        trend={SCANCONFIG_TREND_DYNAMIC}
        onEditConfigFamilyClick={handleEditConfigFamilyClick}
        onSelectChange={handleSelectChange}
        onTrendChange={handleTrendChange}
      />,
    );

    const row = screen.getByRole('cell', {name: familyName}).closest('tr');
    expect(row).not.toBeNull();
    const familyRow = within(row as HTMLElement);

    expect(
      familyRow.queryByRole('button', {name: /edit icon/i}),
    ).not.toBeInTheDocument();

    const trendRadios = familyRow.getAllByRole('radio');
    expect(trendRadios).toHaveLength(2);
    expect(trendRadios[0]).toBeDisabled();
    expect(trendRadios[1]).toBeDisabled();

    fireEvent.click(trendRadios[0]);
    fireEvent.click(trendRadios[1]);
    expect(handleTrendChange).not.toHaveBeenCalled();

    const selectAllCheckbox = familyRow.getByRole('checkbox');
    expect(selectAllCheckbox).not.toBeChecked();
    fireEvent.click(selectAllCheckbox);
    expect(handleSelectChange).toHaveBeenCalledWith(YES_VALUE, familyName);
    expect(handleEditConfigFamilyClick).not.toHaveBeenCalled();
  });
});
