/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Task from 'gmp/models/task';
import {YES_VALUE} from 'gmp/parser';
import EntityTags from 'web/entity/Tags';

const createTask = () => {
  return new Task({
    id: 'task-1',
    name: 'Test Task',
    userTags: [
      {
        id: 'tag-1',
        name: 'Test Tag',
        value: 'test-value',
        active: YES_VALUE,
        comment: 'Test comment',
        resourceType: 'task',
        userCapabilities: new EverythingCapabilities(),
      },
      {
        id: 'tag-2',
        name: 'Another Tag',
        value: 'another-value',
        active: YES_VALUE,
        comment: 'Another comment',
        resourceType: 'task',
        userCapabilities: new EverythingCapabilities(),
      },
    ],
  } as Record<string, unknown>);
};

const currentSettingsResponse = {
  data: {
    detailsexportfilename: {
      id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
      name: 'Details Export File Name',
      value: '%T-%U',
    },
  },
};

const createGmpMock = (
  overrides: Record<string, unknown> | {user?: Record<string, unknown>} = {},
) => {
  const base = {
    settings: {
      manualUrl: 'http://docs.example.com/manual',
      manualLanguageMapping: {},
    },
    user: {
      currentSettings: testing.fn().mockResolvedValue(currentSettingsResponse),
    },
  };

  const overridesWithUser = overrides as {user?: Record<string, unknown>};
  return {
    ...base,
    ...overrides,
    user: {
      ...base.user,
      ...overridesWithUser.user,
    },
  };
};

describe('EntityTags tests', () => {
  test('should render user tags section', async () => {
    const entity = createTask();
    const gmp = createGmpMock();
    const {render} = rendererWith({capabilities: true, gmp});

    render(<EntityTags entity={entity} />);

    screen.getByTitle('User Tags (2)');
    screen.getByText('Test Tag');
    screen.getByText('Another Tag');
    screen.getByTitle('Help: User Tags');
  });

  test('should render no tags available message for empty or undefined tags', () => {
    const entity1 = new Task({
      id: 'task-1',
      name: 'Test Task',
      userTags: [],
    });
    const gmp = createGmpMock();
    const {render} = rendererWith({capabilities: true, gmp});

    render(<EntityTags entity={entity1} />);
    screen.getByText('No user tags available');
  });

  test('should render no tags message for undefined userTags', () => {
    const entity2 = new Task({
      id: 'task-1',
      name: 'Test Task',
    });
    const gmp = createGmpMock();
    const {render} = rendererWith({capabilities: true, gmp});

    render(<EntityTags entity={entity2} />);
    screen.getByText('No user tags available');
  });

  test('should render complete tags table with values, headers, actions and links', () => {
    const entity = createTask();
    const gmp = createGmpMock();
    const {render} = rendererWith({capabilities: true, gmp});

    render(<EntityTags entity={entity} />);

    // Check table structure
    screen.getByText('Name');
    screen.getByText('Value');
    screen.getByText('Comment');
    screen.getByText('Actions');

    // Check tag values in table
    screen.getByText('test-value');
    screen.getByText('another-value');
    screen.getByText('Test comment');
    screen.getByText('Another comment');

    const disableIcons = screen.getAllByTitle('Disable Tag');
    const editIcons = screen.getAllByTitle('Edit Tag');
    const removeIcons = screen.getAllByTitle('Remove Tag from Task');

    expect(disableIcons.length).toBe(2);
    expect(editIcons.length).toBe(2);
    expect(removeIcons.length).toBe(2);

    // Check new tag button
    screen.getByTitle('New Tag');

    // Check tag details links
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  test('should call edit handler when edit icon is clicked', async () => {
    const entity = createTask();
    const gmp = createGmpMock({
      tag: {
        get: testing.fn().mockResolvedValue({data: entity.userTags[0]}),
      },
      tasks: {
        get: testing.fn().mockResolvedValue({data: []}),
      },
      resourcenames: {
        getAll: testing.fn().mockResolvedValue({data: []}),
      },
    });
    const {render} = rendererWith({capabilities: true, gmp});

    render(<EntityTags entity={entity} />);

    const editIcons = screen.getAllByTitle('Edit Tag');
    fireEvent.click(editIcons[0]);

    await screen.findByRole('dialog');
  });

  test('should call remove handler', async () => {
    const entity = createTask();
    const handleChanged = testing.fn();
    const getMock = testing.fn().mockResolvedValue({data: entity.userTags[0]});
    const saveMock = testing.fn().mockResolvedValue({data: {}});
    const gmp = createGmpMock({
      tag: {
        get: getMock,
        save: saveMock,
      },
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(<EntityTags entity={entity} onChanged={handleChanged} />);

    const removeIcons = screen.getAllByTestId('trashcan-icon');
    fireEvent.click(removeIcons[0]);

    await wait();

    expect(getMock).toHaveBeenCalled();
  });
});
