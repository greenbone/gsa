/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import UsersHeader from 'web/pages/users/UsersTableHeader';
import SelectionType from 'web/utils/selection-type';

describe('UsersHeader', () => {
  test('should render all user list columns with actions column', () => {
    const onSortChange = testing.fn();
    const {render} = rendererWith();

    render(
      <table>
        <UsersHeader
          currentSortBy="name"
          currentSortDir="asc"
          selectionType={SelectionType.SELECTION_USER}
          onSortChange={onSortChange}
        />
      </table>,
    );

    screen.getByTestId('table-header-sort-by-name');
    screen.getByTestId('table-header-sort-by-roles');
    screen.getByTestId('table-header-sort-by-groups');
    screen.getByTestId('table-header-sort-by-host_access');
    screen.getByTestId('table-header-sort-by-ldap');
    screen.getByRole('columnheader', {name: 'Actions'});
  });

  test('should disable sorting when sort is false', () => {
    const {render} = rendererWith();
    render(
      <table>
        <UsersHeader
          selectionType={SelectionType.SELECTION_USER}
          sort={false}
          onSortChange={testing.fn()}
        />
      </table>,
    );

    expect(screen.queryByTestId('table-header-sort-by-name')).toBeNull();
    expect(screen.queryByTestId('table-header-sort-by-roles')).toBeNull();
  });
});
