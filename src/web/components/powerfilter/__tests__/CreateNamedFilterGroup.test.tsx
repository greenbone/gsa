/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue, fireEvent} from 'web/testing';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';

describe('CreateNamedFilterGroup tests', () => {
  test('should render with default values', () => {
    render(<CreateNamedFilterGroup />);
    expect(screen.getByName('filterName')).toHaveValue('');
    expect(screen.getByName('saveNamedFilter')).not.toBeChecked();
  });

  test('should allow to set filter name', () => {
    const handleChange = testing.fn();
    render(
      <CreateNamedFilterGroup
        filterName="Test Filter"
        saveNamedFilter={true}
        onValueChange={handleChange}
      />,
    );
    expect(screen.getByName('filterName')).toHaveValue('Test Filter');

    changeInputValue(screen.getByName('filterName'), 'Updated Filter');
    expect(handleChange).toHaveBeenCalledWith('Updated Filter', 'filterName');
  });

  test('should not allow filter name change when saveNamedFilter is false', () => {
    const handleChange = testing.fn();
    render(
      <CreateNamedFilterGroup
        filterName="Test Filter"
        saveNamedFilter={false}
        onValueChange={handleChange}
      />,
    );
    expect(screen.getByName('filterName')).toBeDisabled();
    changeInputValue(screen.getByName('filterName'), 'Updated Filter');
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('should toggle saveNamedFilter checkbox', () => {
    const handleChange = testing.fn();
    render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        onValueChange={handleChange}
      />,
    );
    const checkbox = screen.getByName('saveNamedFilter');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true, 'saveNamedFilter');
  });

  test('should render title and placeholder', () => {
    render(<CreateNamedFilterGroup />);
    expect(screen.getByText('Store filter as:')).toBeVisible();
    expect(screen.getByPlaceholderText('Filter Name')).toBeVisible();
  });
});
