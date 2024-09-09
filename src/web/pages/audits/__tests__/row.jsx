/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-console */
import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';

import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {screen, rendererWith, fireEvent} from 'web/utils/testing';

import {getActionItems} from 'web/components/testing';

import Row from '../row';

const gmp = {settings: {}};
const featureList = [
  {name: 'COMPLIANCE_REPORTS', _enabled: 0},
];
const caps = new Capabilities(['everything'], featureList);

const lastReport = {
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

describe('Audit Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {element} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).toBeVisible();

    // Name
    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('(bar)');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const icons = getActionItems();

    expect(icons[0]).toHaveAttribute('title', 'Start');
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');
    expect(icons[2]).toHaveAttribute('title', 'Move Audit to trashcan');
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');
    expect(icons[4]).toHaveAttribute('title', 'Clone Audit');
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should render icons', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.new,
      alterable: '1',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      scanner: {
        _id: 'id',
        name: 'scanner',
        type: GREENBONE_SENSOR_SCANNER_TYPE,
      },
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const icons = getActionItems();

    expect(icons[0]).toHaveAttribute('title', 'Audit is alterable');
    expect(icons[1]).toHaveAttribute(
      'title',
      'Audit is configured to run on sensor scanner',
    );
    expect(icons[2]).toHaveAttribute(
      'title',
      'Audit made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor',
    );
  });

  test('should call click handlers for new audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.new,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId, queryAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.new);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.new);

    const detailsLinks = queryAllByTestId('details-link');
    expect(detailsLinks.length).toBe(0);
    // because there are no reports yet

    // Compliance Status
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
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
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Report download not available');
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      in_use: true,
      status: AUDIT_STATUS.running,
      alterable: '0',
      current_report: currentReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.running);
    expect(bars[0]).toHaveTextContent('0 %');

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('0 %');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Report
    expect(detailsLinks.length).toBe(1);
    // because there is no last report yet

    // Compliance Status
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
    const icons = getActionItems();

    fireEvent.click(icons[0]);
    expect(handleAuditStart).not.toHaveBeenCalled();
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

    fireEvent.click(icons[6]);
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Report download not available');
  });

  test('should call click handlers for stopped audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      current_report: currentReport,
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.stopped);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.stopped);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Stopped');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const icons = getActionItems();

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

  test('should call click handlers for finished audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const icons = getActionItems();

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

  test('should not call click handlers for audit without permission', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'user'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    const icons = getActionItems();
    expect(icons[0]).toHaveAttribute('title', 'Audit owned by user');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    fireEvent.click(icons[1]);
    expect(handleAuditStart).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    fireEvent.click(icons[2]);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Audit is not stopped');

    fireEvent.click(icons[3]);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    fireEvent.click(icons[4]);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    fireEvent.click(icons[5]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(icons[5]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[6]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(icons[6]).toHaveAttribute('title', 'Export Audit');

    fireEvent.click(icons[7]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(icons[7]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  console.warn = consoleError;
});

describe('Audit Row tests - compliance reports enabled', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  console.error = () => {};
  const featureList = [
    {name: 'COMPLIANCE_REPORTS', _enabled: 1},
  ];
  const caps = new Capabilities(['everything'], featureList);

  test('should render', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toBeVisible();

    // Name
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/auditreport/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Start');
    expect(icons[1]).toHaveAttribute('title', 'Audit is not stopped');
    expect(icons[2]).toHaveAttribute('title', 'Move Audit to trashcan');
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');
    expect(icons[4]).toHaveAttribute('title', 'Clone Audit');
    expect(icons[5]).toHaveAttribute('title', 'Export Audit');
    expect(icons[6]).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });
});