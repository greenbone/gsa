/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Schedule from 'gmp/models/schedule';
import ScheduleDetailsPageToolBarIcons from 'web/pages/schedules/ScheduleDetailsPageToolBarIcons';

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

describe('ScheduleDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ScheduleDetailsPageToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

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
      capabilities: true,
      router: true,
    });

    render(
      <ScheduleDetailsPageToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Schedule');
    const editIcon = screen.getByTitle('Edit Schedule');
    const deleteIcon = screen.getByTitle('Move Schedule to trashcan');
    const exportIcon = screen.getByTitle('Export Schedule as XML');

    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(handleScheduleCloneClick).toHaveBeenCalledWith(schedule);

    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(handleScheduleEditClick).toHaveBeenCalledWith(schedule);

    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(handleScheduleDeleteClick).toHaveBeenCalledWith(schedule);

    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(schedule);
  });

  test('should not call click handlers without permission', () => {
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

    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ScheduleDetailsPageToolBarIcons
        entity={noPermSchedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Schedule');
    const editIcon = screen.getByTitle('Permission to edit Schedule denied');
    const deleteIcon = screen.getByTitle(
      'Permission to move Schedule to trashcan denied',
    );
    const exportIcon = screen.getByTitle('Export Schedule as XML');

    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(handleScheduleCloneClick).toHaveBeenCalledWith(noPermSchedule);

    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(handleScheduleEditClick).not.toHaveBeenCalled();

    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(noPermSchedule);
  });

  test('should (not) call click handlers for schedule in use', () => {
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
    const handleScheduleCloneClick = testing.fn();
    const handleScheduleDeleteClick = testing.fn();
    const handleScheduleDownloadClick = testing.fn();
    const handleScheduleEditClick = testing.fn();
    const handleScheduleCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ScheduleDetailsPageToolBarIcons
        entity={scheduleInUse}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleCreateClick={handleScheduleCreateClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
      />,
    );
    const cloneIcon = screen.getByTitle('Clone Schedule');
    const editIcon = screen.getByTitle('Edit Schedule');
    const deleteIcon = screen.getByTitle('Schedule is still in use');
    const exportIcon = screen.getByTitle('Export Schedule as XML');

    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(handleScheduleCloneClick).toHaveBeenCalledWith(scheduleInUse);

    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(handleScheduleEditClick).toHaveBeenCalled();

    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(scheduleInUse);
  });
});
