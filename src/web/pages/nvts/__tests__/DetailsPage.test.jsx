/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import NVT from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import DetailsPage, {ToolBarIcons} from 'web/pages/nvts/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/nvts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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
    family: 'bar',
    cvss_base: 4.9,
    qod: {
      value: 80,
      type: 'remote_banner',
    },
    tags: 'cvss_base_vector=AV:N/AC:M/Au:S/C:P/I:N/A:P|summary=This is a description|solution_type=VendorFix|insight=Foo|impact=Bar|vuldetect=Baz|affected=foo',
    solution: {
      _type: 'VendorFix',
      __text: 'This is a description',
    },
    epss: {
      max_severity: {
        score: 0.8765,
        percentile: 90.0,
        cve: {
          _id: 'CVE-2020-1234',
          severity: 10.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 80.0,
        cve: {
          _id: 'CVE-2020-5678',
        },
      },
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
  getNvt = testing.fn().mockResolvedValue({
    data: nvt,
  });

  getNotes = testing.fn().mockResolvedValue({
    data: [note1],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getOverrides = testing.fn().mockResolvedValue({
    data: [override1, override2],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getEntities = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Nvt DetailsPage tests', () => {
  test('should render full DetailsPage', async () => {
    const gmp = {
      nvt: {
        get: getNvt,
      },
      settings: {manualUrl, reloadInterval, enableEPSS: true},
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

    const {baseElement} = render(<DetailsPage id="12345" />);
    await wait();

    expect(baseElement).toHaveTextContent('NVT: foo');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#vulnerability-tests-vt',
    );

    expect(screen.getAllByTitle('NVT List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/nvts');

    expect(baseElement).toHaveTextContent('ID:12345');
    expect(baseElement).toHaveTextContent(
      'Mon, Jun 24, 2019 11:55 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent(
      'Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent('Owner:(Global Object)');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[8]).toHaveTextContent('Preferences');
    expect(spans[10]).toHaveTextContent('User Tags');

    expect(baseElement).toHaveTextContent('Summary');
    expect(baseElement).toHaveTextContent('This is a description');

    expect(baseElement).toHaveTextContent('Scoring');
    expect(baseElement).toHaveTextContent('CVSS Base');
    expect(baseElement).toHaveTextContent('4.9 (Medium)');
    expect(baseElement).toHaveTextContent('CVSS Base Vector');
    expect(baseElement).toHaveTextContent('AV:N/AC:M/Au:S/C:P/I:N/A:P');
    expect(baseElement).toHaveTextContent('CVSS Origin');
    expect(baseElement).toHaveTextContent('N/A');

    expect(baseElement).toHaveTextContent('EPSS (CVE with highest severity)');
    expect(baseElement).toHaveTextContent('EPSS Score');
    expect(baseElement).toHaveTextContent('0.87650');
    expect(baseElement).toHaveTextContent('EPSS Percentage');
    expect(baseElement).toHaveTextContent('90.000%');
    expect(baseElement).toHaveTextContent('EPSS (highest EPSS score)');
    expect(baseElement).toHaveTextContent('0.98760');

    expect(baseElement).toHaveTextContent('Insight');
    expect(baseElement).toHaveTextContent('Foo');

    expect(baseElement).toHaveTextContent('Detection Method');
    expect(baseElement).toHaveTextContent('Baz');

    expect(baseElement).toHaveTextContent('Affected Software/OS');
    expect(baseElement).toHaveTextContent('foo');

    expect(baseElement).toHaveTextContent('Impact');
    expect(baseElement).toHaveTextContent('Bar');

    expect(baseElement).toHaveTextContent('Solution');

    expect(baseElement).toHaveTextContent('Family');
    expect(baseElement).toHaveTextContent('bar');

    expect(baseElement).toHaveTextContent('References');
    expect(baseElement).toHaveTextContent('CVECVE-2020-1234');

    expect(baseElement).toHaveTextContent('Overrides');
    expect(baseElement).toHaveTextContent(
      'Override from Any to False Positive',
    );
    expect(baseElement).toHaveTextContent('test_override_1');
    expect(baseElement).toHaveTextContent('Active until');
    expect(baseElement).toHaveTextContent(
      'Sat, Mar 13, 2021 10:35 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent('Modified');
    expect(baseElement).toHaveTextContent(
      'Thu, Jan 14, 2021 6:20 AM Coordinated Universal Time',
    );

    expect(baseElement).toHaveTextContent('test_override_2');
    expect(baseElement).toHaveTextContent('Active until');
    expect(baseElement).toHaveTextContent(
      'Sat, Feb 13, 2021 11:35 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent('Modified');
    expect(baseElement).toHaveTextContent(
      'Fri, Feb 14, 2020 6:35 AM Coordinated Universal Time',
    );

    expect(baseElement).toHaveTextContent('Notes');
    expect(baseElement).toHaveTextContent('Note');
    expect(baseElement).toHaveTextContent('test_note');
    expect(baseElement).toHaveTextContent('Active until');
    expect(baseElement).toHaveTextContent(
      'Sat, Feb 13, 2021 6:35 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent('Modified');
    expect(baseElement).toHaveTextContent(
      'Thu, Jan 14, 2021 6:35 AM Coordinated Universal Time',
    );
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
      settings: {manualUrl, reloadInterval, enableEPSS: true},
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

    const {baseElement} = render(<DetailsPage id="12345" />);

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
      settings: {manualUrl, reloadInterval, enableEPSS: true},
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

    const {baseElement} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[10]).toHaveTextContent('User Tags');

    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });
});

describe('Nvt ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNvtDownloadClick = testing.fn();
    const handleOnNoteCreateClick = testing.fn();
    const handleOnOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS: true}};

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
      'test/en/managing-secinfo.html#vulnerability-tests-vt',
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
    const handleNvtDownloadClick = testing.fn();
    const handleOnNoteCreateClick = testing.fn();
    const handleOnOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS: true}};

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

    const exportIcon = screen.getAllByTitle('Export NVT')[0];
    const addNewNoteIcon = screen.getAllByTitle('Add new Note')[0];
    const addNewOverrideIcon = screen.getAllByTitle('Add new Override')[0];

    fireEvent.click(exportIcon);
    expect(handleNvtDownloadClick).toHaveBeenCalledWith(nvt);

    fireEvent.click(addNewNoteIcon);
    expect(handleOnNoteCreateClick).toHaveBeenCalledWith(nvt);

    fireEvent.click(addNewOverrideIcon);
    expect(handleOnOverrideCreateClick).toHaveBeenCalledWith(nvt);
  });
});
