/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Task from 'gmp/models/task';
import TaskTypeBadge from 'web/pages/tasks/TaskTypeBadge';

describe('TaskTypeBadge', () => {
  test('renders the container image task type', () => {
    const {render} = rendererWith();
    const task = Task.fromElement({
      _id: 'task-id',
      oci_image_target: {_id: 'target-id'},
    });

    render(<TaskTypeBadge task={task} />);

    expect(screen.getByText('Container Image Task')).toBeInTheDocument();
    expect(screen.getByTestId('container-icon')).toBeInTheDocument();
  });
});
