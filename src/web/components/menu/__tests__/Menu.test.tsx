/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Features, {Feature} from 'gmp/capabilities/features';
import {isDefined} from 'gmp/utils/identity';
import Menu from 'web/components/menu/Menu';

const renderMenuWith = ({
  capabilities,
  gmpSettings,
  features,
}: {
  capabilities: true | false | Capabilities;
  gmpSettings: Record<string, unknown>;
  features?: Feature[];
}) => {
  const gmp = {
    settings: gmpSettings,
  };

  const {render} = rendererWith({
    capabilities,
    gmp,
    router: true,
    features: isDefined(features) ? new Features(features) : undefined,
  });
  return render(<Menu />);
};

describe('Menu rendering', () => {
  test.each([
    'Dashboards',
    'Scans',
    'Assets',
    'Resilience',
    'Security Information',
    'Configuration',
    'Administration',
    'Help',
  ])('should render top-level menu: %s', async label => {
    renderMenuWith({
      capabilities: new EverythingCapabilities(),
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test.each([
    'Alerts',
    'CERT-Bund Advisories',
    'Compliance Audit Reports',
    'Compliance Audits',
    'Compliance Policies',
    'CPEs',
    'Credentials',
    'CVEs',
    'CVSS Calculator',
    'DFN-CERT Advisories',
    'Feed Status',
    'Filters',
    'Groups',
    'LDAP',
    'Notes',
    'NVTs',
    'Overrides',
    'Performance',
    'Permissions',
    'Port Lists',
    'RADIUS',
    'Remediation Tickets',
    'Report Configs',
    'Report Formats',
    'Reports',
    'Results',
    'Roles',
    'Scan Configs',
    'Scanners',
    'Schedules',
    'Tags',
    'Targets',
    'Tasks',
    'Trashcan',
    'Users',
    'Vulnerabilities',
  ])('should render sub-menu: %s', async label => {
    renderMenuWith({
      capabilities: new EverythingCapabilities(),
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test.each(['Agents', 'Agent Groups'])(
    'should render sub-menu: %s',
    async label => {
      renderMenuWith({
        capabilities: true,
        features: ['ENABLE_AGENTS'],
        gmpSettings: {
          enableAssetManagement: false,
        },
      });

      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );

  test.each(['Agents', 'Agent Groups'])(
    'should not render sub-menu %s if feature is missing',
    async label => {
      renderMenuWith({
        capabilities: true,
        gmpSettings: {
          enableAssetManagement: false,
        },
      });

      expect(screen.queryByText(label)).not.toBeInTheDocument();
    },
  );

  test.each(['Remediation Tickets', 'Configuration', 'Agent', 'Agent Group'])(
    'should not render %s when mayAccess returns false',
    async text => {
      renderMenuWith({
        capabilities: new Capabilities(),
        gmpSettings: {
          enableAssetManagement: false,
          reloadInterval: 5000,
          reloadIntervalActive: 5000,
          reloadIntervalInactive: 5000,
        },
      });

      expect(screen.queryByText(text)).not.toBeInTheDocument();
    },
  );

  test('should not render Asset menu when enableAssetManagement is false', async () => {
    renderMenuWith({
      capabilities: new EverythingCapabilities(),
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });
    expect(screen.queryByText('Asset')).not.toBeInTheDocument();
  });
});
