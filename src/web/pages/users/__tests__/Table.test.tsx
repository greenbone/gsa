/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import UsersTable from 'web/pages/users/Table';

const user = User.fromElement({
  _id: '1234',
  comment: 'test comment',
  name: 'user 1',
  role: {_id: 'role1', name: 'Admin'},
  groups: {
    group: [{_id: 'group1', name: 'Group 1'}],
  },
  hosts: {
    __text: '192.168.1.1',
    _allow: '0',
  },
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 10,
});

const filter = QueryFilter.fromString('rows=10 first=1');

const gmp = {
  session: createSession({username: 'admin'}),
};

describe('UsersTable', () => {
  test('should render table with actions column by default', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <UsersTable entities={[user]} entitiesCounts={counts} filter={filter} />,
    );

    const table = screen.getByRole('table');
    within(table).getByRole('columnheader', {name: 'Actions'});
  });

  test('should render empty state without entities', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <UsersTable entities={[]} entitiesCounts={counts} filter={filter} />,
    );

    screen.getByText('No Users available');
  });
});
