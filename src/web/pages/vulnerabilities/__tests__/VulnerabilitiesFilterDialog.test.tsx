/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';

import VulnerabilityFilterDialog from 'web/pages/vulnerabilities/VulnerabilitiesFilterDialog';

const createGmp = ({
  filterCreate = testing.fn(),
  filterGet = testing.fn(),
} = {}) => ({
  filter: {
    create: filterCreate,
    get: filterGet,
  },
});

describe('VulnerabilityFilterDialog tests', () => {
  test('should render filter dialog', () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const gmp = createGmp();
    const filter = new QueryFilter();
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <VulnerabilityFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
        onFilterCreated={handleFilterCreated}
      />,
    );

    screen.getDialog();
  });

  test('should create a new filter', async () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const filter = new Filter({
      id: 'test-id',
      terms: [new FilterTerm({keyword: 'name', value: 'test'})],
    });
    const newFilter = new Filter({id: 'new-filter'});
    const newFilterWithDetails = newFilter.set('rows', 10);
    const gmp = createGmp({
      filterCreate: testing.fn().mockResolvedValue({data: newFilter}),
      filterGet: testing.fn().mockReturnValue({data: newFilterWithDetails}),
    });
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <VulnerabilityFilterDialog
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
    fireEvent.change(nameInput, {target: {value: 'New Vuln Filter'}});

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    await wait();

    expect(gmp.filter.create).toHaveBeenCalledWith({
      term: filter.toFilterString(),
      type: 'vulnerability',
      name: 'New Vuln Filter',
    });
    expect(gmp.filter.get).toHaveBeenCalledWith({id: newFilter.id});
    expect(handleFilterChanged).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilterWithDetails);
  });

  test('should not render create named filter group if not allowed', () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const filter = new QueryFilter();
    const gmp = createGmp({
      filterCreate: testing
        .fn()
        .mockResolvedValue(new Filter({id: 'new-filter'})),
    });
    const {render} = rendererWith({capabilities: new Capabilities(), gmp});

    render(
      <VulnerabilityFilterDialog
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
    const filter = new QueryFilter({
      terms: [new FilterTerm({keyword: 'foo', value: 'bar', relation: '='})],
    });
    const gmp = createGmp();
    const {render} = rendererWith({capabilities: true, gmp});

    render(<VulnerabilityFilterDialog filter={filter} />);
    expect(screen.getByName('filterString')).toHaveValue('foo=bar');
  });
});
