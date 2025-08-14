/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ReportConfig from 'gmp/models/reportconfig';
import Row from 'web/pages/reportconfigs/Row';
import {setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = ReportConfig.fromElement({
  _id: '1234',
  name: 'foo',
  comment: 'bar',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  report_format: {
    _id: '4321',
    name: 'baz',
  },
});

const orphanEntity = ReportConfig.fromElement({
  _id: '1234',
  name: 'foo',
  comment: 'bar',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
  orphan: '1',
  report_format: {
    _id: '4321',
  },
});

describe('Report Config row tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Row
        entity={entity}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');
    expect(baseElement).toHaveTextContent('baz');
  });

  test('should render orphan', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Row
        entity={orphanEntity}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('Orphan');
    expect(baseElement).toHaveTextContent('(bar)');
    expect(baseElement).toHaveTextContent('4321');
  });

  test('should render observer icon', () => {
    const config = ReportConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      owner: {
        name: 'user',
      },
      permissions: {permission: [{name: 'everything'}]},
      report_format: {
        _id: '54321',
        name: 'baz',
      },
    });

    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const observerIcon = screen.getByTestId('observer-icon');
    expect(observerIcon).toHaveAttribute(
      'title',
      'Report Config owned by user',
    );
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={entity}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(entity, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Move Report Config to trashcan',
    );
    fireEvent.click(deleteIcon);
    expect(handleReportConfigDelete).toHaveBeenCalledWith(entity);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Report Config');
    fireEvent.click(editIcon);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(entity);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(cloneIcon);
    expect(handleReportConfigClone).toHaveBeenCalledWith(entity);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(exportIcon);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(entity);
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const config = ReportConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      report_format: {
        _id: '54321',
        name: 'baz',
      },
    });

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(config, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Report Config to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Report Config denied',
    );
    fireEvent.click(editIcon);
    expect(handleReportConfigEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Report Config denied',
    );
    fireEvent.click(cloneIcon);
    expect(handleReportConfigClone).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(exportIcon);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
  });

  test('should (not) call click handlers if scan config is in use', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const config = ReportConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '1',
      writable: '1',
      permissions: {permission: [{name: 'everything'}]},
      report_format: {
        _id: '54321',
        name: 'baz',
      },
    });

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(config, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Report Config is still in use',
    );
    fireEvent.click(deleteIcon);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Report Config');
    fireEvent.click(editIcon);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(config);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(cloneIcon);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(exportIcon);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
  });

  test('should (not) call click handlers if scan config is not writable', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const config = ReportConfig.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '0',
      permissions: {permission: [{name: 'everything'}]},
      report_format: {
        _id: '54321',
        name: 'baz',
      },
    });

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={config}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(config, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Report Config is not writable',
    );
    fireEvent.click(deleteIcon);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(cloneIcon);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Report Config is not writable');
    fireEvent.click(editIcon);
    expect(handleReportConfigEdit).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(exportIcon);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
  });
});
