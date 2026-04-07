/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import Schedule from 'gmp/models/schedule';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import DetailsPage from 'web/pages/audits/DetailsPage';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const policy = Policy.fromElement({
  _id: '314',
  name: 'Policy 1',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {_id: '12345', name: 'foo'},
      {_id: '678910', name: 'audit2'},
    ],
  },
});

const schedule = Schedule.fromElement({
  _id: '121314',
  name: 'schedule1',
  permissions: {permission: [{name: 'everything'}]},
});

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const currentReport = {
  report: {
    _id: '12342',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
  },
};

const preferences = {
  preference: [
    {
      name: 'Add results to Asset Management',
      scanner_name: 'in_assets',
      value: 'yes',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
  ],
};

const audit = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'some comment',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: 1,
  last_report: lastReport,
  report_count: {__text: 1},
  result_count: 1,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit2 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: 0,
  last_report: lastReport,
  report_count: {__text: 1},
  result_count: 1,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit5 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.stopped,
  alterable: 0,
  current_report: currentReport,
  last_report: lastReport,
  report_count: {__text: 2},
  result_count: 10,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const createGmp = ({
  auditEntity = audit,
  getPolicyResponse = new Response(policy),
  getScheduleResponse = new Response(schedule),
  getReportFormatsResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  getPermissionsResponse = {
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  },
  cloneAuditResponse = new Response({id: 'foo'}),
  deleteAuditResponse = new Response({foo: 'bar'}),
  exportAuditResponse = new Response({foo: 'bar'}),
  startAuditResponse = new Response({foo: 'bar'}),
  resumeAuditResponse = new Response({foo: 'bar'}),
  getAudit = testing.fn().mockResolvedValue({data: auditEntity}),
  getPolicy = testing.fn().mockResolvedValue(getPolicyResponse),
  getSchedule = testing.fn().mockResolvedValue(getScheduleResponse),
  getReportFormats = testing.fn().mockResolvedValue(getReportFormatsResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  cloneAudit = testing.fn().mockResolvedValue(cloneAuditResponse),
  deleteAudit = testing.fn().mockResolvedValue(deleteAuditResponse),
  exportAudit = testing.fn().mockResolvedValue(exportAuditResponse),
  startAudit = testing.fn().mockResolvedValue(startAuditResponse),
  resumeAudit = testing.fn().mockResolvedValue(resumeAuditResponse),
} = {}) => {
  return {
    audit: {
      get: getAudit,
      clone: cloneAudit,
      delete: deleteAudit,
      export: exportAudit,
      start: startAudit,
      resume: resumeAudit,
    },
    policy: {
      get: getPolicy,
    },
    schedule: {
      get: getSchedule,
    },
    permissions: {
      get: getPermissions,
    },
    reportformats: {
      get: getReportFormats,
    },
    settings: {
      manualUrl,
      reloadInterval: 15000,
      reloadIntervalActive: 3000,
      token: 'test-token',
    },
    user: {
      currentSettings,
    },
  };
};

describe('Audit DetailsPage tests', () => {
  test('should render full DetailsPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      route: '/audit/12345',
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Routes>
        <Route element={<DetailsPage />} path="/audit/:id" />
      </Routes>,
    );

    await screen.findByTitle('Help: Audits');
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/audits',
    );

    screen.getByRole('heading', {name: /Audit: foo/});

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /ID/})).toHaveTextContent(
      '12345',
    );
    expect(entityInfo.getByRole('row', {name: /Created/})).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /Modified/})).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /Owner/})).toHaveTextContent(
      'admin',
    );

    const tablist = within(await screen.findByRole('tablist'));
    tablist.getByRole('tab', {name: /^information/i});
    tablist.getByRole('tab', {name: /^user tags/i});
    tablist.getByRole('tab', {name: /^permissions/i});

    screen.getByRole('row', {name: /^comment some comment/i});
    const progressBars = screen.getByTestId('progressbar-box');
    expect(progressBars).toHaveAttribute('title', 'Done');
    expect(progressBars).toHaveTextContent('Done');

    const targetDetails = within(
      screen.getByRole('heading', {name: /^Target$/})
        .parentElement as HTMLElement,
    );
    expect(targetDetails.getByTestId('details-link')).toHaveAttribute(
      'href',
      '/target/5678',
    );
    expect(targetDetails.getByTestId('details-link')).toHaveTextContent(
      'target1',
    );

    const alertsDetails = within(
      screen.getByRole('heading', {name: /^Alerts$/})
        .parentElement as HTMLElement,
    );
    expect(alertsDetails.getByTestId('details-link')).toHaveAttribute(
      'href',
      '/alert/91011',
    );
    expect(alertsDetails.getByTestId('details-link')).toHaveTextContent(
      'alert1',
    );

    const scannerDetails = within(
      screen.getByRole('heading', {name: /^Scanner$/})
        .parentElement as HTMLElement,
    );
    expect(scannerDetails.getByTestId('details-link')).toHaveAttribute(
      'href',
      '/scanner/1516',
    );
    expect(scannerDetails.getByTestId('details-link')).toHaveTextContent(
      'scanner1',
    );
    expect(scannerDetails.getByRole('row', {name: /^Type/})).toHaveTextContent(
      'OpenVAS Scanner',
    );

    screen.getByRole('heading', {name: /^Assets$/});

    screen.getByRole('heading', {name: /^Scan$/});
    const scanDetails = within(
      screen.getByRole('heading', {name: /^Scan$/})
        .parentElement as HTMLElement,
    );
    expect(
      scanDetails.getByRole('row', {name: /^Duration of last Scan/}),
    ).toHaveTextContent('2 minutes');
    expect(
      scanDetails.getByRole('row', {name: /^Auto delete Reports/}),
    ).toHaveTextContent('Do not automatically delete reports');
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      route: '/audit/12345',
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Routes>
        <Route element={<DetailsPage />} path="/audit/:id" />
      </Routes>,
    );

    const tablist = within(await screen.findByRole('tablist'));
    const userTagsTab = await tablist.findByRole('tab', {
      name: /^user tags/i,
    });
    fireEvent.click(userTagsTab);
  });

  test('should render permissions tab', async () => {
    const gmp = createGmp({auditEntity: audit2});
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      route: '/audit/12345',
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {container} = render(
      <Routes>
        <Route element={<DetailsPage />} path="/audit/:id" />
      </Routes>,
    );

    const tablist = within(await screen.findByRole('tablist'));
    const permissionsTab = await tablist.findByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = createGmp({auditEntity: audit5});
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      route: '/audit/12345',
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Routes>
        <Route element={<DetailsPage />} path="/audit/:id" />
      </Routes>,
    );

    const cloneIcon = await screen.findByTestId('clone-icon');
    expect(gmp.audit.clone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    fireEvent.click(cloneIcon);
    expect(gmp.audit.clone).toHaveBeenCalledWith(audit5);

    const exportIcon = screen.getByTestId('export-icon');
    expect(gmp.audit.export).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    fireEvent.click(exportIcon);
    expect(gmp.audit.export).toHaveBeenCalledWith(audit5);

    const startIcon = screen.getByTestId('start-icon');
    expect(gmp.audit.start).not.toHaveBeenCalled();
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(gmp.audit.start).toHaveBeenCalledWith(audit5);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(gmp.audit.resume).not.toHaveBeenCalledWith(audit5);
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    fireEvent.click(resumeIcon);
    expect(gmp.audit.resume).toHaveBeenCalledWith(audit5);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(gmp.audit.delete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    fireEvent.click(deleteIcon);
    expect(gmp.audit.delete).toHaveBeenCalledWith({id: audit5.id});
  });
});
