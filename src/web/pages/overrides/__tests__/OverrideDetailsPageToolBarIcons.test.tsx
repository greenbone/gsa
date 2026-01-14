/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Override from 'gmp/models/override';
import OverrideDetailsPageToolBarIcons from 'web/pages/overrides/OverrideDetailsPageToolBarIcons';

const manualUrl = 'test/';

const override = Override.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  new_severity: -1, // false positive
  nvt: {
    _oid: '123',
    name: 'foo nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  severity: 0.1,
  task: {
    name: 'task x',
    _id: '42',
  },
  text: 'override text',
  writable: 1,
});

describe('OverrideDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <OverrideDetailsPageToolBarIcons
        entity={override}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
      />,
    );

    expect(screen.getByTitle('Help: Overrides')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/overrides',
    );
    expect(screen.getByTitle('Override List')).toBeInTheDocument();

    expect(screen.getByTitle('Create new Override')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Override')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Override')).toBeInTheDocument();
    expect(screen.getByTitle('Move Override to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Export Override as XML')).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <OverrideDetailsPageToolBarIcons
        entity={override}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Override');
    const editIcon = screen.getByTitle('Edit Override');
    const deleteIcon = screen.getByTitle('Move Override to trashcan');
    const exportIcon = screen.getByTitle('Export Override as XML');

    fireEvent.click(cloneIcon);
    expect(handleOverrideCloneClick).toHaveBeenCalledWith(override);

    fireEvent.click(editIcon);
    expect(handleOverrideEditClick).toHaveBeenCalledWith(override);

    fireEvent.click(deleteIcon);
    expect(handleOverrideDeleteClick).toHaveBeenCalledWith(override);

    fireEvent.click(exportIcon);
    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(override);
  });

  test('should not call click handlers without permission', () => {
    const noPermOverride = Override.fromElement({
      _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
      active: 1,
      creation_time: '2020-12-23T14:14:11Z',
      hosts: '127.0.0.1',
      in_use: 0,
      modification_time: '2021-01-04T11:54:12Z',
      new_severity: -1, // false positive
      nvt: {
        _oid: '123',
        name: 'foo nvt',
      },
      owner: {name: 'admin'},
      permissions: {permission: {name: 'get_overrides'}},
      port: '666',
      severity: 0.1,
      text: 'override text',
      writable: 1,
    });
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <OverrideDetailsPageToolBarIcons
        entity={noPermOverride}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Override');
    const editIcon = screen.getByTitle('Permission to edit Override denied');
    const deleteIcon = screen.getByTitle(
      'Permission to move Override to trashcan denied',
    );
    const exportIcon = screen.getByTitle('Export Override as XML');

    fireEvent.click(cloneIcon);
    expect(handleOverrideCloneClick).toHaveBeenCalledWith(noPermOverride);

    fireEvent.click(editIcon);
    expect(handleOverrideEditClick).not.toHaveBeenCalled();

    fireEvent.click(deleteIcon);
    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    fireEvent.click(exportIcon);
    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(noPermOverride);
  });

  test('should call correct click handlers for override in use', () => {
    const overrideInUse = Override.fromElement({
      _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
      active: 1,
      creation_time: '2020-12-23T14:14:11Z',
      hosts: '127.0.0.1',
      in_use: 1,
      modification_time: '2021-01-04T11:54:12Z',
      new_severity: -1, // false positive
      nvt: {
        _oid: '123',
        name: 'foo nvt',
      },
      owner: {name: 'admin'},
      permissions: {permission: {name: 'Everything'}},
      port: '666',
      severity: 0.1,
      text: 'override text',
      writable: 1,
    });
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <OverrideDetailsPageToolBarIcons
        entity={overrideInUse}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
      />,
    );
    const cloneIcon = screen.getByTitle('Clone Override');
    const editIcon = screen.getByTitle('Edit Override');
    const deleteIcon = screen.getByTitle('Override is still in use');
    const exportIcon = screen.getByTitle('Export Override as XML');

    fireEvent.click(cloneIcon);
    expect(handleOverrideCloneClick).toHaveBeenCalledWith(overrideInUse);

    fireEvent.click(editIcon);
    expect(handleOverrideEditClick).toHaveBeenCalled();

    fireEvent.click(deleteIcon);
    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    fireEvent.click(exportIcon);
    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(overrideInUse);
  });
});
