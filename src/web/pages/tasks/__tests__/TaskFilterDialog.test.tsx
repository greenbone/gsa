/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import TaskFilterDialog from 'web/pages/tasks/TaskFilterDialog';

describe('TaskFilterDialog tests', () => {
  test('should render filter dialog', () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const gmp = {
      filter: {},
    };
    const filter = new Filter();
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <TaskFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
        onFilterCreated={handleFilterCreated}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should create a new filter', async () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const filter = new Filter({
      terms: [new FilterTerm({keyword: 'name', value: 'test'})],
    });
    const newFilter = new Filter({id: 'new-filter'});
    const newFilterWithDetails = newFilter.copy().set('rows', 10);
    const gmp = {
      filter: {
        create: testing.fn().mockResolvedValue({data: newFilter}),
        get: testing.fn().mockReturnValue({data: newFilterWithDetails}),
      },
    };
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <TaskFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
        onFilterCreated={handleFilterCreated}
      />,
    );

    const checkbox = screen.getByTestId('createnamedfiltergroup-checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const nameInput = screen.getByName('filterName');
    changeInputValue(nameInput, 'New Task Filter');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    await wait();

    expect(gmp.filter.create).toHaveBeenCalledWith({
      term: filter.toFilterString(),
      type: 'task',
      name: 'New Task Filter',
    });
    expect(gmp.filter.get).toHaveBeenCalledWith(newFilter);
    expect(handleFilterChanged).not.toHaveBeenCalledWith();
    expect(handleClose).toHaveBeenCalled();
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilterWithDetails);
  });

  test('should not render create named filter group if not allowed', () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const filter = new Filter();
    const gmp = {
      filter: {
        create: testing.fn().mockResolvedValue(new Filter()),
      },
    };
    const {render} = rendererWith({capabilities: new Capabilities(), gmp});

    render(
      <TaskFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
        onFilterCreated={handleFilterCreated}
      />,
    );

    expect(
      screen.queryByTestId('createnamedfiltergroup-checkbox'),
    ).not.toBeInTheDocument();
  });

  test('should render filter string', () => {
    const filter = new Filter({
      terms: [new FilterTerm({keyword: 'foo', value: 'bar', relation: '='})],
    });
    const gmp = {
      filter: {},
    };
    const {render} = rendererWith({capabilities: true, gmp});

    render(<TaskFilterDialog filter={filter} />);
    expect(screen.getByName('filter_string')).toHaveValue('foo=bar');
  });
});
