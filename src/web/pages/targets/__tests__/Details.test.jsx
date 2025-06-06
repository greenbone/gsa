/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Target from 'gmp/models/target';
import Details from 'web/pages/targets/Details';

const gmp = {
  settings: {
    enableKrb5: false,
  },
};

const targetElevate = Target.fromElement({
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

const targetNoElevate = Target.fromElement({
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

    render(<Details entity={targetNoElevate} />);

    const headings = screen.getAllByRole('heading', {level: 2});
    const detailsLinks = screen.getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Hosts');

    const includedLabel = screen.getByText('Included');
    const includedRow = includedLabel.closest('tr');
    expect(includedRow).toHaveTextContent('127.0.0.1');
    expect(includedRow).toHaveTextContent('192.168.0.1');

    const maxHostsLabel = screen.getByText('Maximum Number of Hosts');
    const maxHostsRow = maxHostsLabel.closest('tr');
    expect(maxHostsRow).toHaveTextContent('2');

    const labelElement = screen.getByText(
      'Allow simultaneous scanning via multiple IPs',
    );
    const row = labelElement.closest('tr');
    expect(row).toHaveTextContent('No');
    const reverseLookupsLabel = screen.getByText('Reverse Lookup Only');
    const reverseLookupsRow = reverseLookupsLabel.closest('tr');
    expect(reverseLookupsRow).toHaveTextContent('No');

    const reverseLookupUnifyLabel = screen.getByText('Reverse Lookup Unify');
    const reverseLookupUnifyRow = reverseLookupUnifyLabel.closest('tr');
    expect(reverseLookupUnifyRow).toHaveTextContent('No');

    const aliveTestLabel = screen.getByText('Alive Test');
    const aliveTestRow = aliveTestLabel.closest('tr');
    expect(aliveTestRow).toHaveTextContent('Scan Config Default');

    expect(screen.getByText('Port List')).toBeInTheDocument();
    expect(detailsLinks[0]).toHaveAttribute('href', '/portlist/pl_id1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(screen.getByText('SMB (NTLM)')).toBeInTheDocument();

    expect(detailsLinks[1]).toHaveAttribute('href', '/credential/4784');
  });

  test('should render full target details with elevate credentials and tasks', () => {
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<Details entity={targetElevate} />);

    const headings = screen.getAllByRole('heading', {level: 2});
    const detailsLinks = screen.getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Hosts');

    const includedLabel = screen.getByText('Included');
    const includedRow = includedLabel.closest('tr');
    expect(includedRow).toHaveTextContent('127.0.0.1');
    expect(includedRow).toHaveTextContent('192.168.0.1');

    const maxHostsLabel = screen.getByText('Maximum Number of Hosts');
    const maxHostsRow = maxHostsLabel.closest('tr');
    expect(maxHostsRow).toHaveTextContent('2');

    const allowSimultaneousLabel = screen.getByText(
      'Allow simultaneous scanning via multiple IPs',
    );
    const allowSimultaneousRow = allowSimultaneousLabel.closest('tr');
    expect(allowSimultaneousRow).toHaveTextContent('No');

    const reverseLookupOnlyLabel = screen.getByText('Reverse Lookup Only');
    const reverseLookupOnlyRow = reverseLookupOnlyLabel.closest('tr');
    expect(reverseLookupOnlyRow).toHaveTextContent('Yes');

    const reverseLookupUnifyLabel = screen.getByText('Reverse Lookup Unify');
    const reverseLookupUnifyRow = reverseLookupUnifyLabel.closest('tr');
    expect(reverseLookupUnifyRow).toHaveTextContent('No');

    const aliveTestLabel = screen.getByText('Alive Test');
    const aliveTestRow = aliveTestLabel.closest('tr');
    expect(aliveTestRow).toHaveTextContent('Scan Config Default');

    expect(screen.getByText('Port List')).toBeInTheDocument();
    expect(detailsLinks[0]).toHaveAttribute('href', '/portlist/pl_id1');
    expect(detailsLinks[0]).toHaveTextContent('pl1');

    expect(headings[1]).toHaveTextContent('Credentials');

    expect(screen.getByText('SSH')).toBeInTheDocument();
    expect(detailsLinks[1]).toHaveAttribute('href', '/credential/1235');
    expect(detailsLinks[1]).toHaveTextContent('ssh');

    expect(screen.getByText(/on Port 22/)).toBeInTheDocument();
    expect(screen.getByText(/SSH elevate credential/)).toBeInTheDocument();
    expect(detailsLinks[2]).toHaveAttribute('href', '/credential/3456');
    expect(detailsLinks[2]).toHaveTextContent('ssh_elevate');

    expect(screen.getByText('SMB (NTLM)')).toBeInTheDocument();
    expect(detailsLinks[3]).toHaveAttribute('href', '/credential/4784');
    expect(detailsLinks[3]).toHaveTextContent('smb_credential');

    expect(headings[2]).toHaveTextContent('Tasks using this Target (1)');
    expect(detailsLinks[4]).toHaveAttribute('href', '/task/task_id');
    expect(detailsLinks[4]).toHaveTextContent('task1');
  });

  test.each([
    {
      name: 'ESXi only',
      target: {
        _id: 'esxi_target',
        name: 'target_with_only_esxi',
        esxi_credential: {
          _id: 'esxi_id',
          name: 'esxi_cred',
          trash: '0',
        },
      },
      enableKrb5: false,
      expectedHeadings: 2,
      expectedLabel: 'ESXi',
      expectedCredId: 'esxi_id',
      expectedCredName: 'esxi_cred',
      notExpectedLabels: [
        'SSH',
        'SSH elevate credential',
        'SMB (NTLM)',
        'SNMP',
        'SMB (Kerberos)',
      ],
    },
    {
      name: 'Kerberos only (enabled)',
      target: {
        _id: 'krb5_target',
        name: 'target_with_only_krb5',
        krb5_credential: {
          _id: 'krb5_id',
          name: 'krb5_cred',
          trash: '0',
        },
      },
      enableKrb5: true,
      expectedHeadings: 2,
      expectedLabel: 'SMB (Kerberos)',
      expectedCredId: 'krb5_id',
      expectedCredName: 'krb5_cred',
      notExpectedLabels: [
        'SSH',
        'SSH elevate credential',
        'SMB (NTLM)',
        'SNMP',
        'ESXi',
      ],
    },
    {
      name: 'Kerberos only (disabled)',
      target: {
        _id: 'krb5_target',
        name: 'target_with_only_krb5',
        krb5_credential: {
          _id: 'krb5_id',
          name: 'krb5_cred',
          trash: '0',
        },
      },
      enableKrb5: false,
      expectedHeadings: 1,
      notExpectedLabels: [
        'SMB (Kerberos)',
        'SSH',
        'SSH elevate credential',
        'SMB (NTLM)',
        'SNMP',
        'ESXi',
      ],
    },
    {
      name: 'SSH and elevate only',
      target: {
        _id: 'ssh_target',
        name: 'target_with_only_ssh',
        ssh_credential: {
          _id: 'ssh_id',
          name: 'ssh_cred',
          port: '22',
          trash: '0',
        },
        ssh_elevate_credential: {
          _id: 'ssh_elevate_id',
          name: 'ssh_elevate_cred',
          trash: '0',
        },
      },
      enableKrb5: false,
      expectedHeadings: 2,
      expectedLabel: 'SSH',
      expectedCredId: 'ssh_id',
      expectedCredName: 'ssh_cred',
      expectedText: [
        'on Port 22',
        'SSH elevate credential',
        'ssh_elevate_cred',
      ],
      notExpectedLabels: ['SMB (NTLM)', 'SNMP', 'ESXi', 'SMB (Kerberos)'],
    },
    {
      name: 'SMB (NTLM) only',
      target: {
        _id: 'smb_target',
        name: 'target_with_only_smb',
        smb_credential: {
          _id: 'smb_id',
          name: 'smb_cred',
        },
      },
      enableKrb5: false,
      expectedHeadings: 2,
      expectedLabel: 'SMB (NTLM)',
      expectedCredId: 'smb_id',
      expectedCredName: 'smb_cred',
      notExpectedLabels: [
        'SSH',
        'SSH elevate credential',
        'SNMP',
        'ESXi',
        'SMB (Kerberos)',
      ],
    },
    {
      name: 'SNMP only',
      target: {
        _id: 'snmp_target',
        name: 'target_with_only_snmp',
        snmp_credential: {
          _id: 'snmp_id',
          name: 'snmp_cred',
          trash: '0',
        },
      },
      enableKrb5: false,
      expectedHeadings: 2,
      expectedLabel: 'SNMP',
      expectedCredId: 'snmp_id',
      expectedCredName: 'snmp_cred',
      notExpectedLabels: [
        'SSH',
        'SSH elevate credential',
        'SMB (NTLM)',
        'ESXi',
        'SMB (Kerberos)',
      ],
    },
  ])(
    'should render credentials correctly - $name',
    ({
      target,
      enableKrb5,
      expectedHeadings,
      expectedLabel,
      expectedCredId,
      expectedCredName,
      expectedText = [],
      notExpectedLabels = [],
    }) => {
      const caps = new Capabilities(['everything']);

      const baseTarget = {
        owner: {name: 'admin'},
        alive_tests: 'Scan Config Default',
        writable: '1',
        in_use: '0',
        permissions: {permission: [{name: 'Everything'}]},
        hosts: '127.0.0.1',
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
          _id: '',
          name: '',
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
        krb5_credential: {
          _id: '',
          name: '',
          trash: '0',
        },
      };

      const completeTarget = Target.fromElement({
        ...baseTarget,
        ...target,
      });

      const {render} = rendererWith({
        gmp: {
          settings: {
            enableKrb5,
          },
        },
        capabilities: caps,
        router: true,
      });

      render(<Details entity={completeTarget} />);

      const headings = screen.getAllByRole('heading', {level: 2});
      expect(headings.length).toBe(expectedHeadings);

      if (expectedHeadings > 1) {
        expect(headings[1]).toHaveTextContent('Credentials');

        if (expectedLabel) {
          expect(screen.getByText(expectedLabel)).toBeInTheDocument();
          const detailsLinks = screen.getAllByTestId('details-link');
          const credentialLink = detailsLinks[1];
          expect(credentialLink).toHaveAttribute(
            'href',
            `/credential/${expectedCredId}`,
          );
          expect(credentialLink).toHaveTextContent(expectedCredName);
        }

        expectedText.forEach(text => {
          expect(screen.getByText(new RegExp(text))).toBeInTheDocument();
        });
      }

      notExpectedLabels.forEach(label => {
        expect(screen.queryByText(label)).toBeNull();
      });
    },
  );
});
