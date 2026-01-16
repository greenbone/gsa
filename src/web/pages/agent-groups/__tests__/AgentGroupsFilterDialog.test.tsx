/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, rendererWith, screen} from 'web/testing';
import Filter from 'gmp/models/filter';
import AgentGroupsFilterDialog from 'web/pages/agent-groups/AgentGroupsFilterDialog';

describe('AgentGroupsFilterDialog tests', () => {
  test('renders default filter dialog with sort fields', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentGroupsFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    // default filter inputs
    expect(screen.getByName('filter')).toBeInTheDocument();
    expect(screen.getByName('first')).toHaveValue('1');
    expect(screen.getByName('rows')).toHaveValue('10');

    // sort-by select (Group Name should be present)
    expect(screen.getByTestId('sort-by')).toBeInTheDocument();
    expect(screen.getByTestId('sort-by')).toHaveValue('Group Name');
  });

  test('calls onFilterChanged when saving modified filter', async () => {
    const filter = Filter.fromString('first=1 rows=10 sort=name');

    const onClose = testing.fn();
    const onFilterChanged = testing.fn();

    const gmp = {filter: {create: testing.fn(), get: testing.fn()}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentGroupsFilterDialog
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
      />,
    );

    // change filter string
    changeInputValue(screen.getByName('filter'), 'name=foo');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    // onFilterChanged should be called synchronously
    expect(onFilterChanged).toHaveBeenCalled();
  });
});
