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
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import ScanConfig, {
  OPENVAS_SCAN_CONFIG_TYPE,
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';

import {editableConfig} from 'web/graphql/__mocks__/scanconfigs';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, wait} from 'web/utils/testing';

import Row from '../row';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = ScanConfig.fromObject(editableConfig);

describe('Scan Config row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', async () => {
    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    await wait();

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Half empty and slow');
    expect(baseElement).toHaveTextContent("(Most NVT's)");
    expect(baseElement).toHaveTextContent('OpenVAS');

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Scan Config owned by admin');
    expect(icons[1]).toHaveAttribute(
      'title',
      'The family selection is DYNAMIC. New families will automatically be added and considered.',
    );
    expect(icons[2]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs of selected families will NOT automatically be added and considered.',
    );
  });

  test('should render observer icon', () => {
    const config = ScanConfig.fromObject({
      id: '1234',
      name: 'foo',
      comment: 'bar',
      inUse: false,
      writable: true,
      owner: 'user',
      type: OPENVAS_SCAN_CONFIG_TYPE,
      permissions: [{name: 'Everything'}],
      familyCount: 2,
      familoyGrowing: SCANCONFIG_TREND_STATIC,
      nvtCount: 4,
      nvtGrowing: SCANCONFIG_TREND_DYNAMIC,
    });

    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Scan Config owned by user');
  });

  test('should call click handlers', async () => {
    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Scan Config owned by admin');

    expect(icons[1]).toHaveAttribute(
      'title',
      'The family selection is DYNAMIC. New families will automatically be added and considered.',
    );

    expect(icons[2]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs of selected families will NOT automatically be added and considered.',
    );

    expect(icons[3]).toHaveAttribute('title', 'Move Scan Config to trashcan');
    fireEvent.click(icons[3]);

    await wait();

    expect(handleScanConfigDelete).toHaveBeenCalledWith(entity);

    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');
    fireEvent.click(icons[4]);

    await wait();

    expect(handleScanConfigEdit).toHaveBeenCalledWith(entity);

    expect(icons[5]).toHaveAttribute('title', 'Clone Scan Config');
    fireEvent.click(icons[5]);

    await wait();

    expect(handleScanConfigClone).toHaveBeenCalledWith(entity);

    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config');
    fireEvent.click(icons[6]);

    await wait();

    expect(handleScanConfigDownload).toHaveBeenCalledWith(entity);
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      type: OPENVAS_SCAN_CONFIG_TYPE,
      family_count: {
        __text: 2,
        growing: SCANCONFIG_TREND_STATIC,
      },
      nvt_count: {
        __text: 4,
        growing: SCANCONFIG_TREND_DYNAMIC,
      },
    });

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    fireEvent.click(icons[4]);
    expect(handleScanConfigClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    fireEvent.click(icons[5]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is in use', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '1',
      writable: '1',
      type: OPENVAS_SCAN_CONFIG_TYPE,
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

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Scan Config is still in use');

    fireEvent.click(icons[3]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(icons[3]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[4]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[4]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is not writable', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '0',
      type: OPENVAS_SCAN_CONFIG_TYPE,
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

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[3]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[4]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[4]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Export Scan Config');
  });

  console.warn = consoleError;
});
