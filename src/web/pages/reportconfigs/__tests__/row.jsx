/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';

import ReportConfig from 'gmp/models/reportconfig';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';

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
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
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

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={orphanEntity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
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

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Report Config owned by user');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    expect(icons[1]).toHaveAttribute('title', 'Move Report Config to trashcan');
    fireEvent.click(icons[1]);
    expect(handleReportConfigDelete).toHaveBeenCalledWith(entity);

    expect(icons[2]).toHaveAttribute('title', 'Edit Report Config');
    fireEvent.click(icons[2]);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(entity);

    expect(icons[3]).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(icons[3]);
    expect(handleReportConfigClone).toHaveBeenCalledWith(entity);

    expect(icons[4]).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(icons[4]);
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

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to move Report Config to trashcan denied',
    );

    fireEvent.click(icons[1]);
    expect(handleReportConfigEdit).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to edit Report Config denied',
    );

    fireEvent.click(icons[2]);
    expect(handleReportConfigClone).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to clone Report Config denied',
    );

    fireEvent.click(icons[3]);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[3]).toHaveAttribute('title', 'Export Report Config');
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

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'Report Config is still in use');

    fireEvent.click(icons[1]);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(config);
    expect(icons[1]).toHaveAttribute('title', 'Edit Report Config');

    fireEvent.click(icons[2]);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);
    expect(icons[2]).toHaveAttribute('title', 'Clone Report Config');

    fireEvent.click(icons[3]);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[3]).toHaveAttribute('title', 'Export Report Config');
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

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={config}
        onToggleDetailsClick={handleToggleDetailsClick}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[1]);
    expect(handleReportConfigDelete).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Report Config is not writable');

    fireEvent.click(icons[2]);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);
    expect(icons[2]).toHaveAttribute('title', 'Clone Report Config');

    fireEvent.click(icons[3]);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[3]).toHaveAttribute('title', 'Export Report Config');
  });

  console.warn = consoleError;
});
