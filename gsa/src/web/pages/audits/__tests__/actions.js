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
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import Actions from '../actions';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';

setLocale('en');

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_task']);

describe('Audit Actions tests', () => {
  // deactivate console.error for tests
  // to make it possible to test actions without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.new,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: caps});
    const {baseElement} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should call click handlers', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: true});

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);
    expect(icons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);
    expect(icons[2]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(icons[4]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStart).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    fireEvent.click(icons[4]);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers for stopped audit without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStart).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to resume audit denied',
    );

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    fireEvent.click(icons[4]);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers for running audit without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.running,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStop).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to stop audit denied',
    );

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    fireEvent.click(icons[4]);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.running,
      alterable: '0',
      in_use: true,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: true});

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStop).toHaveBeenCalledWith(audit);
    expect(icons[0]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Audit is still in use');

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(icons[4]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    // should not be called because the audit does not have a report yet
    fireEvent.click(icons[6]);
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Report download not available');
  });

  test('should call click handlers for stopped audit', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: true});

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);
    expect(icons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[1]);
    expect(handleAuditResume).toHaveBeenCalledWith(audit);
    expect(icons[1]).toHaveAttribute('title', 'Resume');

    fireEvent.click(icons[2]);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);
    expect(icons[2]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[3]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(icons[4]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[5]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should disable report download if grc format is not defined', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({capabilities: true});

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={false}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[6]);
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Report download not available');
    expect(icons[6]).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render schedule icon if task is scheduled', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      schedule: {
        _id: 'schedule1',
        name: 'schedule1',
        permissions: {permission: [{name: 'everything'}]},
      },
      usage_type: 'audit',
    });

    const handleAuditClone = jest.fn();
    const handleAuditDelete = jest.fn();
    const handleAuditDownload = jest.fn();
    const handleAuditEdit = jest.fn();
    const handleAuditResume = jest.fn();
    const handleAuditStart = jest.fn();
    const handleAuditStop = jest.fn();
    const handleReportDownload = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });

    const {getAllByTestId} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={false}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const detailslinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');

    fireEvent.click(detailslinks[0]);
    expect(detailslinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    fireEvent.click(icons[1]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Audit is scheduled');
  });

  console.warn = consoleError;
});
