/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, wait, rendererWith} from 'web/testing';
import Capabilities, {type Capability} from 'gmp/capabilities/capabilities';
import {type EntityType} from 'gmp/utils/entitytype';
import DefaultSettings from 'web/pages/user-settings/DefaultsSettings';

describe('DefaultSettings', () => {
  test('renders correctly with all capabilities', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp: {settings: {manualUrl: 'test/'}},
    });

    render(<DefaultSettings />);

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
    const capabilities = new Capabilities([
      'get_credentials',
      'get_port_lists',
    ]);

    const {render} = rendererWith({
      capabilities,
      gmp: {settings: {manualUrl: 'test/'}},
    });

    render(<DefaultSettings />);

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

  test('handles selection changes correctly', async () => {
    const defaultAlertSetting = {
      id: 'a1',
      name: 'defaultalert',
      value: 'a1',
      comment: 'Default alert comment',
    };
    const defaultEsxiCredentialSetting = {
      id: 'c1',
      name: 'defaultesxicredential',
      value: 'c1',
      comment: 'Default ESXi credential comment',
    };
    const settingsData = {
      defaultalert: defaultAlertSetting,
      defaultesxicredential: defaultEsxiCredentialSetting,
      getByName: (name: string) => settingsData[name],
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp: {
        settings: {manualUrl: 'test/'},
        user: {
          getSetting: testing.fn().mockResolvedValue({data: {value: 'a2'}}),
          saveSetting: testing.fn().mockResolvedValue({data: {value: 'a2'}}),
        },
      },
      store: true,
      router: true,
    });

    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: settingsData,
    });

    render(<DefaultSettings />);
    const editButtons = screen.getAllByRole('button', {name: /edit/i});
    fireEvent.click(editButtons[0]);
    await wait();
    const selectAlert = screen.getByTestId('form-select');
    fireEvent.change(selectAlert, {target: {value: 'a2'}});
    await wait();
    const saveButtonAlert = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButtonAlert);
    await wait();
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: {
        ...settingsData,
        defaultalert: {
          ...defaultAlertSetting,
          value: 'a2',
        },
      },
    });
    await wait();
    const alertLink = screen.getAllByTestId('details-link')[0];
    expect(alertLink).toHaveAttribute('href', '/alert/a2');

    fireEvent.click(editButtons[1]);
    await wait();
    const selectEsxi = screen.getByTestId('form-select');
    fireEvent.change(selectEsxi, {target: {value: 'c2'}});
    await wait();
    const saveButtonEsxi = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButtonEsxi);
    await wait();
    store.dispatch({
      type: 'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS',
      data: {
        ...settingsData,
        defaultesxicredential: {
          ...defaultEsxiCredentialSetting,
          value: 'c2',
        },
      },
    });
    await wait();
    const esxiLink = screen.getAllByTestId('details-link')[1];
    expect(esxiLink).toHaveAttribute('href', '/credential/c2');
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
  ] as {
    capability: EntityType;
    capabilityName: Capability;
    expected: string[];
  }[])(
    'shows fields when $capability capability is available',
    ({capabilityName, expected}) => {
      const capabilities = new Capabilities([capabilityName]);

      const {render} = rendererWith({
        capabilities,
        gmp: {settings: {manualUrl: 'test/'}},
      });

      render(<DefaultSettings />);

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
