/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {setUsername} from 'web/store/usersettings/actions';

import {entitiesActions} from 'web/store/entities/audits';
import {rendererWith, fireEvent} from 'web/utils/testing';

import PoliciesPage, {ToolBarIcons} from '../listpage';

const policy = new Policy({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  usage_type: 'policy',
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [{id: '1234', name: 'audit1'}, {id: '5678', name: 'audit2'}],
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = jest.fn().mockReturnValue(
  Promise.resolve({
    foo: 'bar',
  }),
);

const getFilters = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getPolicies = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [policy],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

describe('PoliciesPage tests', () => {
  test('should render full PoliciesPage', () => {
    const gmp = {
      policies: {
        get: getPolicies,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesActions.success([policy], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<PoliciesPage />);

    expect(baseElement).toMatchSnapshot();
  });
});

describe('PoliciesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={policy}
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );
    expect(element).toMatchSnapshot();
  });

  test('should call click handlers', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={policy}
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handlePolicyCreateClick).toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'New Policy');

    fireEvent.click(icons[1]);
    expect(handlePolicyImportClick).toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Import Policy');
  });

  test('should not call click handlers without permission', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();

    const {render} = rendererWith({
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(0);
  });
});
