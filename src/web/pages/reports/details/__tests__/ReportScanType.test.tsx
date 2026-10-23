/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import ReportTask from 'gmp/models/report/task';
import {createSession} from 'gmp/testing';
import ReportScanType from 'web/pages/reports/details/ReportScanType';

const createGmp = () => ({
  session: createSession(),
});

describe('ReportScanType', () => {
  test('renders the report type label', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ReportScanType
        task={ReportTask.fromElement({
          _id: 'task',
          oci_image_target: {_id: 'image'},
        })}
      />,
    );

    expect(screen.getByText('Container Scan')).toBeInTheDocument();
  });

  test('preserves the heading output', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ReportScanType
        heading
        task={ReportTask.fromElement({
          _id: 'task',
          agent_group: {_id: 'agent-group'},
        })}
      />,
    );

    expect(screen.getByText('Report:')).toBeInTheDocument();
    expect(screen.getByTitle('Agent Task')).toBeInTheDocument();
  });
});
