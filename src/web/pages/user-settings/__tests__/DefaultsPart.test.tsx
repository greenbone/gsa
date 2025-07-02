/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import DefaultsPart from 'web/pages/user-settings/DefaultsPart';

describe('DefaultsPart', () => {
  test('renders correctly with all capabilities', () => {
    const handleChange = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
    });

    const props = {
      alerts: [
        {id: 'a1', name: 'Alert 1'},
        {id: 'a2', name: 'Alert 2'},
      ],
      credentials: [
        {id: 'c1', name: 'Credential 1'},
        {id: 'c2', name: 'Credential 2'},
      ],
      openVasScanConfigs: [
        {id: 'sc1', name: 'Config 1'},
        {id: 'sc2', name: 'Config 2'},
      ],
      openVasScanners: [
        {id: 's1', name: 'Scanner 1'},
        {id: 's2', name: 'Scanner 2'},
      ],
      portLists: [
        {id: 'p1', name: 'PortList 1'},
        {id: 'p2', name: 'PortList 2'},
      ],
      schedules: [
        {id: 'sch1', name: 'Schedule 1'},
        {id: 'sch2', name: 'Schedule 2'},
      ],
      targets: [
        {id: 't1', name: 'Target 1'},
        {id: 't2', name: 'Target 2'},
      ],
      defaultAlert: 'a1',
      defaultEsxiCredential: 'c1',
      defaultOpenvasScanConfig: 'sc1',
      defaultOpenvasScanner: 's1',
      defaultPortList: 'p1',
      defaultSmbCredential: 'c1',
      defaultSnmpCredential: 'c1',
      defaultSshCredential: 'c1',
      defaultSchedule: 'sch1',
      defaultTarget: 't1',
      onChange: handleChange,
    };

    render(<DefaultsPart {...props} />);

    expect(screen.getByText('Default Alert')).toBeInTheDocument();
    expect(screen.getByText('Default ESXi Credential')).toBeInTheDocument();
    expect(screen.getByText('Default OpenVAS Scan Config')).toBeInTheDocument();
    expect(screen.getByText('Default OpenVAS Scanner')).toBeInTheDocument();
    expect(screen.getByText('Default Port List')).toBeInTheDocument();
    expect(screen.getByText('Default SMB Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SNMP Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SSH Credential')).toBeInTheDocument();
    expect(screen.getByText('Default Schedule')).toBeInTheDocument();
    expect(screen.getByText('Default Target')).toBeInTheDocument();
  });

  test('renders only allowed sections based on capabilities', () => {
    const handleChange = testing.fn();

    const capabilities = new Capabilities([
      'get_credentials',
      'get_port_lists',
    ]);

    const {render} = rendererWith({
      capabilities,
    });

    const props = {
      alerts: [
        {id: 'a1', name: 'Alert 1'},
        {id: 'a2', name: 'Alert 2'},
      ],
      credentials: [
        {id: 'c1', name: 'Credential 1'},
        {id: 'c2', name: 'Credential 2'},
      ],
      openVasScanConfigs: [
        {id: 'sc1', name: 'Config 1'},
        {id: 'sc2', name: 'Config 2'},
      ],
      openVasScanners: [
        {id: 's1', name: 'Scanner 1'},
        {id: 's2', name: 'Scanner 2'},
      ],
      portLists: [
        {id: 'p1', name: 'PortList 1'},
        {id: 'p2', name: 'PortList 2'},
      ],
      schedules: [
        {id: 'sch1', name: 'Schedule 1'},
        {id: 'sch2', name: 'Schedule 2'},
      ],
      targets: [
        {id: 't1', name: 'Target 1'},
        {id: 't2', name: 'Target 2'},
      ],
      onChange: handleChange,
    };

    render(<DefaultsPart {...props} />);

    expect(screen.queryByText('Default Alert')).not.toBeInTheDocument();
    expect(screen.getByText('Default ESXi Credential')).toBeInTheDocument();
    expect(
      screen.queryByText('Default OpenVAS Scan Config'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Default OpenVAS Scanner'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Default Port List')).toBeInTheDocument();
    expect(screen.getByText('Default SMB Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SNMP Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SSH Credential')).toBeInTheDocument();
    expect(screen.queryByText('Default Schedule')).not.toBeInTheDocument();
    expect(screen.queryByText('Default Target')).not.toBeInTheDocument();
  });

  test('handles selection changes correctly', () => {
    const handleChange = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
    });

    const props = {
      alerts: [
        {id: 'a1', name: 'Alert 1'},
        {id: 'a2', name: 'Alert 2'},
      ],
      credentials: [
        {id: 'c1', name: 'Credential 1'},
        {id: 'c2', name: 'Credential 2'},
      ],
      openVasScanConfigs: [
        {id: 'sc1', name: 'Config 1'},
        {id: 'sc2', name: 'Config 2'},
      ],
      openVasScanners: [
        {id: 's1', name: 'Scanner 1'},
        {id: 's2', name: 'Scanner 2'},
      ],
      portLists: [
        {id: 'p1', name: 'PortList 1'},
        {id: 'p2', name: 'PortList 2'},
      ],
      schedules: [
        {id: 'sch1', name: 'Schedule 1'},
        {id: 'sch2', name: 'Schedule 2'},
      ],
      targets: [
        {id: 't1', name: 'Target 1'},
        {id: 't2', name: 'Target 2'},
      ],
      onChange: handleChange,
    };

    render(<DefaultsPart {...props} />);

    const alertForm = screen.getByText('Default Alert').closest('div');
    expect(alertForm).toBeInTheDocument();

    const esxiForm = screen.getByText('Default ESXi Credential').closest('div');
    expect(esxiForm).toBeInTheDocument();

    handleChange('a2', 'defaultAlert');
    expect(handleChange).toHaveBeenCalledWith('a2', 'defaultAlert');

    handleChange('c2', 'defaultEsxiCredential');
    expect(handleChange).toHaveBeenCalledWith('c2', 'defaultEsxiCredential');
  });

  test('renders with empty arrays', () => {
    const handleChange = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
    });

    const props = {
      alerts: [],
      credentials: [],
      openVasScanConfigs: [],
      openVasScanners: [],
      portLists: [],
      schedules: [],
      targets: [],
      onChange: handleChange,
    };

    render(<DefaultsPart {...props} />);

    expect(screen.getByText('Default Alert')).toBeInTheDocument();
    expect(screen.getByText('Default ESXi Credential')).toBeInTheDocument();
    expect(screen.getByText('Default OpenVAS Scan Config')).toBeInTheDocument();
    expect(screen.getByText('Default OpenVAS Scanner')).toBeInTheDocument();
    expect(screen.getByText('Default Port List')).toBeInTheDocument();
    expect(screen.getByText('Default SMB Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SNMP Credential')).toBeInTheDocument();
    expect(screen.getByText('Default SSH Credential')).toBeInTheDocument();
    expect(screen.getByText('Default Schedule')).toBeInTheDocument();
    expect(screen.getByText('Default Target')).toBeInTheDocument();

    const selects = screen.getAllByTestId('form-select');
    expect(selects.length).toBe(10);
  });

  test.each([
    {
      capability: 'alert',
      capabilityName: 'get_alerts',
      expected: ['Default Alert'],
    },
    {
      capability: 'credential',
      capabilityName: 'get_credentials',
      expected: [
        'Default ESXi Credential',
        'Default SMB Credential',
        'Default SNMP Credential',
        'Default SSH Credential',
      ],
    },
    {
      capability: 'scanconfig',
      capabilityName: 'get_configs',
      expected: ['Default OpenVAS Scan Config'],
    },
    {
      capability: 'scanner',
      capabilityName: 'get_scanners',
      expected: ['Default OpenVAS Scanner'],
    },
    {
      capability: 'portlist',
      capabilityName: 'get_port_lists',
      expected: ['Default Port List'],
    },
    {
      capability: 'schedule',
      capabilityName: 'get_schedules',
      expected: ['Default Schedule'],
    },
    {
      capability: 'target',
      capabilityName: 'get_targets',
      expected: ['Default Target'],
    },
  ])(
    'shows fields when $capability capability is available',
    ({capability, capabilityName, expected}) => {
      const handleChange = testing.fn();

      const capabilities = new Capabilities([capabilityName]);

      const {render} = rendererWith({
        capabilities,
      });

      const props = {
        alerts: [
          {id: 'a1', name: 'Alert 1'},
          {id: 'a2', name: 'Alert 2'},
        ],
        credentials: [
          {id: 'c1', name: 'Credential 1'},
          {id: 'c2', name: 'Credential 2'},
        ],
        openVasScanConfigs: [
          {id: 'sc1', name: 'Config 1'},
          {id: 'sc2', name: 'Config 2'},
        ],
        openVasScanners: [
          {id: 's1', name: 'Scanner 1'},
          {id: 's2', name: 'Scanner 2'},
        ],
        portLists: [
          {id: 'p1', name: 'PortList 1'},
          {id: 'p2', name: 'PortList 2'},
        ],
        schedules: [
          {id: 'sch1', name: 'Schedule 1'},
          {id: 'sch2', name: 'Schedule 2'},
        ],
        targets: [
          {id: 't1', name: 'Target 1'},
          {id: 't2', name: 'Target 2'},
        ],
        onChange: handleChange,
      };

      render(<DefaultsPart {...props} />);

      expected.forEach(label => {
        const elements = screen.queryAllByText(
          new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        );
        expect(elements.length).toBeGreaterThan(0);
      });

      const allLabels = [
        'Default Alert',
        'Default ESXi Credential',
        'Default OpenVAS Scan Config',
        'Default OpenVAS Scanner',
        'Default Port List',
        'Default SMB Credential',
        'Default SNMP Credential',
        'Default SSH Credential',
        'Default Schedule',
        'Default Target',
      ];

      allLabels
        .filter(label => !expected.includes(label))
        .forEach(label => {
          const regex = new RegExp(
            label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i',
          );
          const elements = screen.queryAllByText(regex);
          expect(elements.length).toBe(0);
        });
    },
  );
});
