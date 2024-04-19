/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import ReportConfig from 'gmp/models/reportconfig';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

const config = ReportConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  report_format: {
    _id: '54321',
    name: 'baz',
  },
});

const config2 = ReportConfig.fromElement({
  _id: '123456',
  name: 'lorem',
  comment: 'ipsum',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  report_format: {
    _id: '654321',
    name: 'dolor',
  },
});

const config3 = ReportConfig.fromElement({
  _id: '1234567',
  name: 'hello',
  comment: 'world',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  report_format: {
    _id: '54321',
    name: 'baz',
  },
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 2,
});

const filter = Filter.fromString('rows=2');

describe('Scan Config table tests', () => {
  test('should render', () => {
    const handleReportConfigClone = vi.fn();
    const handleReportConfigDelete = vi.fn();
    const handleReportConfigDownload = vi.fn();
    const handleReportConfigEdit = vi.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        filter={filter}
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Report Format');
    expect(header[2]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleReportConfigClone = vi.fn();
    const handleReportConfigDelete = vi.fn();
    const handleReportConfigDownload = vi.fn();
    const handleReportConfigEdit = vi.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element, getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    expect(element).not.toHaveTextContent('Parameters');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Parameters');
  });

  test('should call click handlers', () => {
    const handleReportConfigClone = vi.fn();
    const handleReportConfigDelete = vi.fn();
    const handleReportConfigDownload = vi.fn();
    const handleReportConfigEdit = vi.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[5]).toHaveAttribute('title', 'Move Report Config to trashcan');
    fireEvent.click(icons[5]);
    expect(handleReportConfigDelete).toHaveBeenCalledWith(config);

    expect(icons[6]).toHaveAttribute('title', 'Edit Report Config');
    fireEvent.click(icons[6]);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(config);

    expect(icons[7]).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(icons[7]);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);

    expect(icons[8]).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(icons[8]);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
  });
});
