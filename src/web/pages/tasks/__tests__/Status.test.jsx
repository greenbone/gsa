/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Status from 'web/pages/tasks/Status';

const caps = new Capabilities(['everything']);

describe('Task Status tests', () => {
  test('should render', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const {render} = rendererWith({capabilities: caps});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.new);
    expect(bar).toHaveTextContent(TASK_STATUS.new);

    const detailsLink = screen.queryByTestId('details-link');
    expect(detailsLink).toBe(null);
  });

  test('should render with last report', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.done,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.done);
    expect(bar).toHaveTextContent(TASK_STATUS.done);

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Done');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });

  test('should render with current report', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
      current_report: {report: {_id: '1234'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.running);
    expect(bar).toHaveTextContent('0 %');

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('0 %');
    expect(detailslink).toHaveAttribute('href', '/report/1234');
  });

  test('should render container', () => {
    const task = Task.fromElement({
      permissions: {permission: [{name: 'everything'}]},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', 'Container');
    expect(bar).toHaveTextContent('Container');

    const detailslink = screen.queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Container');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });

  test('should render container with status interrupted', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.interrupted,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.interrupted);
    expect(bar).toHaveTextContent(TASK_STATUS.interrupted);
  });

  test('should render running container task as processing', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.processing);
    expect(bar).toHaveTextContent(TASK_STATUS.processing);
  });

  test('should render processing container task as processing', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.processing,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});
    render(<Status task={task} />);

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.processing);
    expect(bar).toHaveTextContent(TASK_STATUS.processing);
  });
});
