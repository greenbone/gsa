/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, describe, expect, test, testing} from '@gsa/testing';
import React from 'react';
import {rendererWith} from 'web/utils/Testing';

testing.mock('web/hooks/useTranslation', () => ({
  default: () => [key => key],
}));

testing.mock('@greenbone/opensight-ui-components-mantinev7', () => ({
  AppNavigation: ({menuPoints}) => {
    return (
      <ul>
        {menuPoints?.flat().map((item, index) =>
          item ? (
            <li key={index}>
              {item.label}
              {item.subNav?.map((subItem, i) => (
                <ul key={i}>
                  <li>{subItem.label}</li>
                </ul>
              ))}
            </li>
          ) : null,
        )}
      </ul>
    );
  },
}));

afterEach(() => {
  testing.clearAllMocks();
});

/**
 * Dynamically import the Menu module to bust the cache between tests
 */
const importFreshMenu = async () => {
  const {default: Menu} = await import(
    /* @vite-ignore */ `web/components/menu/Menu?cacheBust=${Date.now()}`
  );
  return Menu;
};

const renderMenuWith = async ({capabilities, gmpSettings}) => {
  testing.mock('web/hooks/useCapabilities', () => {
    return {
      default: () => {
        return capabilities;
      },
    };
  });

  testing.mock('web/hooks/useGmp', () => ({
    default: () => ({
      settings: gmpSettings,
    }),
  }));

  const Menu = await importFreshMenu();
  const {render} = rendererWith();
  return render(<Menu />);
};

describe('Menu rendering', () => {
  test('should render full menu with mocked capabilities', async () => {
    const {getByText} = await renderMenuWith({
      capabilities: {
        mayAccess: () => true,
        mayOp: () => true,
        featureEnabled: () => true,
      },
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    const topLevelMenus = [
      'Dashboards',
      'Scans',
      'Assets',
      'Resilience',
      'Security Information',
      'Configuration',
      'Administration',
      'Help',
    ];

    const subMenus = [
      'Tasks',
      'Reports',
      'Results',
      'Vulnerabilities',
      'Notes',
      'Overrides',
      'Remediation Tickets',
      'Compliance Policies',
      'Compliance Audits',
      'Compliance Audit Reports',
      'NVTs',
      'CVEs',
      'CPEs',
      'CERT-Bund Advisories',
      'DFN-CERT Advisories',
      'Targets',
      'Port Lists',
      'Credentials',
      'Scan Configs',
      'Alerts',
      'Schedules',
      'Report Configs',
      'Report Formats',
      'Scanners',
      'Filters',
      'Tags',
      'Users',
      'Groups',
      'Roles',
      'Permissions',
      'Performance',
      'Trashcan',
      'Feed Status',
      'LDAP',
      'RADIUS',
      'CVSS Calculator',
      'About',
    ];

    topLevelMenus.forEach(label => {
      expect(getByText(label)).toBeInTheDocument();
    });

    subMenus.forEach(label => {
      expect(getByText(label)).toBeInTheDocument();
    });
  });

  test('should not render Remediation Tickets when mayAccess returns false', async () => {
    const {queryByText} = await renderMenuWith({
      capabilities: {
        mayAccess: feature => {
          return feature !== 'tickets';
        },
        mayOp: () => true,
        featureEnabled: () => true,
      },
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    expect(queryByText('Remediation Tickets')).not.toBeInTheDocument();
  });

  test('should not render Configuration menu when none of its mayAccess permissions are true', async () => {
    const configFeatures = [
      'targets',
      'port_lists',
      'credentials',
      'scan_configs',
      'alerts',
      'schedules',
      'report_configs',
      'report_formats',
      'scanners',
      'filters',
      'tags',
    ];

    const {queryByText} = await renderMenuWith({
      capabilities: {
        mayAccess: feature => {
          return !configFeatures.includes(feature);
        },
        mayOp: () => true,
        featureEnabled: () => true,
      },
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    expect(queryByText('Configuration')).not.toBeInTheDocument();
  });

  test('should not render Asset menu when enableAssetManagement is false', async () => {
    const {queryByText} = await renderMenuWith({
      capabilities: {
        mayAccess: () => false,
        mayOp: () => false,
        featureEnabled: () => false,
      },
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    expect(queryByText('Asset')).not.toBeInTheDocument();
  });
});
