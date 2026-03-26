/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import CollectionCounts from 'gmp/collection/collection-counts';
import dayjs from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';
import {YES_VALUE} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TagsListPage from 'web/pages/tags/ListPage';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({filter: null});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
  }),
);

const createTag = (id = 'tag1') =>
  new Tag({
    id,
    name: 'test tag',
    value: 'test value',
    active: YES_VALUE,
    resourceType: 'target',
    resourceCount: 5,
    creationTime: dayjs('2025-01-01T00:00:00Z'),
    modificationTime: dayjs('2025-01-02T00:00:00Z'),
    owner: {name: 'admin'},
    userCapabilities: new EverythingCapabilities(),
  });

describe('TagsListPage tests', () => {
  test('should render full TagsListPage and create tag dialog', async () => {
    const tag = createTag();

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });

    const getTags = testing.fn().mockResolvedValue({
      data: [tag],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = {
      tag: {
        create: testing.fn().mockResolvedValue({id: 'created-id'}),
        save: testing.fn().mockResolvedValue({id: 'saved-id'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
        delete: testing.fn().mockResolvedValue(undefined),
        export: testing.fn().mockResolvedValue({foo: 'bar'}),
        enable: testing.fn().mockResolvedValue(undefined),
        disable: testing.fn().mockResolvedValue(undefined),
        get: testing.fn().mockResolvedValue({data: tag}),
        resourcenames: {
          getAll: testing.fn().mockResolvedValue({data: []}),
        },
      },
      tags: {
        get: getTags,
      },
      filters: {
        get: getFilters,
      },
      resourcenames: {
        getAll: testing.fn().mockResolvedValue({data: []}),
      },
      settings: {manualUrl: 'test/', token: 'token'},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('tags', defaultSettingFilter),
    );

    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Toolbar
    screen.getByTitle('Help: Tags');
    screen.getByTitle('New Tag');

    // Table headers
    screen.getByText('Name');
    screen.getByText('Value');
    screen.getByText('Active');
    screen.getByText('Resource Type');

    // Row contents
    screen.getByText('test tag');
    screen.getByText('test value');
    screen.getByText('Target');

    // Row actions
    screen.getByTitle('Clone Tag');
    screen.getByTitle('Export Tag');
    screen.getByTitle('Edit Tag');

    // Test create tag dialog
    fireEvent.click(screen.getByTitle('New Tag'));
    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should not render page if no tags are received', async () => {
    const counts = new CollectionCounts({
      first: 0,
      all: 0,
      filtered: 0,
      length: 0,
      rows: 10,
    });

    const getTags = testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = {
      tag: {
        create: testing.fn().mockResolvedValue({id: 'created-id'}),
        save: testing.fn().mockResolvedValue({id: 'saved-id'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
        delete: testing.fn().mockResolvedValue(undefined),
        export: testing.fn().mockResolvedValue({foo: 'bar'}),
        enable: testing.fn().mockResolvedValue(undefined),
        disable: testing.fn().mockResolvedValue(undefined),
        get: testing.fn().mockResolvedValue({data: createTag()}),
        resourcenames: {
          getAll: testing.fn().mockResolvedValue({data: []}),
        },
      },
      tags: {
        get: getTags,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl: 'test/', token: 'token'},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));
    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('tags', Filter.fromString('foo=bar')),
    );

    render(<TagsListPage />);

    await screen.findByText('No tags available');
  });
});
