/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  rendererWith,
  fireEvent,
  getSelectItemElementsForSelect,
  wait,
} from 'web/testing';
import Features from 'gmp/capabilities/features';
import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {OPENVASD_SCANNER_TYPE, scannerTypeName} from 'gmp/models/scanner';
import ScannerFilterDialog from 'web/pages/scanners/ScannerFilterDialog';

describe('ScannerFilterDialog tests', () => {
  test('should render the dialog with defaults', async () => {
    const gmp = {
      settings: {enableGreenboneSensor: true},
    };
    const {render} = rendererWith({
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
      gmp,
    });
    const filter = new Filter({
      terms: [
        new FilterTerm({keyword: 'first', value: '1', relation: '='}),
        new FilterTerm({keyword: 'rows', value: '20', relation: '='}),
        new FilterTerm({keyword: 'sort', value: 'name', relation: '='}),
      ],
    });
    render(<ScannerFilterDialog filter={filter} />);

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('Update Filter');
    expect(screen.getByName('filterString')).toHaveValue('');
    const select = screen.getByRole('textbox', {
      name: 'Scanner Type',
    }) as HTMLSelectElement;
    expect(select).toHaveValue('');
    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems).toHaveLength(5);
    expect(screen.getByName('first')).toHaveValue('1');
    expect(screen.getByName('rows')).toHaveValue('20');
    expect(screen.getByName('sort_by')).toHaveValue('name');
    const radio = screen.getRadioInputs();
    expect(radio[0]).toBeChecked;
    expect(radio[1]).not.toBeChecked();
  });

  test('should allow to create a new filter', async () => {
    const filter = new Filter({
      terms: [new FilterTerm({keyword: 'name', value: 'test'})],
    });
    const newFilter = new Filter({id: 'new-filter'});
    const newFilterWithDetails = newFilter.copy().set('rows', 10);
    const gmp = {
      settings: {enableGreenboneSensor: true},
      filter: {
        create: testing.fn().mockResolvedValue({data: newFilter}),
        get: testing.fn().mockReturnValue({data: newFilterWithDetails}),
      },
    };
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <ScannerFilterDialog
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
      type: 'scanner',
      name: 'New Task Filter',
    });
    expect(gmp.filter.get).toHaveBeenCalledWith({id: newFilter.id});
    expect(handleFilterChanged).not.toHaveBeenCalledWith();
    expect(handleClose).toHaveBeenCalled();
    expect(handleFilterCreated).toHaveBeenCalledWith(newFilterWithDetails);
  });

  test('should not render create named filter group if not allowed', () => {
    const filter = new Filter();
    const gmp = {
      settings: {enableGreenboneSensor: true},
      filter: {
        create: testing.fn().mockResolvedValue(new Filter()),
      },
    };
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const handleFilterCreated = testing.fn();
    const {render} = rendererWith({capabilities: false, gmp});

    render(
      <ScannerFilterDialog
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

  test('should render scanner type', () => {
    const gmp = {
      settings: {enableGreenboneSensor: true},
      filter: {},
    };
    const filter = new Filter({
      terms: [
        new FilterTerm({keyword: 'foo', value: 'bar', relation: '='}),
        new FilterTerm({
          keyword: 'type',
          value: OPENVASD_SCANNER_TYPE,
          relation: '=',
        }),
      ],
    });
    const {render} = rendererWith({
      capabilities: true,
      gmp,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(<ScannerFilterDialog filter={filter} />);

    expect(screen.getByName('filterString')).toHaveValue('foo=bar');
    const select = screen.getByRole('textbox', {
      name: 'Scanner Type',
    }) as HTMLSelectElement;
    expect(select).toHaveValue(scannerTypeName(OPENVASD_SCANNER_TYPE));
  });
});
