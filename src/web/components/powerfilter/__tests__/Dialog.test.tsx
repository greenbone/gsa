/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  rendererWith,
  fireEvent,
  changeInputValue,
  openSelectElement,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import DefaultFilterDialog from 'web/components/powerfilter/Dialog';

describe('DefaultFilterDialog tests', () => {
  test('should render with children', () => {
    const {render} = rendererWith({capabilities: true});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[{name: 'name', displayName: 'Name'}]}
      />,
    );
    expect(screen.getByName('filter')).toHaveValue('foo=bar');
    expect(screen.getByName('first')).toHaveValue('45');
    expect(screen.getByName('rows')).toHaveValue('100');
    expect(screen.getByName('sort_order')).toBeChecked();
    expect(screen.getByTestId('sort-by')).toHaveValue('Name');
    expect(screen.getByName('filterName')).toHaveValue('foo');
    expect(screen.getByName('saveNamedFilter')).toBeChecked();
  });

  test("should not render save named filter if capabilities don't allow it", () => {
    const {render} = rendererWith({capabilities: new Capabilities()});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[{name: 'name', displayName: 'Name'}]}
      />,
    );
    expect(screen.getByName('filter')).toHaveValue('foo=bar');
    expect(screen.getByName('first')).toHaveValue('45');
    expect(screen.getByName('rows')).toHaveValue('100');
    expect(screen.getByName('sort_order')).toBeChecked();
    expect(screen.getByTestId('sort-by')).toHaveValue('Name');
    expect(screen.queryByName('filterName')).not.toBeInTheDocument();
    expect(screen.queryByName('saveNamedFilter')).not.toBeInTheDocument();
  });

  test('should allow to change filter to save', () => {
    const {render} = rendererWith({capabilities: true});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    const handleValueChange = testing.fn();
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[{name: 'name', displayName: 'Name'}]}
        onValueChange={handleValueChange}
      />,
    );
    expect(screen.getByName('filterName')).toHaveValue('foo');
    expect(screen.getByName('saveNamedFilter')).toBeChecked();

    changeInputValue(screen.getByName('filterName'), 'newFilter');
    expect(handleValueChange).toHaveBeenCalledWith('newFilter', 'filterName');
  });

  test('should allow to change filter string', () => {
    const {render} = rendererWith({capabilities: true});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    const handleFilterStringChange = testing.fn();
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[{name: 'name', displayName: 'Name'}]}
        onFilterStringChange={handleFilterStringChange}
      />,
    );
    expect(screen.getByName('filter')).toHaveValue('foo=bar');

    changeInputValue(screen.getByName('filter'), 'newFilterString');
    expect(handleFilterStringChange).toHaveBeenCalledWith(
      'newFilterString',
      'filter',
    );
  });

  test('should allow to change filter value', () => {
    const {render} = rendererWith({capabilities: true});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    const handleValueChange = testing.fn();
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[{name: 'name', displayName: 'Name'}]}
        onFilterValueChange={handleValueChange}
      />,
    );
    expect(screen.getByName('first')).toHaveValue('45');

    changeInputValue(screen.getByName('first'), '50');
    expect(handleValueChange).toHaveBeenCalledWith(50, 'first');

    changeInputValue(screen.getByName('rows'), '200');
    expect(handleValueChange).toHaveBeenCalledWith(200, 'rows');
  });

  test('should allow to change sort by field', async () => {
    const {render} = rendererWith({capabilities: true});
    const filter = Filter.fromString('first=45 rows=100 sort=name');
    const handleSortByChange = testing.fn();
    render(
      <DefaultFilterDialog
        filter={filter}
        filterName="foo"
        filterstring="foo=bar"
        saveNamedFilter={true}
        sortFields={[
          {name: 'name', displayName: 'Name'},
          {name: 'severity', displayName: 'Severity'},
        ]}
        onSortByChange={handleSortByChange}
      />,
    );
    expect(screen.getByTestId('sort-by')).toHaveValue('Name');
    const select = screen.getByTestId<HTMLSelectElement>('sort-by');
    await openSelectElement(select);

    const selectElements = screen.getSelectItemElements();
    expect(selectElements.length).toEqual(2);
    fireEvent.click(selectElements[1]);
    expect(handleSortByChange).toHaveBeenCalledWith('severity', 'sort_by');
  });
});
