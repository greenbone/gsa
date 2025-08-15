/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  rendererWith,
  screen,
  wait,
} from 'web/testing';
import Filter from 'gmp/models/filter';
import PortListsFilterDialog from 'web/pages/portlists/PortListFilterDialog';

const newFilter = new Filter({
  id: 'new-filter-id',
  name: 'New Filter',
  filter_type: 'port_list',
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

describe('PortListsFilterDialog tests', () => {
  test('should render dialog', () => {
    const filter = new Filter();
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListsFilterDialog filter={filter} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Port Counts: Total')).toBeInTheDocument();
    expect(screen.getByText('Port Counts: TCP')).toBeInTheDocument();
    expect(screen.getByText('Port Counts: UDP')).toBeInTheDocument();
  });

  test('should call onClose when the dialog is closed', async () => {
    const handleClose = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListsFilterDialog onClose={handleClose} />);

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should call onFilterChanged when a filter is updated', async () => {
    const filter = new Filter();
    const {render} = rendererWith({capabilities: true, gmp});
    const handleFilterChanged = testing.fn();
    render(
      <PortListsFilterDialog
        filter={filter}
        onFilterChanged={handleFilterChanged}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'foo=bar');
    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleFilterChanged).toHaveBeenCalledWith(
      Filter.fromString('foo=bar'),
    );
  });

  test('should call onFilterCreated when a new filter is saved', async () => {
    const filter = new Filter();
    const {render} = rendererWith({capabilities: true, gmp});
    const handleFilterCreated = testing.fn();
    render(
      <PortListsFilterDialog
        filter={filter}
        onFilterCreated={handleFilterCreated}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'foo=bar');

    const saveNamedFilterCheckbox = screen.getByRole('checkbox', {
      name: /store filter as/i,
    });
    fireEvent.click(saveNamedFilterCheckbox);
    expect(saveNamedFilterCheckbox).toBeChecked();

    const filterNameInput = screen.getByName('filterName');
    changeInputValue(filterNameInput, 'My New Filter');
    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(gmp.filter.create).toHaveBeenCalledWith({
      term: 'foo=bar',
      type: 'port_list',
      name: 'My New Filter',
    });
    await wait();
    expect(gmp.filter.get).toHaveBeenCalledWith({id: 'new-filter-id'});
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilter);
  });
});
