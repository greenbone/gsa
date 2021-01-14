/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

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
  end_time: '',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-02-13T07:35:20+01:00',
  modification_time: '2021-01-14T06:35:57Z',
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
  text: 'test_note',
  threat: 'Internal Error',
  writable: 1,
});

const override1 = Override.fromElement({
  _id: '5221d57f-3e62-4114-8e19-000000000001',
  active: 1,
  creation_time: '2021-01-14T05:35:57Z',
  end_time: '',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-03-13T11:35:20+01:00',
  modification_time: '2021-01-14T06:20:57Z',
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
  end_time: '',
  hosts: '127.0.01.1',
  in_use: 0,
  end_time: '2021-02-13T12:35:20+01:00',
  modification_time: '2020-02-14T06:35:57Z',
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

const filter = Filter.fromElement({
  filter_type: '',
  terms: [
    {
      keyword: 'nvt_id',
      relation: '=',
      value: '12345',
    },
    {
      keyword: 'first',
      relation: '=',
      value: 1,
    },
    {
      keyword: 'rows',
      relation: '=',
      value: -1,
    },
  ],
});

const getNvt = jest.fn().mockResolvedValue({
  data: nvt,
});

const getNotes = jest.fn().mockResolvedValue({
  data: [note1],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getOverrides = jest.fn().mockResolvedValue({
  data: [override1, override2],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getEntities = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
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

    store.dispatch(setTimezone('CET'));
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
    expect(element).toHaveTextContent('Created:Mon, Jun 24, 2019 1:55 PM CEST');
    expect(element).toHaveTextContent(
      'Modified:Mon, Jun 24, 2019 12:12 PM CEST',
    );
    expect(element).toHaveTextContent('Owner:(Global Object)');

    const tabs = screen.getAllByTestId('entities-tab-title');
    //expect(tabs[0]).toHaveTextContent('Information');
    expect(tabs[0]).toHaveTextContent('Preferences');
    expect(tabs[1]).toHaveTextContent('User Tags');

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
    expect(element).toHaveTextContent('Sat, Mar 13, 2021 11:35 AM');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Thu, Jan 14, 2021 7:20 AM');

    expect(element).toHaveTextContent('test_override_2');
    expect(element).toHaveTextContent('Active until');
    expect(element).toHaveTextContent('Sat, Feb 13, 2021 12:35 PM');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Fri, Feb 14, 2020 7:35 AM');

    expect(element).toHaveTextContent('Notes');
    expect(element).toHaveTextContent('Note');
    expect(element).toHaveTextContent('test_note');
    expect(element).toHaveTextContent('Active until');
    expect(element).toHaveTextContent('Sat, Feb 13, 2021 7:35 AM');
    expect(element).toHaveTextContent('Modified');
    expect(element).toHaveTextContent('Thu, Jan 14, 2021 7:35 AM');
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

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {baseElement} = render(<Detailspage id="12345" />);

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('Preferences');
    fireEvent.click(tabs[0]);

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

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', nvt));

    const {baseElement} = render(<Detailspage id="12345" />);

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[1]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  //   test('should call commands', async () => {
  //     const clone = jest.fn().mockResolvedValue({
  //       data: {id: 'foo'},
  //     });

  //     const deleteFunc = jest.fn().mockResolvedValue({
  //       foo: 'bar',
  //     });

  //     const exportFunc = jest.fn().mockResolvedValue({
  //       foo: 'bar',
  //     });

  //     const gmp = {
  //       nvt: {
  //         get: getNvt,
  //       },
  //       notes: {
  //         get: getEntities,
  //       },
  //       overrides: {
  //         get: getEntities,
  //       },
  //       settings: {manualUrl, reloadInterval},
  //       user: {
  //         currentSettings,
  //         renewSession,
  //       },
  //     };
  //     const [renewQueryMock] = createRenewSessionQueryMock();

  //     const {render, store} = rendererWith({
  //       capabilities: caps,
  //       gmp,
  //       router: true,
  //       store: true,
  //       queryMocks: [renewQueryMock],
  //     });

  //     store.dispatch(setTimezone('CET'));
  //     store.dispatch(setUsername('admin'));

  //     store.dispatch(entityLoadingActions.success('12345', nvt));

  //     render(<Detailspage id="12345" />);

  //     await wait();

  //     const cloneIcon = screen.getAllByTitle('Clone Nvt');
  //     expect(cloneIcon[0]).toBeInTheDocument();
  //     fireEvent.click(cloneIcon[0]);

  //     await wait();

  //     expect(clone).toHaveBeenCalledWith(nvt);

  //     const exportIcon = screen.getAllByTitle('Export Nvt as XML');
  //     expect(exportIcon[0]).toBeInTheDocument();
  //     fireEvent.click(exportIcon[0]);

  //     await wait();

  //     expect(exportFunc).toHaveBeenCalledWith(nvt);

  //     const deleteIcon = screen.getAllByTitle('Move Nvt to trashcan');
  //     expect(deleteIcon[0]).toBeInTheDocument();
  //     fireEvent.click(deleteIcon[0]);

  //     await wait();

  //     expect(deleteFunc).toHaveBeenCalledWith({id: nvt.id});
  //   });
  // });

  // describe('Nvt ToolBarIcons tests', () => {
  //   test('should render', () => {
  //     const handleNvtDownloadClick = jest.fn();

  //     const gmp = {settings: {manualUrl}};

  //     const {render} = rendererWith({
  //       gmp,
  //       capabilities: caps,
  //       router: true,
  //     });

  //     const {element} = render(
  //       <ToolBarIcons
  //         entity={nvt}
  //         onNvtDownloadClick={handleNvtDownloadClick}
  //       />,
  //     );

  //     const links = element.querySelectorAll('a');

  //     expect(links[0]).toHaveAttribute(
  //       'href',
  //       'test/en/managing-secinfo.html#network-vulnerability-tests-nvt',
  //     );
  //     expect(screen.getAllByTitle('Help: Nvts')[0]).toBeInTheDocument();

  //     expect(links[1]).toHaveAttribute('href', '/nvts');
  //     expect(screen.getAllByTitle('Nvts List')[0]).toBeInTheDocument();
  //   });

  // test('should call click handlers', () => {
  //   const handleNvtCloneClick = jest.fn();
  //   const handleNvtDeleteClick = jest.fn();
  //   const handleNvtDownloadClick = jest.fn();
  //   const handleNvtEditClick = jest.fn();
  //   const handleNvtCreateClick = jest.fn();

  //   const gmp = {settings: {manualUrl}};

  //   const {render} = rendererWith({
  //     gmp,
  //     capabilities: caps,
  //     router: true,
  //   });

  //   render(
  //     <ToolBarIcons
  //       entity={nvt}
  //       onNvtCloneClick={handleNvtCloneClick}
  //       onNvtDeleteClick={handleNvtDeleteClick}
  //       onNvtDownloadClick={handleNvtDownloadClick}
  //       onNvtEditClick={handleNvtEditClick}
  //       onNvtCreateClick={handleNvtCreateClick}
  //     />,
  //   );

  //   const cloneIcon = screen.getAllByTitle('Clone Nvt');
  //   const editIcon = screen.getAllByTitle('Edit Nvt');
  //   const deleteIcon = screen.getAllByTitle('Move Nvt to trashcan');
  //   const exportIcon = screen.getAllByTitle('Export Nvt as XML');

  //   expect(cloneIcon[0]).toBeInTheDocument();
  //   fireEvent.click(cloneIcon[0]);
  //   expect(handleNvtCloneClick).toHaveBeenCalledWith(nvt);

  //   expect(editIcon[0]).toBeInTheDocument();
  //   fireEvent.click(editIcon[0]);
  //   expect(handleNvtEditClick).toHaveBeenCalledWith(nvt);

  //   expect(deleteIcon[0]).toBeInTheDocument();
  //   fireEvent.click(deleteIcon[0]);
  //   expect(handleNvtDeleteClick).toHaveBeenCalledWith(nvt);

  //   expect(exportIcon[0]).toBeInTheDocument();
  //   fireEvent.click(exportIcon[0]);
  //   expect(handleNvtDownloadClick).toHaveBeenCalledWith(nvt);
  // });

  // test('should not call click handlers without permission', () => {
  //   const handleNvtCloneClick = jest.fn();
  //   const handleNvtDeleteClick = jest.fn();
  //   const handleNvtDownloadClick = jest.fn();
  //   const handleNvtEditClick = jest.fn();
  //   const handleNvtCreateClick = jest.fn();

  //   const gmp = {settings: {manualUrl}};

  //   const {render} = rendererWith({
  //     gmp,
  //     capabilities: caps,
  //     router: true,
  //   });

  //   render(
  //     <ToolBarIcons
  //       entity={noPermNvt}
  //       onNvtCloneClick={handleNvtCloneClick}
  //       onNvtDeleteClick={handleNvtDeleteClick}
  //       onNvtDownloadClick={handleNvtDownloadClick}
  //       onNvtEditClick={handleNvtEditClick}
  //       onNvtCreateClick={handleNvtCreateClick}
  //     />,
  //   );

  //   const cloneIcon = screen.getAllByTitle('Clone Nvt');
  //   const editIcon = screen.getAllByTitle('Permission to edit Nvt denied');
  //   const deleteIcon = screen.getAllByTitle(
  //     'Permission to move Nvt to trashcan denied',
  //   );
  //   const exportIcon = screen.getAllByTitle('Export Nvt as XML');

  //   expect(cloneIcon[0]).toBeInTheDocument();
  //   fireEvent.click(cloneIcon[0]);

  //   expect(handleNvtCloneClick).toHaveBeenCalledWith(noPermNvt);

  //   expect(editIcon[0]).toBeInTheDocument();
  //   fireEvent.click(editIcon[0]);

  //   expect(handleNvtEditClick).not.toHaveBeenCalled();

  //   expect(deleteIcon[0]).toBeInTheDocument();
  //   fireEvent.click(deleteIcon[0]);

  //   expect(handleNvtDeleteClick).not.toHaveBeenCalled();

  //   expect(exportIcon[0]).toBeInTheDocument();
  //   fireEvent.click(exportIcon[0]);

  //   expect(handleNvtDownloadClick).toHaveBeenCalledWith(noPermNvt);
  // });

  // test('should (not) call click handlers for nvt in use', () => {
  //   const handleNvtCloneClick = jest.fn();
  //   const handleNvtDeleteClick = jest.fn();
  //   const handleNvtDownloadClick = jest.fn();
  //   const handleNvtEditClick = jest.fn();
  //   const handleNvtCreateClick = jest.fn();

  //   const gmp = {settings: {manualUrl}};

  //   const {render} = rendererWith({
  //     gmp,
  //     capabilities: caps,
  //     router: true,
  //   });

  //   render(
  //     <ToolBarIcons
  //       entity={nvtInUse}
  //       onNvtCloneClick={handleNvtCloneClick}
  //       onNvtDeleteClick={handleNvtDeleteClick}
  //       onNvtDownloadClick={handleNvtDownloadClick}
  //       onNvtEditClick={handleNvtEditClick}
  //       onNvtCreateClick={handleNvtCreateClick}
  //     />,
  //   );
  //   const cloneIcon = screen.getAllByTitle('Clone Nvt');
  //   const editIcon = screen.getAllByTitle('Edit Nvt');
  //   const deleteIcon = screen.getAllByTitle('Nvt is still in use');
  //   const exportIcon = screen.getAllByTitle('Export Nvt as XML');

  //   expect(cloneIcon[0]).toBeInTheDocument();
  //   fireEvent.click(cloneIcon[0]);

  //   expect(handleNvtCloneClick).toHaveBeenCalledWith(nvtInUse);

  //   expect(editIcon[0]).toBeInTheDocument();
  //   fireEvent.click(editIcon[0]);

  //   expect(handleNvtEditClick).toHaveBeenCalled();

  //   expect(deleteIcon[0]).toBeInTheDocument();
  //   fireEvent.click(deleteIcon[0]);
  //   expect(handleNvtDeleteClick).not.toHaveBeenCalled();

  //   expect(exportIcon[0]).toBeInTheDocument();
  //   fireEvent.click(exportIcon[0]);

  //   expect(handleNvtDownloadClick).toHaveBeenCalledWith(nvtInUse);
  // });
});
