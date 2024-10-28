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

const caps = new Capabilities(['everything']);

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
  console.error = () => {};
  const caps = new Capabilities(['everything']);

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
