/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, within} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
import ScanConfig from 'gmp/models/scan-config';
import Schedule from 'gmp/models/schedule';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Details from 'web/pages/tasks/TaskDetails';
import {entityLoadingActions as scanconfigActions} from 'web/store/entities/scanconfigs';
import {entityLoadingActions as scheduleActions} from 'web/store/entities/schedules';

const scanConfigElement = {
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {_id: 'test-id', name: 'scanner1', type: 0},
  tasks: {
    task: [
      {_id: '12345', name: 'foo'},
      {_id: '678910', name: 'task2'},
    ],
  },
};

const scanConfig = ScanConfig.fromElement(scanConfigElement);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
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
      name: 'Apply Overrides when adding Assets',
      scanner_name: 'assets_apply_overrides',
      value: 'yes',
    },
    {
      name: 'Min QOD when adding Assets',
      scanner_name: 'assets_min_qod',
      value: '70',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
    {
      name: 'Auto Delete Reports Data',
      scanner_name: 'auto_delete_data',
      value: '5',
    },
    {
      name: 'Allow Failed Credential Store Retrieval',
      scanner_name: 'cs_allow_failed_retrieval',
      value: '1',
    },
  ],
};

const scheduleElement = {
  _id: '121314',
  name: 'schedule1',
};

const schedule = Schedule.fromElement(scheduleElement);

const getConfig = testing.fn().mockReturnValue(
  Promise.resolve({
    data: scanConfig,
  }),
);

const getSchedule = testing.fn().mockReturnValue(
  Promise.resolve({
    data: schedule,
  }),
);

const gmp = {
  scanconfig: {
    get: getConfig,
  },
  schedule: {
    get: getSchedule,
  },
};

describe('TaskDetails tests', () => {
  test('should render container image target link when container scanning is enabled', () => {
    const task = Task.fromElement({
      _id: 'cscan1',
      owner: {name: 'username'},
      name: 'container scan',
      status: TASK_STATUS.done,
      oci_image_target: {_id: 'oci123', name: 'my-container-image'},
    });
    const features = new Features(['ENABLE_CONTAINER_SCANNING']);

    const {render} = rendererWith({
      capabilities: true,
      router: true,
      store: true,
      gmp,
      features,
    });

    render(<Details entity={task} />);

    expect(task.ociImageTarget?.name).toBe('my-container-image');

    const containerImageTargetHeading = screen.getByText(
      'Container Image Target',
    );
    expect(containerImageTargetHeading).toBeVisible();

    const link = screen.getByText('my-container-image');
    expect(link).toBeVisible();
    expect(link.closest('a')).toHaveAttribute('href', '/ociimagetargets');
  });

  test('should render full task details', () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      preferences: preferences,
      schedule: scheduleElement,
      config: scanConfigElement,
    });
    const caps = new Capabilities(['everything']);
    const features = new Features(['ENABLE_CREDENTIAL_STORES']);

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
      features,
    });

    store.dispatch(scanconfigActions.success('314', scanConfig));
    store.dispatch(scheduleActions.success('121314', schedule));

    const {element} = render(<Details entity={task} />);

    const targetDetails = within(
      screen.getByRole('heading', {name: /^Target$/})
        .parentElement as HTMLElement,
    );
    expect(targetDetails.getByRole('link', {name: 'target1'})).toHaveAttribute(
      'href',
      '/target/5678',
    );

    const alertsDetails = within(
      screen.getByRole('heading', {name: /^Alerts$/})
        .parentElement as HTMLElement,
    );
    expect(alertsDetails.getByRole('link', {name: 'alert1'})).toHaveAttribute(
      'href',
      '/alert/91011',
    );

    const scannerDetails = within(
      screen.getByRole('heading', {name: /^Scanner$/})
        .parentElement as HTMLElement,
    );
    expect(
      scannerDetails.getByRole('link', {name: 'scanner1'}),
    ).toHaveAttribute('href', '/scanner/1516');
    expect(scannerDetails.getByRole('row', {name: /^Type/})).toHaveTextContent(
      'OpenVAS Scanner',
    );

    screen.getByRole('heading', {name: /^Assets$/});
    expect(element).toHaveTextContent(
      'Allow scan when credential store retrieval fails',
    );
    expect(element).toHaveTextContent('Yes');

    screen.getByRole('heading', {name: /^Scan$/});
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
