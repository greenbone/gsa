/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Status from 'web/pages/tasks/TaskStatus';

describe('TaskStatus tests', () => {
  test('should render', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.new,
      alterable: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.new);
    expect(bar).toHaveTextContent(TASK_STATUS.new);

    const detailsLink = screen.queryByTestId('details-link');
    expect(detailsLink).toBe(null);
  });

  test('should render with last report', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.done,
      alterable: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: true, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.done);
    expect(bar).toHaveTextContent(TASK_STATUS.done);

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Done');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });

  test('should render no scan results yet for an agent task with an empty report', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.done,
      alterable: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      agent_group: {_id: 'agent-group-id'},
      last_report: {
        report: {
          _id: 'report-id',
          result_count: {
            false_positive: 0,
            high: 0,
            log: 0,
            low: 0,
            medium: 0,
          },
          severity: -99,
        },
      },
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.noresults);
    expect(bar).toHaveTextContent(TASK_STATUS.noresults);
  });

  test('should render done for a regular task without a report', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.done,
      alterable: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.done);
    expect(bar).toHaveTextContent(TASK_STATUS.done);
  });

  test('should render with current report', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.running,
      alterable: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
      current_report: {report: {_id: '1234'}},
    });

    const {render} = rendererWith({capabilities: true, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.running);
    expect(bar).toHaveTextContent('0 %');

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('0 %');
    expect(detailslink).toHaveAttribute('href', '/report/1234');
  });

  test('should render import task', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      permissions: {permission: [{name: 'everything'}]},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: true, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', 'Import Task');
    expect(bar).toHaveTextContent('Import Task');

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Import Task');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });

  test('should render import task with status interrupted', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.interrupted,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.interrupted);
    expect(bar).toHaveTextContent(TASK_STATUS.interrupted);
  });

  test('should render running import task as processing', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.running,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.processing);
    expect(bar).toHaveTextContent(TASK_STATUS.processing);
  });

  test('should render processing import task as processing', () => {
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.processing,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.processing);
    expect(bar).toHaveTextContent(TASK_STATUS.processing);
  });
});
