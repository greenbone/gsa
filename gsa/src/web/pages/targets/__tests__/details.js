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
import {setLocale} from 'gmp/locale/lang';
import Target from 'gmp/models/target';

import {rendererWith} from 'web/utils/testing';

import Details from '../details';

setLocale('en');

const target_elevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: 'Scan Config Default',
  comment: 'hello world',
  writable: '1',
  in_use: '1',
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: '2',
  reverse_lookup_only: '1',
  reverse_lookup_unify: '0',
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
    trash: '0',
  },
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: '22',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  tasks: {
    task: [
      {
        _id: 'task_id',
        name: 'task1',
      },
    ],
  },
});

const target_no_elevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: 'Scan Config Default',
  comment: 'hello world',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: '2',
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
    trash: '0',
  },
  ssh_credential: {
    _id: '',
    name: '',
    port: '',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
});

describe('Target Details tests', () => {
  test('should render full target details', () => {
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <Details entity={target_no_elevate} />,
    );

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Hosts');

    expect(element).toHaveTextContent('Included');
    expect(element).toHaveTextContent('127.0.0.1192.168.0.1');

    expect(element).toHaveTextContent('Maximum Number of Hosts2');

    expect(element).toHaveTextContent(
      'Allow simultaneous scanning via multiple IPsNo',
    );

    expect(element).toHaveTextContent('Reverse Lookup OnlyNo');
    expect(element).toHaveTextContent('Reverse Lookup UnifyNo');
    expect(element).toHaveTextContent('Alive TestScan Config Default');

    expect(element).toHaveTextContent('Port List');
    expect(detailslinks[0]).toHaveAttribute('href', '/portlist/pl_id1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(element).toHaveTextContent('SMB');

    expect(detailslinks[1]).toHaveAttribute('href', '/credential/4784');
  });

  test('should render full target details with elevate credentials and tasks', () => {
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <Details entity={target_elevate} />,
    );

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Hosts');

    expect(element).toHaveTextContent('Included');
    expect(element).toHaveTextContent('127.0.0.1192.168.0.1');

    expect(element).toHaveTextContent('Maximum Number of Hosts2');

    expect(element).toHaveTextContent(
      'Allow simultaneous scanning via multiple IPsNo',
    );

    expect(element).toHaveTextContent('Reverse Lookup OnlyYes');
    expect(element).toHaveTextContent('Reverse Lookup UnifyNo');
    expect(element).toHaveTextContent('Alive TestScan Config Default');

    expect(element).toHaveTextContent('Port List');
    expect(detailslinks[0]).toHaveAttribute('href', '/portlist/pl_id1');
    expect(detailslinks[0]).toHaveTextContent('pl1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(element).toHaveTextContent('SSH');
    expect(detailslinks[1]).toHaveAttribute('href', '/credential/1235');
    expect(detailslinks[1]).toHaveTextContent('ssh');

    expect(element).toHaveTextContent('on Port 22');
    expect(element).toHaveTextContent('SSH elevate credential ');
    expect(detailslinks[2]).toHaveAttribute('href', '/credential/3456');
    expect(detailslinks[2]).toHaveTextContent('ssh_elevate');

    expect(element).toHaveTextContent('SMB');
    expect(detailslinks[3]).toHaveAttribute('href', '/credential/4784');
    expect(detailslinks[3]).toHaveTextContent('smb_credential');

    expect(headings[2]).toHaveTextContent('Tasks using this Target (1)');
    expect(detailslinks[4]).toHaveAttribute('href', '/task/task_id');
    expect(detailslinks[4]).toHaveTextContent('task1');
  });
});
