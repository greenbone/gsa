/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  rendererWith,
  screen,
  waitFor,
} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import UserFilterDialog from 'web/pages/users/UserFilterDialog';

const newFilter = new QueryFilter({
  id: 'new-filter-id',
  name: 'New Filter',
});

const gmp = {
  filter: {
    create: testing.fn().mockResolvedValue({
      data: {id: 'new-filter-id', name: 'New Filter'},
    }),
    get: testing.fn().mockResolvedValue({
      data: newFilter,
    }),
  },
};

describe('UserFilterDialog', () => {
  test('should render users sort fields', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<UserFilterDialog filter={new QueryFilter()} />);

    screen.getByText('Name');
    screen.getByText('Roles');
    screen.getByText('Groups');
    screen.getByText('Host Access');
    screen.getByText('Authentication Type');
  });

  test('should call onFilterChanged when updating filter', () => {
    const handleFilterChanged = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <UserFilterDialog
        filter={new QueryFilter()}
        onFilterChanged={handleFilterChanged}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'foo=bar');
    fireEvent.click(screen.getDialogSaveButton());

    expect(handleFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('foo=bar'),
    );
  });

  test('should call onFilterCreated when saving named filter', async () => {
    const handleFilterCreated = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <UserFilterDialog
        filter={new QueryFilter()}
        onFilterCreated={handleFilterCreated}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'foo=bar');

    const saveNamedFilterCheckbox = screen.getByRole('checkbox', {
      name: 'Store filter as:',
    });
    fireEvent.click(saveNamedFilterCheckbox);
    const filterNameInput = screen.getByName('filterName');
    changeInputValue(filterNameInput, 'My New User Filter');
    fireEvent.click(screen.getDialogSaveButton());

    await waitFor(() => {
      expect(gmp.filter.create).toHaveBeenCalledWith({
        term: 'foo=bar',
        type: 'user',
        name: 'My New User Filter',
      });
    });
    await waitFor(() => {
      expect(gmp.filter.get).toHaveBeenCalledWith({id: 'new-filter-id'});
    });
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilter);
  });
});
