/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import NVT from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import DetailsPage from 'web/pages/nvts/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/nvts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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
    family: 'A Family',
    cvss_base: 4.9,
    qod: {
      value: 80,
      type: 'remote_banner',
    },
    tags: 'cvss_base_vector=AV:N/AC:M/Au:S/C:P/I:N/A:P|summary=This is a CVSS description|solution_type=VendorFix|insight=An Insight|impact=An Impact|vuldetect=A VulDetect|affected=It is affected',
    solution: {
      _type: 'VendorFix',
      __text: 'This is a solution description',
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
  new_severity: 1,
  new_threat: 'Low',
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
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    render(<DetailsPage id="12345" />);
    await wait();

    expect(
      screen.getByRole('heading', {name: /NVT: foo/i}),
    ).toBeInTheDocument();

    expect(screen.getByTitle('Help: NVTs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#vulnerability-tests-vt',
    );

    expect(screen.getAllByTitle('NVT List')[0]).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/nvts',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /ID:/})).toHaveTextContent(
      'ID:12345',
    );
    expect(entityInfo.getByRole('row', {name: /Created:/})).toHaveTextContent(
      'Mon, Jun 24, 2019 11:55 AM Coordinated Universal Time',
    );
    expect(entityInfo.getByRole('row', {name: /Modified:/})).toHaveTextContent(
      'Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );
    expect(entityInfo.getByRole('row', {name: /Owner:/})).toHaveTextContent(
      'Owner:(Global Object)',
    );

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^preferences/i}),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^summary/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is a solution description'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^scoring/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {name: /^cvss base 4\.9/i}),
    ).toHaveTextContent('4.9 (Medium)');
    expect(
      screen.getByRole('row', {name: /^cvss base vector/i}),
    ).toHaveTextContent('AV:N/AC:M/Au:S/C:P/I:N/A:P');
    expect(screen.getByRole('row', {name: /^cvss origin/i})).toHaveTextContent(
      'N/A',
    );

    expect(
      screen.getByRole('heading', {name: /^epss \(cve/i}),
    ).toHaveTextContent('EPSS (CVE with highest severity)');
    expect(
      screen.getByRole('row', {name: /^EPSS Score 87/i}),
    ).toHaveTextContent('87.650%');
    expect(
      screen.getByRole('row', {name: /^EPSS Percentile 9/i}),
    ).toHaveTextContent('90th');
    expect(
      screen.getByRole('heading', {name: /^epss \(highest/i}),
    ).toHaveTextContent('EPSS (highest EPSS score)');
    expect(
      screen.getByRole('row', {name: /^EPSS Score 98/i}),
    ).toHaveTextContent('98.760%');
    expect(
      screen.getByRole('row', {name: /^EPSS Percentile 8/i}),
    ).toHaveTextContent('80th');

    expect(
      screen.getByRole('heading', {name: /^insight/i}),
    ).toBeInTheDocument();
    expect(screen.getByText(/^An Insight$/)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^detection method/i}),
    ).toBeInTheDocument();
    expect(screen.getByText(/^A VulDetect$/)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^affected software\/os/i}),
    ).toBeInTheDocument();
    expect(screen.getByText(/^It is affected$/)).toBeInTheDocument();

    expect(screen.getByRole('heading', {name: /^impact/i})).toBeInTheDocument();
    expect(screen.getByText(/^An Impact$/)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^solution/i}),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', {name: /^family/i})).toBeInTheDocument();
    expect(screen.getByText('A Family')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^references/i}),
    ).toBeInTheDocument();
    const nvtReferences = within(screen.getByTestId('nvt-references'));
    expect(nvtReferences.getByText('CVE-2020-1234')).toBeInTheDocument();
    expect(nvtReferences.getByText('CVE-2020-5678')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^overrides$/i}),
    ).toBeInTheDocument();

    const overrideBox1 = screen.getByLabelText(
      /^Override from Any to False Positive/,
    );
    expect(overrideBox1).toHaveTextContent('test_override_1');
    expect(overrideBox1).toHaveTextContent('Active until');
    expect(overrideBox1).toHaveTextContent(
      'Sat, Mar 13, 2021 10:35 AM Coordinated Universal Time',
    );
    expect(overrideBox1).toHaveTextContent('Modified');
    expect(overrideBox1).toHaveTextContent(
      'Thu, Jan 14, 2021 6:20 AM Coordinated Universal Time',
    );

    const overrideBox2 = screen.getByLabelText(/^Override from Any to 1: Low/);
    expect(overrideBox2).toHaveTextContent('test_override_2');
    expect(overrideBox2).toHaveTextContent('Active until');
    expect(overrideBox2).toHaveTextContent(
      'Sat, Feb 13, 2021 11:35 AM Coordinated Universal Time',
    );
    expect(overrideBox2).toHaveTextContent('Modified');
    expect(overrideBox2).toHaveTextContent(
      'Fri, Feb 14, 2020 6:35 AM Coordinated Universal Time',
    );

    expect(screen.getByRole('heading', {name: /^notes$/i})).toBeInTheDocument();
    const noteBox = screen.getByLabelText(/^Note/);
    expect(noteBox).toHaveTextContent('test_note');
    expect(noteBox).toHaveTextContent('Active until');
    expect(noteBox).toHaveTextContent(
      'Sat, Feb 13, 2021 6:35 AM Coordinated Universal Time',
    );
    expect(noteBox).toHaveTextContent('Modified');
    expect(noteBox).toHaveTextContent(
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
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    render(<DetailsPage id="12345" />);

    const preferencesTab = screen.getByRole('tab', {name: /^preferences/i});
    fireEvent.click(preferencesTab);

    expect(screen.getByRole('columnheader', {name: /^name/i}))
      .toBeInTheDocument;
    expect(
      screen.getByRole('columnheader', {name: /^default value/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {name: /^Timeout default/}),
    ).toBeInTheDocument();
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
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {container} = render(<DetailsPage id="12345" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });
});
