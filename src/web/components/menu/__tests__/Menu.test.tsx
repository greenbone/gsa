/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Features, {type Feature} from 'gmp/capabilities/features';
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
    ['Alerts', 'Configuration'],
    ['CERT-Bund Advisories', 'Security Information'],
    ['Compliance Audit Reports', 'Resilience'],
    ['Compliance Audits', 'Resilience'],
    ['Compliance Policies', 'Resilience'],
    ['CPEs', 'Security Information'],
    ['Credentials', 'Configuration'],
    ['CVEs', 'Security Information'],
    ['CVSS Calculator', 'Help'],
    ['DFN-CERT Advisories', 'Security Information'],
    ['Feed Status', 'Administration'],
    ['Filters', 'Configuration'],
    ['Groups', 'Administration'],
    ['LDAP', 'Administration'],
    ['Notes', 'Scans'],
    ['NVTs', 'Security Information'],
    ['Overrides', 'Scans'],
    ['Performance', 'Administration'],
    ['Permissions', 'Administration'],
    ['Port Lists', 'Configuration'],
    ['RADIUS', 'Administration'],
    ['Remediation Tickets', 'Resilience'],
    ['Report Configs', 'Configuration'],
    ['Report Formats', 'Configuration'],
    ['Reports', 'Scans'],
    ['Results', 'Scans'],
    ['Roles', 'Administration'],
    ['Scan Configs', 'Configuration'],
    ['Scanners', 'Configuration'],
    ['Schedules', 'Configuration'],
    ['Tags', 'Configuration'],
    ['Targets', 'Configuration'],
    ['Tasks', 'Scans'],
    ['Trashcan', 'Administration'],
    ['Users', 'Administration'],
    ['Vulnerabilities', 'Scans'],
  ])('should render sub-menu: %s', async (label, section) => {
    renderMenuWith({
      capabilities: new EverythingCapabilities(),
      gmpSettings: {
        enableAssetManagement: false,
        reloadInterval: 5000,
        reloadIntervalActive: 5000,
        reloadIntervalInactive: 5000,
      },
    });
    fireEvent.click(screen.getByText(section));

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
      fireEvent.click(screen.getByText('Configuration'));

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
