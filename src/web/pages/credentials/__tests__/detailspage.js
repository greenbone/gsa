/* Copyright (C) 2021-2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import {entityLoadingActions} from 'web/store/entities/credentials';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, screen, fireEvent} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

setLocale('en');

let getCredential;
let getEntities;
let currentSettings;
let renewSession;

beforeEach(() => {
  getCredential = jest.fn().mockResolvedValue({
    data: credential,
  });
  getEntities = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

const credential = Credential.fromElement({
  _id: '6575',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'client certificate',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'cc',
  writable: 1,
  certificate_info: {
    activation_time: '2018-10-10T11:41:23.022Z',
    expiration_time: '2019-10-10T11:41:23.022Z',
    md5_fingerprint: 'asdf',
    issuer: 'dn',
  },
});

const noPermCredential = Credential.fromElement({
  _id: '6575',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'client certificate',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'get_credentials'}},
  type: 'cc',
  writable: 1,
  certificate_info: {
    activation_time: '2018-10-10T11:41:23.022Z',
    expiration_time: '2019-10-10T11:41:23.022Z',
    md5_fingerprint: 'asdf',
    issuer: 'dn',
  },
});

const credentialInUse = Credential.fromElement({
  _id: '6575',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'client certificate',
  in_use: 1,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'cc',
  writable: 1,
  certificate_info: {
    activation_time: '2018-10-10T11:41:23.022Z',
    expiration_time: '2019-10-10T11:41:23.022Z',
    md5_fingerprint: 'asdf',
    issuer: 'dn',
  },
});

describe('Credential Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      credential: {
        get: getCredential,
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

    store.dispatch(entityLoadingActions.success('6575', credential));

    const {baseElement, element} = render(<Detailspage id="6575" />);

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Credentials')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );

    expect(screen.getAllByTitle('Credential List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/credentials');

    expect(element).toHaveTextContent('ID:6575');
    expect(element).toHaveTextContent('Created:Wed, Dec 16, 2020 4:23 PM CET');
    expect(element).toHaveTextContent('Modified:Tue, Mar 2, 2021 11:28 AM CET');
    expect(element).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[10]).toHaveTextContent('User Tags');
    expect(spans[12]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('Comment');
    expect(element).toHaveTextContent('blah');

    expect(element).toHaveTextContent('Type');
    expect(element).toHaveTextContent('Client Certificate(cc)');

    expect(element).toHaveTextContent('Allow Insecure Use');
    expect(element).toHaveTextContent('Yes');

    expect(element).toHaveTextContent('Certificate');

    expect(element).toHaveTextContent('Activation');
    expect(element).toHaveTextContent('Wed, Oct 10, 2018 1:41 PM CEST');

    expect(element).toHaveTextContent('Expiration');
    expect(element).toHaveTextContent('Thu, Oct 10, 2019 1:41 PM CEST');

    expect(element).toHaveTextContent('MD5 Fingerprint');
    expect(element).toHaveTextContent('asdf');

    expect(element).toHaveTextContent('Issued By');
    expect(element).toHaveTextContent('dn');
  });

  test('should render user tags tab', () => {
    const gmp = {
      credential: {
        get: getCredential,
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

    store.dispatch(entityLoadingActions.success('6575', credential));

    const {baseElement} = render(<Detailspage id="6575" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[10]).toHaveTextContent('User Tags');

    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      credential: {
        get: getCredential,
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

    store.dispatch(entityLoadingActions.success('6575', credential));

    const {baseElement} = render(<Detailspage id="6575" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[12]).toHaveTextContent('Permissions');

    fireEvent.click(spans[12]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', () => {
    const clone = jest.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      credential: {
        get: getCredential,
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

    store.dispatch(entityLoadingActions.success('6575', credential));

    render(<Detailspage id="6575" />);

    const cloneIcon = screen.getAllByTitle('Clone Credential');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(clone).toHaveBeenCalledWith(credential);

    const exportIcon = screen.getAllByTitle('Export Credential as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(exportFunc).toHaveBeenCalledWith(credential);

    const deleteIcon = screen.getAllByTitle('Move Credential to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(deleteFunc).toHaveBeenCalledWith({id: credential.id});
  });
});

describe('Credential ToolBarIcons tests', () => {
  test('should render', () => {
    const handleCredentialCloneClick = jest.fn();
    const handleCredentialDeleteClick = jest.fn();
    const handleCredentialDownloadClick = jest.fn();
    const handleCredentialEditClick = jest.fn();
    const handleCredentialCreateClick = jest.fn();
    const handleCredentialInstallerDownloadClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );
    expect(screen.getAllByTitle('Help: Credentials')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/credentials');
    expect(screen.getAllByTitle('Credential List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleCredentialCloneClick = jest.fn();
    const handleCredentialDeleteClick = jest.fn();
    const handleCredentialDownloadClick = jest.fn();
    const handleCredentialEditClick = jest.fn();
    const handleCredentialCreateClick = jest.fn();
    const handleCredentialInstallerDownloadClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Credential');
    const editIcon = screen.getAllByTitle('Edit Credential');
    const deleteIcon = screen.getAllByTitle('Move Credential to trashcan');
    const exportIcon = screen.getAllByTitle('Export Credential as XML');
    const exportCredentialInstallerIcon = screen.getAllByTitle(
      'Download Certificate (.pem)',
    );

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleCredentialCloneClick).toHaveBeenCalledWith(credential);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleCredentialEditClick).toHaveBeenCalledWith(credential);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleCredentialDeleteClick).toHaveBeenCalledWith(credential);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(credential);

    expect(exportCredentialInstallerIcon[0]).toBeInTheDocument();
    fireEvent.click(exportCredentialInstallerIcon[0]);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'pem',
    );
  });

  test('should not call click handlers without permission', () => {
    const handleCredentialCloneClick = jest.fn();
    const handleCredentialDeleteClick = jest.fn();
    const handleCredentialDownloadClick = jest.fn();
    const handleCredentialEditClick = jest.fn();
    const handleCredentialCreateClick = jest.fn();
    const handleCredentialInstallerDownloadClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermCredential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Credential');
    const editIcon = screen.getAllByTitle(
      'Permission to edit Credential denied',
    );
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Credential to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Credential as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleCredentialCloneClick).toHaveBeenCalledWith(noPermCredential);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleCredentialEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleCredentialDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(
      noPermCredential,
    );
  });

  test('should (not) call click handlers for credential in use', () => {
    const handleCredentialCloneClick = jest.fn();
    const handleCredentialDeleteClick = jest.fn();
    const handleCredentialDownloadClick = jest.fn();
    const handleCredentialEditClick = jest.fn();
    const handleCredentialCreateClick = jest.fn();
    const handleCredentialInstallerDownloadClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={credentialInUse}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Credential');
    const editIcon = screen.getAllByTitle('Edit Credential');
    const deleteIcon = screen.getAllByTitle('Credential is still in use');
    const exportIcon = screen.getAllByTitle('Export Credential as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleCredentialCloneClick).toHaveBeenCalledWith(credentialInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleCredentialEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleCredentialDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(credentialInUse);
  });
});
