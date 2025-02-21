/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ScanConfig, {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent} from 'web/utils/Testing';

import Row from '../Row';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = ScanConfig.fromElement({
  _id: '1234',
  name: 'foo',
  comment: 'bar',
  in_use: '0',
  writable: '1',
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

describe('Scan Config row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute(
      'title',
      'The family selection is STATIC. New families will NOT automatically be added and considered.',
    );
    expect(icons[1]).toHaveAttribute(
      'title',
      'The NVT selection is DYNAMIC. New NVTs of selected families will automatically be added and considered.',
    );
  });

  test('should mark deprecated config', () => {
    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      deprecated: '1',
      owner: {
        name: 'user',
      },
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

    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    const {baseElement} = render(
      <Row
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toHaveTextContent('(Deprecated)');
  });

  test('should render observer icon', () => {
    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      owner: {
        name: 'user',
      },
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

    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Row
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Scan Config owned by user');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigSettings).toHaveBeenCalledWith(entity);
    expect(icons[2]).toHaveAttribute('title', 'Edit Scan Config settings');

    fireEvent.click(icons[3]);
    expect(handleScanConfigDelete).toHaveBeenCalledWith(entity);
    expect(icons[3]).toHaveAttribute('title', 'Move Scan Config to trashcan');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(entity);
    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(entity);
    expect(icons[5]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(entity);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
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
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to edit Scan Config settings denied',
    );

    fireEvent.click(icons[3]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    fireEvent.click(icons[5]);
    expect(handleScanConfigClone).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is in use', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '1',
      writable: '1',
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
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(icons[2]).toHaveAttribute('title', 'Edit Scan Config settings');

    fireEvent.click(icons[3]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Scan Config is still in use');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is not writable', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();

    const config = ScanConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '0',
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
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[2]);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(icons[2]).toHaveAttribute(
      'title',
      'Scan Config settings is not writable',
    );

    fireEvent.click(icons[3]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[5]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config');
  });

  console.warn = consoleError;
});
