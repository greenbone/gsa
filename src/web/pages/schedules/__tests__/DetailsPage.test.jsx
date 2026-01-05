/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Schedule from 'gmp/models/schedule';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import ScheduleDetailsPage from 'web/pages/schedules/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/schedules';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = -1;
const manualUrl = 'test/';

const schedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:foo\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  name: 'schedule 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  timezone: 'UTC',
  writable: 1,
  _id: '12345',
});

const getSchedule = testing.fn().mockResolvedValue({
  data: schedule,
});

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

describe('ScheduleDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = {
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    render(<ScheduleDetailsPage id="12345" />);

    expect(
      screen.getByRole('heading', {name: /Schedule: schedule 1/}),
    ).toBeInTheDocument();

    expect(screen.getByTitle('Help: Schedules')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );

    expect(screen.getByTitle('Schedules List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/schedules',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^id/i})).toHaveTextContent(
      'ID:1234',
    );
    expect(entityInfo.getByRole('row', {name: /^created/i})).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(entityInfo.getByRole('row', {name: /^modified/i})).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(entityInfo.getByRole('row', {name: /^owner/i})).toHaveTextContent(
      'Owner:admin',
    );

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('row', {name: /^comment hello world/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', {name: /^first run/i})).toHaveTextContent(
      'Mon, Jan 4, 2021 11:54 AM Coordinated Universal Time',
    );
    expect(screen.getByRole('row', {name: /^next run/i})).toHaveTextContent(
      '-',
    );
    expect(screen.getByRole('row', {name: /^timezone/i})).toHaveTextContent(
      'UTC',
    );
    expect(screen.getByRole('row', {name: /^recurrence/i})).toHaveTextContent(
      'Once',
    );
    expect(screen.getByRole('row', {name: /^duration/i})).toHaveTextContent(
      'Entire Operation',
    );
  });

  test('should render user tags tab', () => {
    const gmp = {
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    const {container} = render(<ScheduleDetailsPage id="12345" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    const {container} = render(<ScheduleDetailsPage id="12345" />);

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      schedule: {
        get: getSchedule,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    render(<ScheduleDetailsPage id="12345" />);

    await wait();

    const cloneIcon = screen.getByTitle('Clone Schedule');
    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(clone).toHaveBeenCalledWith(schedule);

    const exportIcon = screen.getByTitle('Export Schedule as XML');
    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalledWith(schedule);

    const deleteIcon = screen.getByTitle('Move Schedule to trashcan');
    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(deleteFunc).toHaveBeenCalledWith({id: schedule.id});
  });
});
