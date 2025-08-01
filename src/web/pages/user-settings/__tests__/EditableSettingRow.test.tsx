/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  within,
  fireEvent,
  rendererWithTableBody,
  wait,
} from 'web/testing';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';

describe('EditableSettingRow', () => {
  const defaultProps = {
    title: 'Test Setting',
    label: 'Test Label',
    isEditMode: false,
    editComponent: <input data-testid="edit-input" />,
    viewComponent: <span data-testid="view-span">View Value</span>,
    onSave: testing.fn(),
    onCancel: testing.fn(),
    onEdit: testing.fn(),
  };

  const rendererOptions = {
    gmp: {settings: {manualUrl: 'test/'}},
  };

  test('should render and handle edit click', async () => {
    const handleEdit = testing.fn();
    const {render} = rendererWithTableBody(rendererOptions);
    render(<EditableSettingRow {...defaultProps} onEdit={handleEdit} />);

    const row = screen.getByRole('row');
    expect(row).toBeVisible();

    const editButton = within(row).getByTitle('Test Label');
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalled();
  });

  test('should not render edit icon when disableEditIcon is true', () => {
    const {render} = rendererWithTableBody(rendererOptions);
    render(<EditableSettingRow {...defaultProps} disableEditIcon={true} />);
    const row = screen.getByRole('row');
    expect(within(row).queryByTitle('Test Label')).toBeNull();
  });

  test('should render editComponent and error message in edit mode', () => {
    const errorMessage = 'Something went wrong';
    const {render} = rendererWithTableBody(rendererOptions);
    render(
      <EditableSettingRow
        {...defaultProps}
        errorMessage={errorMessage}
        isEditMode={true}
      />,
    );
    expect(screen.getByTestId('edit-input')).toBeVisible();
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  test('should call onSave and onCancel in edit mode', async () => {
    const handleSave = testing.fn(() => Promise.resolve());
    const handleCancel = testing.fn();
    const {render} = rendererWithTableBody(rendererOptions);
    render(
      <EditableSettingRow
        {...defaultProps}
        isEditMode={true}
        onCancel={handleCancel}
        onSave={handleSave}
      />,
    );
    const row = screen.getByRole('row');
    const saveButton = within(row).getByTitle('Save');
    const cancelButton = within(row).getByTitle('Cancel');

    fireEvent.click(saveButton);
    await wait();
    expect(handleSave).toHaveBeenCalled();

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalled();
  });

  test('should render viewComponent in view mode', () => {
    const {render} = rendererWithTableBody(rendererOptions);
    render(<EditableSettingRow {...defaultProps} isEditMode={false} />);
    expect(screen.getByTestId('view-span')).toBeInTheDocument();
  });
});
