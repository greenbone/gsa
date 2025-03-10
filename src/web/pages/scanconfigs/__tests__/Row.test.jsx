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
import Row from 'web/pages/scanconfigs/Row';
import {setUsername} from 'web/store/usersettings/actions';
import {rendererWithTable, fireEvent, screen} from 'web/utils/Testing';

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
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    const {element} = render(
      <Row
        entity={entity}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).toBeVisible();
    expect(element).toHaveTextContent('foo');
    expect(screen.getByTestId('comment')).toHaveTextContent('(bar)');

    expect(screen.getByTestId('trend-nochange-icon')).toHaveAttribute(
      'title',
      'The family selection is STATIC. New families will NOT automatically be added and considered.',
    );
    expect(screen.getByTestId('trend-more-icon')).toHaveAttribute(
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
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    const {element} = render(
      <Row
        entity={config}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).toHaveTextContent('(Deprecated)');
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
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const observerIcon = screen.getByTestId('observer-icon');
    expect(observerIcon).toHaveAttribute('title', 'Scan Config owned by user');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={entity}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const settingsIcon = screen.getByTestId('settings-2-icon');
    fireEvent.click(settingsIcon);
    expect(handleScanConfigSettings).toHaveBeenCalledWith(entity);
    expect(settingsIcon).toHaveAttribute('title', 'Edit Scan Config settings');

    const trashcanIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(trashcanIcon);
    expect(handleScanConfigDelete).toHaveBeenCalledWith(entity);
    expect(trashcanIcon).toHaveAttribute(
      'title',
      'Move Scan Config to trashcan',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(entity);
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(entity);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(entity);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

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

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const settingsIcon = screen.getByTestId('settings-2-icon');
    fireEvent.click(settingsIcon);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(settingsIcon).toHaveAttribute(
      'title',
      'Permission to edit Scan Config settings denied',
    );

    const trashcanIcon = screen.getByTestId('trashcan-icon');
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(trashcanIcon).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is in use', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

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

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigSettingsClick={handleScanConfigSettings}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const settingsIcon = screen.getByTestId('settings-2-icon');
    fireEvent.click(settingsIcon);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(settingsIcon).toHaveAttribute('title', 'Edit Scan Config settings');

    const trashcanIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(trashcanIcon);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(trashcanIcon).toHaveAttribute(
      'title',
      'Scan Config is still in use',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config');
  });

  test('should (not) call click handlers if scan config is not writable', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigSettings = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

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

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        openEditNvtDetailsDialog={handleOpenEditNvtDetailsDialog}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const settingsIcon = screen.getByTestId('settings-2-icon');
    fireEvent.click(settingsIcon);
    expect(handleScanConfigSettings).not.toHaveBeenCalledWith(entity);
    expect(settingsIcon).toHaveAttribute(
      'title',
      'Scan Config settings is not writable',
    );

    const trashcanIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(trashcanIcon);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(trashcanIcon).toHaveAttribute(
      'title',
      'Scan Config is not writable',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config');
  });
});
