/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import ScanConfig, {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

const config = ScanConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  family_count: {
    __text: 2,
    growing: SCANCONFIG_TREND_STATIC,
  },
  nvt_count: {
    __text: 4,
    growing: SCANCONFIG_TREND_DYNAMIC,
  },
});

const config2 = ScanConfig.fromElement({
  _id: '123456',
  name: 'lorem',
  comment: 'ipsum',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  family_count: {
    __text: 3,
    growing: SCANCONFIG_TREND_STATIC,
  },
  nvt_count: {
    __text: 5,
    growing: SCANCONFIG_TREND_DYNAMIC,
  },
});

const config3 = ScanConfig.fromElement({
  _id: '1234567',
  name: 'hello',
  comment: 'world',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  family_count: {
    __text: 1,
    growing: SCANCONFIG_TREND_STATIC,
  },
  nvt_count: {
    __text: 1,
    growing: SCANCONFIG_TREND_DYNAMIC,
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
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

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
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    expect(baseElement).toBeVisible();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Family');
    expect(header[2]).toHaveTextContent('NVTs');
    expect(header[3]).toHaveTextContent('Actions');
    expect(header[4]).toHaveTextContent('Total');
    expect(header[5]).toHaveTextContent('Trend');
    expect(header[6]).toHaveTextContent('Total');
    expect(header[7]).toHaveTextContent('Trend');
  });

  test('should unfold all details', () => {
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

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
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
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
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

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
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
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
