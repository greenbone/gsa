/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, rendererWith, screen} from 'web/testing';
import Filter from 'gmp/models/filter';
import AgentInstallersFilterDialog from 'web/pages/agent-installers/AgentInstallerFilterDialog';

describe('AgentInstallersFilterDialog tests', () => {
  test('renders default filter dialog with sort fields', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentInstallersFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    expect(screen.getByName('filter')).toBeInTheDocument();
    expect(screen.getByName('first')).toHaveValue('1');
    expect(screen.getByName('rows')).toHaveValue('10');

    expect(screen.getByTestId('sort-by')).toBeInTheDocument();
    expect(screen.getByTestId('sort-by')).toHaveValue('Name');
  });

  test('calls onFilterChanged when saving modified filter', async () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentInstallersFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'name~Test');

    const applyButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(applyButton);

    expect(onFilterChanged).toHaveBeenCalled();
  });

  test('calls onClose when cancel is clicked', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentInstallersFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    const cancelButton = screen.getByTestId('dialog-close-button');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('renders sort fields correctly', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentInstallersFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    const sortBySelect = screen.getByTestId('sort-by');
    fireEvent.click(sortBySelect);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
  });
});
