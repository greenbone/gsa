/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import ScanConfig, {
  OPENVAS_SCAN_CONFIG_TYPE,
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

const config = ScanConfig.fromObject({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  type: OPENVAS_SCAN_CONFIG_TYPE,
  permissions: [{name: 'everything'}],
  familyCount: 2,
  familyGrowing: SCANCONFIG_TREND_STATIC,
  nvtCount: 4,
  nvtGrowing: SCANCONFIG_TREND_DYNAMIC,
});

const config2 = ScanConfig.fromObject({
  id: '123456',
  name: 'lorem',
  comment: 'ipsum',
  owner: 'admin',
  type: OPENVAS_SCAN_CONFIG_TYPE,
  permissions: [{name: 'everything'}],
  familyCount: 3,
  familyGrowing: SCANCONFIG_TREND_STATIC,
  nvtCount: 5,
  nvtGrowing: SCANCONFIG_TREND_DYNAMIC,
});

const config3 = ScanConfig.fromObject({
  id: '1234567',
  name: 'hello',
  comment: 'world',
  owner: 'admin',
  type: OPENVAS_SCAN_CONFIG_TYPE,
  permissions: [{name: 'everything'}],
  familyCount: 1,
  familyGrowing: SCANCONFIG_TREND_STATIC,
  nvtCount: 1,
  nvtGrowing: SCANCONFIG_TREND_DYNAMIC,
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
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        filter={filter}
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Type');
    expect(header[2]).toHaveTextContent('Family');
    expect(header[3]).toHaveTextContent('NVTs');
    expect(header[4]).toHaveTextContent('Actions');
    expect(header[5]).toHaveTextContent('Total');
    expect(header[6]).toHaveTextContent('Trend');
    expect(header[7]).toHaveTextContent('Total');
    expect(header[8]).toHaveTextContent('Trend');
  });

  test('should unfold all details', () => {
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

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
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    expect(element).not.toHaveTextContent('Comment');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Comment');
  });

  test('should call click handlers', () => {
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

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
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[7]);
    expect(handleScanConfigDelete).toHaveBeenCalledWith(config);
    expect(icons[7]).toHaveAttribute('title', 'Move Scan Config to trashcan');

    fireEvent.click(icons[8]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(icons[8]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[9]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[9]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[10]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[10]).toHaveAttribute('title', 'Export Scan Config');
  });
});
