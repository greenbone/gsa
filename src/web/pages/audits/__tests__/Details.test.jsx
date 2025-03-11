/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Policy from 'gmp/models/policy';
import Schedule from 'gmp/models/schedule';
import Details from 'web/pages/audits/Details';
import {entityLoadingActions as policyActions} from 'web/store/entities/policies';
import {entityLoadingActions as scheduleActions} from 'web/store/entities/schedules';
import {rendererWith, screen} from 'web/utils/Testing';

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

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
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

const schedule = Schedule.fromElement({_id: '121314', name: 'schedule1'});

const getPolicy = testing.fn().mockReturnValue(
  Promise.resolve({
    data: policy,
  }),
);

const getSchedule = testing.fn().mockReturnValue(
  Promise.resolve({
    data: schedule,
  }),
);

const gmp = {
  policy: {
    get: getPolicy,
  },
  schedule: {
    get: getSchedule,
  },
};

describe('Audit Details tests', () => {
  test('should render full audit details', () => {
    const audit = Audit.fromElement({
      _id: '12345',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      preferences: preferences,
      schedule: schedule,
      config: policy,
    });
    const caps = new Capabilities(['everything']);

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    store.dispatch(policyActions.success('314', policy));
    store.dispatch(scheduleActions.success('121314', schedule));

    const {element} = render(<Details entity={audit} />);

    const headings = element.querySelectorAll('h2');
    const detailsLinks = screen.getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Target');
    expect(detailsLinks[0]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[1]).toHaveTextContent('Alerts');
    expect(detailsLinks[1]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[2]).toHaveTextContent('Scanner');
    expect(detailsLinks[2]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[3]).toHaveTextContent('Assets');

    expect(headings[4]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
