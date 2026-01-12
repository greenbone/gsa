/* SPDX-FileCopyrightText: 2026 Greenbone AG
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
import ContainerImageTargetFilterDialog from 'web/pages/container-image-targets/ContainerImageTargetFilterDialog';

describe('ContainerImageTargetFilterDialog tests', () => {
  test('should render dialog with default fields', () => {
    const filter = new Filter();
    const gmp = {filter: {}};
    const {render} = rendererWith({capabilities: true, gmp});
    render(<ContainerImageTargetFilterDialog filter={filter} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Credential')).toBeInTheDocument();
  });

  test('should call onClose when dialog is closed', () => {
    const handleClose = testing.fn();
    const gmp = {filter: {}};
    const {render} = rendererWith({capabilities: true, gmp});
    render(<ContainerImageTargetFilterDialog onClose={handleClose} />);
    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should call onFilterChanged when filter is updated', () => {
    const filter = new Filter();
    const handleFilterChanged = testing.fn();
    const gmp = {filter: {}};
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <ContainerImageTargetFilterDialog
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
    const newFilter = new Filter({
      id: 'new-filter-id',
      name: 'New Filter',
      filter_type: 'target',
    });
    const gmp = {
      filter: {
        create: testing
          .fn()
          .mockResolvedValue({data: {id: 'new-filter-id', name: 'New Filter'}}),
        get: testing.fn().mockResolvedValue({data: newFilter}),
      },
    };
    const handleFilterCreated = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <ContainerImageTargetFilterDialog
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
      type: 'target',
      name: 'My New Filter',
    });
    await wait();
    expect(gmp.filter.get).toHaveBeenCalledWith({id: 'new-filter-id'});
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilter);
  });
});
