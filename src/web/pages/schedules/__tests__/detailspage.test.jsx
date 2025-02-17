/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Schedule from 'gmp/models/schedule';
import {entityLoadingActions} from 'web/store/entities/schedules';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

const caps = new Capabilities(['everything']);

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

const scheduleInUse = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.04+alpha~git-bb97c86-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nRRULE:FREQ=WEEKLY\nUID:3dfd6e6f-4e79-4f18-a5c2-adb3fca56bd3\nDTSTAMP:20210104T115412Z\nEND:VEVENT\nEND:VCALENDAR\n',
  in_use: 1,
  modification_time: '2021-01-04T11:54:12Z',
  name: 'schedule 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  timezone: 'UTC',
  writable: 1,
  _id: '23456',
});

const noPermSchedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.04+alpha~git-bb97c86-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nRRULE:FREQ=WEEKLY\nUID:3dfd6e6f-4e79-4f18-a5c2-adb3fca56bd3\nDTSTAMP:20210104T115412Z\nEND:VEVENT\nEND:VCALENDAR\n',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  name: 'schedule 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'get_schedules'}},
  timezone: 'UTC',
  writable: 1,
  _id: '23456',
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

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Schedule Detailspage tests', () => {
  test('should render full Detailspage', () => {
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
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    const {baseElement, container} = render(<Detailspage id="12345" />);

    expect(container).toHaveTextContent('Schedule: schedule 1');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );

    expect(screen.getAllByTitle('Schedules List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/schedules');

    expect(container).toHaveTextContent('ID:1234');
    expect(container).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM CET',
    );
    expect(container).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM CET',
    );
    expect(container).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(container).toHaveTextContent('Comment');
    expect(container).toHaveTextContent('hello world');

    expect(container).toHaveTextContent('First Run');
    expect(container).toHaveTextContent('Mon, Jan 4, 2021 11:54 AM UTC');

    expect(container).toHaveTextContent('Next Run');
    expect(container).toHaveTextContent('-');

    expect(container).toHaveTextContent('Timezone');
    expect(container).toHaveTextContent('UTC');

    expect(container).toHaveTextContent('Recurrence');
    expect(container).toHaveTextContent('Once');

    expect(container).toHaveTextContent('Duration');
    expect(container).toHaveTextContent('Entire Operation');
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
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');

    expect(spans[9]).toHaveTextContent('User Tags');
    fireEvent.click(spans[9]);

    expect(baseElement).toHaveTextContent('No user tags available');
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
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    const {container, baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[11]);

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
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', schedule));

    render(<Detailspage id="12345" />);

    await wait();

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(clone).toHaveBeenCalledWith(schedule);

    const exportIcon = screen.getAllByTitle('Export Schedule as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(schedule);

    const deleteIcon = screen.getAllByTitle('Move Schedule to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: schedule.id});
  });
});

describe('Schedule ToolBarIcons tests', () => {
  test('should render', () => {
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );
    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/schedules');
    expect(screen.getAllByTitle('Schedules List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Edit Schedule');
    const deleteIcon = screen.getAllByTitle('Move Schedule to trashcan');
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleScheduleCloneClick).toHaveBeenCalledWith(schedule);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleScheduleEditClick).toHaveBeenCalledWith(schedule);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleScheduleDeleteClick).toHaveBeenCalledWith(schedule);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(schedule);
  });

  test('should not call click handlers without permission', () => {
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermSchedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Permission to edit Schedule denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Schedule to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleScheduleCloneClick).toHaveBeenCalledWith(noPermSchedule);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleScheduleEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(noPermSchedule);
  });

  test('should (not) call click handlers for schedule in use', () => {
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={scheduleInUse}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Edit Schedule');
    const deleteIcon = screen.getAllByTitle('Schedule is still in use');
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleScheduleCloneClick).toHaveBeenCalledWith(scheduleInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleScheduleEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(scheduleInUse);
  });
});
