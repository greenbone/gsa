/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ReportTask from 'gmp/models/report/task';
import getReportTaskTypePresentation from 'web/pages/reports/details/ReportTaskType';

const translate = (key: string) => key;

describe('getReportTaskTypePresentation', () => {
  test.each([
    [undefined, 'Scan'],
    [ReportTask.fromElement({_id: 'task', target: {_id: 'target'}}), 'Scan'],
    [
      ReportTask.fromElement({_id: 'task', agent_group: {_id: 'agent-group'}}),
      'Agents Scan',
    ],
    [
      ReportTask.fromElement({_id: 'task', oci_image_target: {_id: 'image'}}),
      'Container Scan',
    ],
    [
      ReportTask.fromElement({
        _id: 'task',
        web_application_target: {_id: 'web-app'},
      }),
      'Web Application Scan',
    ],
    [ReportTask.fromElement({_id: 'task'}), 'Import Task'],
  ])('returns the %s task type', (task, expectedLabel) => {
    const presentation = getReportTaskTypePresentation(task, translate);

    expect(presentation.label).toBe(expectedLabel);
    expect(presentation.icon).toBeDefined();
  });
});
