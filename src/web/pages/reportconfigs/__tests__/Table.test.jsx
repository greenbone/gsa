/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import ReportConfig from 'gmp/models/reportconfig';
import Table from 'web/pages/reportconfigs/Table';
import {setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen} from 'web/utils/Testing';

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
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

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
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Report Format');
    expect(header[2]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

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

    const {element} = render(
      <Table
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    expect(element).not.toHaveTextContent('Parameters');

    const unfoldIcon = screen.getByTestId('fold-state-icon-unfold');
    expect(unfoldIcon).toHaveAttribute('title', 'Unfold all details');
    fireEvent.click(unfoldIcon);
    expect(element).toHaveTextContent('Parameters');
  });

  test('should call click handlers', () => {
    const handleReportConfigClone = testing.fn();
    const handleReportConfigDelete = testing.fn();
    const handleReportConfigDownload = testing.fn();
    const handleReportConfigEdit = testing.fn();

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

    render(
      <Table
        entities={[config, config2, config3]}
        entitiesCounts={counts}
        filter={filter}
        onReportConfigCloneClick={handleReportConfigClone}
        onReportConfigDeleteClick={handleReportConfigDelete}
        onReportConfigDownloadClick={handleReportConfigDownload}
        onReportConfigEditClick={handleReportConfigEdit}
      />,
    );

    const deleteIcon = screen.getAllByTestId('trashcan-icon')[0];
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Move Report Config to trashcan',
    );
    fireEvent.click(deleteIcon);
    expect(handleReportConfigDelete).toHaveBeenCalledWith(config);

    const editIcon = screen.getAllByTestId('edit-icon')[0];
    expect(editIcon).toHaveAttribute('title', 'Edit Report Config');
    fireEvent.click(editIcon);
    expect(handleReportConfigEdit).toHaveBeenCalledWith(config);

    const cloneIcon = screen.getAllByTestId('clone-icon')[0];
    expect(cloneIcon).toHaveAttribute('title', 'Clone Report Config');
    fireEvent.click(cloneIcon);
    expect(handleReportConfigClone).toHaveBeenCalledWith(config);

    const exportIcon = screen.getAllByTestId('export-icon')[0];
    expect(exportIcon).toHaveAttribute('title', 'Export Report Config');
    fireEvent.click(exportIcon);
    expect(handleReportConfigDownload).toHaveBeenCalledWith(config);
  });
});
