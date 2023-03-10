/* Copyright (C) 2021-2022 Greenbone AG
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

import Filter from 'gmp/models/filter';
import NVT from 'gmp/models/nvt';
import Note from 'gmp/models/note';
import Override from 'gmp/models/override';

import {isDefined} from 'gmp/utils/identity';

import {entityLoadingActions} from 'web/store/entities/nvts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

const nvt = NVT.fromElement({
  _id: '12345',
  owner: {
    name: '',
  },
  name: '12345',
  comment: '',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  timezone: 'UTC',
  writable: 0,
  in_use: 0,
  permissions: '',
  update_time: '2020-10-30T11:44:00.000+0000',
  nvt: {
    _oid: '12345',
    name: 'foo',
    creation_time: '2019-06-24T11:55:30Z',
    modification_time: '2019-06-24T10:12:27Z',
    family: 'bar',
    cvss_base: 4.9,
    qod: {
      value: 80,
      type: 'remote_banner',
    },
    tags:
      'cvss_base_vector=AV:N/AC:M/Au:S/C:P/I:N/A:P|summary=This is a description|solution_type=VendorFix|insight=Foo|impact=Bar|vuldetect=Baz|affected=foo',
    solution: {
      _type: 'VendorFix',
      __text: 'This is a description',
    },
    timeout: '',
    refs: {
      ref: [
        {_type: 'cve', _id: 'CVE-2020-1234'},
        {_type: 'cve', _id: 'CVE-2020-5678'},
      ],
    },
  },
});

const note1 = Note.fromElement({
  _id: '5221d57f-3e62-4114-8e19-135a79b6b102',
  active: 1,
  creation_time: '2021-01-14T06:35:57Z',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-02-13T07:35:20+01:00',
  modification_time: '2021-01-14T06:35:57Z',
  new_severity: -1,
  timezone: 'UTC',
  new_threat: 'False Positive',
  nvt: {
    _oid: '12345',
    name: 'foo',
    type: 'nvt',
  },
  orphan: 0,
  owner: {
    name: 'admin',
  },
  permissions: {
    permission: {
      name: 'everything',
    },
  },
  port: '',
  result: {
    _id: '',
  },
  severity: '',
  task: {
    _id: '',
    name: '',
    trash: 0,
  },
  text: 'test_note',
  threat: 'Internal Error',
  writable: 1,
});

const override1 = Override.fromElement({
  _id: '5221d57f-3e62-4114-8e19-000000000001',
  active: 1,
  creation_time: '2021-01-14T05:35:57Z',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-03-13T11:35:20+01:00',
  modification_time: '2021-01-14T06:20:57Z',
  timezone: 'UTC',
  new_severity: -1,
  new_threat: 'False Positive',
  nvt: {
    _oid: '12345',
    name: 'foo',
    type: 'nvt',
  },
  orphan: 0,
  owner: {
    name: 'admin',
  },
  permissions: {
    permission: {
      name: 'everything',
    },
  },
  port: '',
  result: {
    _id: '',
  },
  severity: '',
  task: {
    _id: '',
    name: '',
    trash: 0,
  },
  text: 'test_override_1',
  threat: 'Internal Error',
  writable: 1,
});

const override2 = Override.fromElement({
  _id: '5221d57f-3e62-4114-8e19-000000000000',
  active: 1,
  creation_time: '2020-01-14T06:35:57Z',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-02-13T12:35:20+01:00',
  modification_time: '2020-02-14T06:35:57Z',
  timezone: 'UTC',
  new_severity: -1,
  new_threat: 'False Positive',
  nvt: {
    _oid: '12345',
    name: 'foo',
    type: 'nvt',
  },
  orphan: 0,
  owner: {
    name: 'admin',
  },
  permissions: {
    permission: {
      name: 'everything',
    },
  },
  port: '',
  result: {
    _id: '',
  },
  severity: '',
  task: {
    _id: '',
    name: '',
    trash: 0,
  },
  text: 'test_override_2',
  threat: 'Internal Error',
  writable: 1,
});

let getNvt;
let getNotes;
let getOverrides;
let getEntities;
let currentSettings;
let renewSession;

beforeEach(() => {
  getNvt = jest.fn().mockResolvedValue({
    data: nvt,
  });

  getNotes = jest.fn().mockResolvedValue({
    data: [note1],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getOverrides = jest.fn().mockResolvedValue({
    data: [override1, override2],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
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

describe('Nvt Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      nvt: {
        get: getNvt,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
      notes: {
        get: getNotes,
      },
      overrides: {
        get: getOverrides,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {baseElement, element} = render(<Detailspage id="12345" />);
    await wait();

    expect(element).toHaveTextContent('NVT: foo');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#network-vulnerability-tests-nvt',
    );

    expect(screen.getAllByTitle('NVT List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/nvts');

    expect(element).toHaveTextContent('ID:12345');
    expect(element).toHaveTextContent('Mon, Jun 24, 2019 11:55 AM UTC');
    expect(element).toHaveTextContent('Mon, Jun 24, 2019 10:12 AM UTC');
    expect(element).toHaveTextContent('Owner:(Global Object)');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[8]).toHaveTextContent('Preferences');
    expect(spans[10]).toHaveTextContent('User Tags');

    expect(element).toHaveTextContent('Summary');
    expect(element).toHaveTextContent('This is a description');

    expect(element).toHaveTextContent('Scoring');
    expect(element).toHaveTextContent('CVSS Base');
    expect(element).toHaveTextContent('4.9 (Medium)');
    expect(element).toHaveTextContent('CVSS Base Vector');
    expect(element).toHaveTextContent('AV:N/AC:M/Au:S/C:P/I:N/A:P');
    expect(element).toHaveTextContent('CVSS Origin');
    expect(element).toHaveTextContent('N/A');

    expect(element).toHaveTextContent('Insight');
    expect(element).toHaveTextContent('Foo');

    expect(element).toHaveTextContent('Detection Method');
    expect(element).toHaveTextContent('Baz');

    expect(element).toHaveTextContent('Affected Software/OS');
    expect(element).toHaveTextContent('foo');

    expect(element).toHaveTextContent('Impact');
    expect(element).toHaveTextContent('Bar');

    expect(element).toHaveTextContent('Solution');

    expect(element).toHaveTextContent('Family');
    expect(element).toHaveTextContent('bar');

    expect(element).toHaveTextContent('References');
    expect(element).toHaveTextContent('CVECVE-2020-1234');

    expect(element).toHaveTextContent('Overrides');
    expect(element).toHaveTextContent('Override from Any to False Positive');
    expect(element).toHaveTextContent('test_override_1');
    expect(element).toHaveTextContent('Active until');
    expect(element).toHaveTextContent('Sat, Mar 13, 2021 10:35 AM UTC');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Thu, Jan 14, 2021 6:20 AM UTC');

    expect(element).toHaveTextContent('test_override_2');
    expect(element).toHaveTextContent('Active until');
    expect(element).toHaveTextContent('Sat, Feb 13, 2021 11:35 AM UTC');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Fri, Feb 14, 2020 6:35 AM UTC');

    expect(element).toHaveTextContent('Notes');
    expect(element).toHaveTextContent('Note');
    expect(element).toHaveTextContent('test_note');
    expect(element).toHaveTextContent('Active until');
    expect(element).toHaveTextContent('Sat, Feb 13, 2021 6:35 AM UTC');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Thu, Jan 14, 2021 6:35 AM UTC');
  });

  test('should render preferences tab', () => {
    const gmp = {
      nvt: {
        get: getNvt,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
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

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[8]).toHaveTextContent('Preferences');

    expect(spans[8]).toHaveTextContent('Preferences');
    fireEvent.click(spans[8]);

    expect(baseElement).toHaveTextContent('Name');
    expect(baseElement).toHaveTextContent('Timeout');
    expect(baseElement).toHaveTextContent('Default Value');
    expect(baseElement).toHaveTextContent('default');
  });

  test('should render user tags tab', () => {
    const gmp = {
      nvt: {
        get: getNvt,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
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

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[10]).toHaveTextContent('User Tags');

    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });
});

describe('Nvt ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNvtDownloadClick = jest.fn();
    const handleOnNoteCreateClick = jest.fn();
    const handleOnOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={nvt}
        onNoteCreateClick={handleOnNoteCreateClick}
        onNvtDownloadClick={handleNvtDownloadClick}
        onOverrideCreateClick={handleOnOverrideCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#network-vulnerability-tests-nvt',
    );
    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/nvts');
    expect(screen.getAllByTitle('NVT List')[0]).toBeInTheDocument();

    expect(links[2]).toHaveAttribute('href', '/results?filter=nvt%3D12345');
    expect(
      screen.getAllByTitle('Corresponding Results')[0],
    ).toBeInTheDocument();

    expect(links[3]).toHaveAttribute(
      'href',
      '/vulnerabilities?filter=uuid%3D12345',
    );
    expect(
      screen.getAllByTitle('Corresponding Vulnerabilities')[0],
    ).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNvtDownloadClick = jest.fn();
    const handleOnNoteCreateClick = jest.fn();
    const handleOnOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={nvt}
        onNoteCreateClick={handleOnNoteCreateClick}
        onNvtDownloadClick={handleNvtDownloadClick}
        onOverrideCreateClick={handleOnOverrideCreateClick}
      />,
    );

    const exportIcon = screen.getAllByTitle('Export NVT');
    const addNewNoteIcon = screen.getAllByTitle('Add new Note');
    const addNewOverrideIcon = screen.getAllByTitle('Add new Override');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleNvtDownloadClick).toHaveBeenCalledWith(nvt);

    expect(addNewNoteIcon[0]).toBeInTheDocument();
    fireEvent.click(addNewNoteIcon[0]);
    expect(handleOnNoteCreateClick).toHaveBeenCalledWith(nvt);

    expect(addNewOverrideIcon[0]).toBeInTheDocument();
    fireEvent.click(addNewOverrideIcon[0]);
    expect(handleOnOverrideCreateClick).toHaveBeenCalledWith(nvt);
  });
});
