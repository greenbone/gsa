/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import FilterDialog from 'web/components/powerfilter/FilterDialog';

describe('FilterDialog tests', () => {
  test('should render with children', () => {
    render(
      <FilterDialog onClose={testing.fn()} onSave={testing.fn()}>
        <div>Test Content</div>
      </FilterDialog>,
    );
    expect(screen.getDialog()).toBeVisible();
    expect(screen.getByText('Test Content')).toBeVisible();
    expect(screen.getDialogTitle()).toHaveTextContent('Update Filter');
    expect(screen.getDialogSaveButton()).toHaveTextContent('Update');
  });

  test('should allow to close dialog', () => {
    const handleClose = testing.fn();
    render(
      <FilterDialog onClose={handleClose}>
        <div>Test Content</div>
      </FilterDialog>,
    );
    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to click on save button', () => {
    const handleSave = testing.fn();
    render(
      <FilterDialog onSave={handleSave}>
        <div>Test Content</div>
      </FilterDialog>,
    );
    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalled();
  });
});
