/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  render,
  screen,
} from 'web/testing';
import Filter from 'gmp/models/filter';
import FilterSelectionDialog from 'web/components/dashboard/display/FilterSelectionDialog';

const filters = [
  new Filter({id: 'f-1', name: 'Filter One'}),
  new Filter({id: 'f-2', name: 'Filter Two'}),
] as Filter[];

const renderDialog = (props = {}) => {
  const onClose = testing.fn();
  const onSave = testing.fn();

  render(
    <FilterSelectionDialog
      filters={filters}
      onClose={onClose}
      onSave={onSave}
      {...props}
    />,
  );

  return {onClose, onSave};
};

describe('FilterSelectionDialog component tests', () => {
  test('should render the title, filter field, and filter options', async () => {
    renderDialog();

    expect(screen.getDialogTitle()).toHaveTextContent('Select Filter');
    expect(screen.getByText('Filter')).toBeVisible();

    const items = await getSelectItemElementsForSelect(
      screen.getSelectElement(),
    );
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('--');
    expect(items[1]).toHaveTextContent('Filter One');
    expect(items[2]).toHaveTextContent('Filter Two');
  });

  test('should use the provided filter as the initial value', () => {
    renderDialog({filterId: 'f-2'});

    expect(screen.getSelectElement()).toHaveValue('Filter Two');
  });

  test('should call onSave with the selected filter', async () => {
    const {onSave} = renderDialog({filterId: 'f-2'});
    const items = await getSelectItemElementsForSelect(
      screen.getSelectElement(),
    );

    fireEvent.click(items[1]);
    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({filterId: 'f-1'});
  });

  test('should call onClose when cancelled', () => {
    const {onClose} = renderDialog();

    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
