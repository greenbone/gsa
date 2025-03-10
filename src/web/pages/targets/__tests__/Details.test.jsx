/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Target from 'gmp/models/target';
import Details from 'web/pages/targets/Details';
import {rendererWith} from 'web/utils/Testing';


const gmp = {
  settings: {
    enableKrb5: false
  }
}

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
  krb5_credential: {
    _id: 'krb5_id',
    name: 'krb5',
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
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <Details entity={target_no_elevate} />,
    );

    const headings = element.querySelectorAll('h2');
    const detailsLinks = getAllByTestId('details-link');

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
    expect(detailsLinks[0]).toHaveAttribute('href', '/portlist/pl_id1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(element).toHaveTextContent('SMB');

    expect(detailsLinks[1]).toHaveAttribute('href', '/credential/4784');
  });

  test('should render Kerberos in target details, when KRB5 is enabled', () => {
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({
      gmp: {
        settings: {
          enableKrb5: true
        }
      },
      capabilities: caps,
      router: true,
    });
    
    const {element, getAllByTestId} = render(
      <Details entity={target_no_elevate} />,
    );
    const kerberosLink = getAllByTestId('details-link')[2];


    expect(element).toHaveTextContent('Kerberos');
    expect(kerberosLink).toHaveAttribute('href', '/credential/krb5_id');
    expect(kerberosLink).toHaveTextContent('krb5');
  })

  test('should render full target details with elevate credentials and tasks', () => {
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <Details entity={target_elevate} />,
    );

    const headings = element.querySelectorAll('h2');
    const detailsLinks = getAllByTestId('details-link');

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
    expect(detailsLinks[0]).toHaveAttribute('href', '/portlist/pl_id1');
    expect(detailsLinks[0]).toHaveTextContent('pl1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(element).toHaveTextContent('SSH');
    expect(detailsLinks[1]).toHaveAttribute('href', '/credential/1235');
    expect(detailsLinks[1]).toHaveTextContent('ssh');

    expect(element).toHaveTextContent('on Port 22');
    expect(element).toHaveTextContent('SSH elevate credential ');
    expect(detailsLinks[2]).toHaveAttribute('href', '/credential/3456');
    expect(detailsLinks[2]).toHaveTextContent('ssh_elevate');

    expect(element).toHaveTextContent('SMB');
    expect(detailsLinks[3]).toHaveAttribute('href', '/credential/4784');
    expect(detailsLinks[3]).toHaveTextContent('smb_credential');

    expect(headings[2]).toHaveTextContent('Tasks using this Target (1)');
    expect(detailsLinks[4]).toHaveAttribute('href', '/task/task_id');
    expect(detailsLinks[4]).toHaveTextContent('task1');
  });
});
