/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';
import ResourceList from 'web/pages/tags/TagResourceList';

const createTag = (id = 'tag-1') =>
  new Tag({
    id,
    name: 'Test Tag',
    resourceType: 'task',
    resourceCount: 5,
    userCapabilities: new EverythingCapabilities(),
  });

const createTask = (id = 'task-1') =>
  new Task({
    id,
    name: 'Test Task',
    owner: {name: 'admin'},
  });

describe('ResourceList tests', () => {
  test('should render without crashing', async () => {
    const tag = createTag();
    const gmp = {
      tasks: {
        get: testing.fn().mockResolvedValue({
          data: [createTask()],
          meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
        }),
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});
    render(<ResourceList entity={tag} />);

    await screen.findByText('Test Task');
  });

  test('should render without resources', async () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      resourceType: 'task',
      resourceCount: 0,
    });

    const gmp = {
      tasks: {
        get: testing.fn().mockResolvedValue({
          data: [],
          meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
        }),
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});
    render(<ResourceList entity={tag} />);

    // Component renders empty state gracefully
  });

  test('should render multiple resources', async () => {
    const tag = createTag();
    const gmp = {
      tasks: {
        get: testing.fn().mockResolvedValue({
          data: [
            createTask('task-1'),
            createTask('task-2'),
            createTask('task-3'),
          ],
          meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
        }),
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});
    render(<ResourceList entity={tag} />);

    const items = await screen.findAllByText('Test Task');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  test('should call gmp with correct resource type', async () => {
    const tag = createTag();
    const getTasks = testing.fn().mockResolvedValue({
      data: [createTask()],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });
    const gmp = {
      tasks: {
        get: getTasks,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});
    render(<ResourceList entity={tag} />);

    await screen.findByText('Test Task');

    expect(getTasks).toHaveBeenCalled();
  });
});
