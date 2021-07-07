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

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

setLocale('en');

const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-08-10T12:51:27Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const lastReport2 = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const currentReport = {
  report: {
    _id: '5678',
    timestamp: '2019-07-10T12:51:27Z',
  },
};

const audit = Audit.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
});

const audit2 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'user'},
  name: 'lorem',
  comment: 'ipsum',
  status: AUDIT_STATUS.new,
  alterable: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const audit3 = Audit.fromElement({
  _id: '123456',
  owner: {name: 'user'},
  name: 'hello',
  comment: 'world',
  status: AUDIT_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport2,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 2,
});

const filter = Filter.fromString('rows=2');

describe('Audits table tests', () => {
  test('should render', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleReportDownloadClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        filter={filter}
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onAuditResumeClick={handleAuditResumeClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Report');
    expect(header[3]).toHaveTextContent('Compliance Status');
    expect(header[4]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleReportDownloadClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element, getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onAuditResumeClick={handleAuditResumeClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    expect(element).not.toHaveTextContent('target1');
    expect(element).not.toHaveTextContent('target2');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('target1');
    expect(element).toHaveTextContent('target2');
  });

  test('should call click handlers', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleReportDownloadClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onAuditResumeClick={handleAuditResumeClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[5]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[6]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[7]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit);
    expect(icons[7]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[8]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit);
    expect(icons[8]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[9]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit);
    expect(icons[9]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[10]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit);
    expect(icons[10]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[11]);
    expect(handleReportDownloadClick).toHaveBeenCalledWith(audit);
    expect(icons[11]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });
});
