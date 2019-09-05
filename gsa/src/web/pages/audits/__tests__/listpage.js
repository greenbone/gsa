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
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';

import {setUsername} from 'web/store/usersettings/actions';

import {entitiesActions} from 'web/store/entities/audits';
import {rendererWith, fireEvent} from 'web/utils/testing';

import AuditPage, {ToolBarIcons} from '../listpage';

const audit = new Audit({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: AUDIT_STATUS.new,
  alterable: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
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

const getAudits = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [audit],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getReportFormats = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

describe('AuditPage tests', () => {
  test('should render full AuditPage', () => {
    const gmp = {
      audits: {
        get: getAudits,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
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
      entitiesActions.success([audit], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<AuditPage />);

    expect(baseElement).toMatchSnapshot();
  });
});

describe('AuditPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAuditCreateClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={audit}
        onAuditCreateClick={handleAuditCreateClick}
      />,
    );
    expect(element).toMatchSnapshot();
  });

  test('should call click handlers', () => {
    const handleAuditCreateClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={audit}
        onAuditCreateClick={handleAuditCreateClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditCreateClick).toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'New Audit');
  });

  test('should not call click handlers without permission', () => {
    const handleAuditCreateClick = jest.fn();

    const {render} = rendererWith({
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons onAuditCreateClick={handleAuditCreateClick} />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(0);
  });
});
