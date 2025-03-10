/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import Schedule from 'gmp/models/schedule';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import DetailsPage, {ToolBarIcons} from 'web/pages/audits/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/audits';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen} from 'web/utils/Testing';

const policy = Policy.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {id: '12345', name: 'foo'},
      {id: '678910', name: 'audit2'},
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
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '1',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
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
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit3 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.new,
  alterable: '0',
  report_count: {__text: '0'},
  result_count: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit4 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  in_use: '1',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  report_count: {__text: '1'},
  result_count: '0',
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
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport,
  report_count: {__text: '2'},
  result_count: '10',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit5Id = {
  id: '12345',
};

const audit6 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'get_tasks'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit7 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  schedule: {
    _id: '121314',
    name: 'schedule1',
    permissions: {permission: [{name: 'everything'}]},
  },
  schedule_periods: '1',
  preferences: preferences,
  usage_type: 'audit',
});

const caps = new Capabilities(['everything']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getPolicy = testing.fn().mockResolvedValue({
  data: policy,
});

const getSchedule = testing.fn().mockResolvedValue({
  data: schedule,
});

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('Audit DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const getAudit = testing.fn().mockResolvedValue({
      data: audit,
    });

    const gmp = {
      audit: {
        get: getAudit,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit));

    const {baseElement} = render(<DetailsPage id="12345" />);

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('Audit: foo');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Audits',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );

    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'Audit List',
    );
    expect(links[1]).toHaveAttribute('href', '/audits');

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    const progressBars = screen.getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = baseElement.querySelectorAll('h2');
    const detailsLinks = screen.getAllByTestId('details-link');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailsLinks[2]).toHaveAttribute('href', '/target/5678');
    expect(baseElement).toHaveTextContent('target1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailsLinks[3]).toHaveAttribute('href', '/alert/91011');
    expect(baseElement).toHaveTextContent('alert1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailsLinks[4]).toHaveAttribute('href', '/scanner/1516');
    expect(baseElement).toHaveTextContent('scanner1');
    expect(baseElement).toHaveTextContent('OpenVAS Scanner');

    expect(headings[4]).toHaveTextContent('Assets');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(baseElement).toHaveTextContent('2 minutes');
    expect(baseElement).toHaveTextContent(
      'Do not automatically delete reports',
    );
  });

  test('should render permissions tab', () => {
    const getAudit = testing.fn().mockResolvedValue({
      data: audit2,
    });

    const gmp = {
      audit: {
        get: getAudit,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit2));

    const {baseElement} = render(<DetailsPage id="12345" />);
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getAudit = testing.fn().mockResolvedValue({
      data: audit5,
    });

    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const start = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const resume = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      audit: {
        get: getAudit,
        clone,
        delete: deleteFunc,
        export: exportFunc,
        start,
        resume,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit5));

    render(<DetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(clone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    fireEvent.click(cloneIcon);
    expect(clone).toHaveBeenCalledWith(audit5);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportFunc).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalled(audit5);

    const startIcon = screen.getByTestId('start-icon');
    expect(start).not.toHaveBeenCalled();
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(start).toHaveBeenCalledWith(audit5);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resume).not.toHaveBeenCalledWith(audit5);
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    fireEvent.click(resumeIcon);
    expect(resume).toHaveBeenCalledWith(audit5);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteFunc).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    fireEvent.click(deleteIcon);
    expect(deleteFunc).toHaveBeenCalledWith(audit5Id);
  });
});

describe('Audit ToolBarIcons tests', () => {
  test('should render', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={audit}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Audits',
    );
    expect(links[1]).toHaveAttribute('href', '/audits');
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'Audit List',
    );
  });

  test('should call click handlers for new audit', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={audit3}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit3);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit3);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit3);
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit3);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit3);
    expect(startIcon).toHaveAttribute('title', 'Start');

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    expect(links[2]).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(links[2]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('0');

    expect(links[3]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('0');
  });

  test('should call click handlers for running audit', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={audit4}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit4);

    const editIcon = screen.getByTestId('edit-icon');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit4);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Audit is still in use');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit4);

    const stopIcon = screen.getByTestId('stop-icon');
    expect(stopIcon).toHaveAttribute('title', 'Stop');
    expect(handleAuditStopClick).not.toHaveBeenCalled();
    fireEvent.click(stopIcon);
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    expect(handleAuditStopClick).toHaveBeenCalledWith(audit4);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('0');
  });

  test('should call click handlers for stopped audit', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={audit5}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit5);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit5);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit5);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit5);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit5);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).toHaveBeenCalledWith(audit5);

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('10');
  });

  test('should call click handlers for finished audit', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={audit2}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit2);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit2);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit2);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit2);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/auditreport/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('1');
  });

  test('should not call click handlers without permission', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={audit6}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit6);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit6);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/auditreport/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('1');
  });

  test('should render schedule icon if audit is scheduled', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    render(
      <ToolBarIcons
        entity={audit7}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/121314');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit7);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is scheduled');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
  });
});
