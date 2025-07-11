/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import FilterPart from 'web/pages/user-settings/Dialog/FilterPart';

describe('FilterPart', () => {
  const props = {
    alertsFilter: 'alert',
    auditReportsFilter: 'audit',
    configsFilter: 'config',
    credentialsFilter: 'credential',
    filtersFilter: 'filter',
    groupsFilter: 'group',
    hostsFilter: 'host',
    notesFilter: 'note',
    operatingSystemsFilter: 'os',
    overridesFilter: 'override',
    permissionsFilter: 'permission',
    portListsFilter: 'portList',
    reportsFilter: 'report',
    reportFormatsFilter: 'reportFormat',
    resultsFilter: 'result',
    rolesFilter: 'role',
    scannersFilter: 'scanner',
    schedulesFilter: 'schedule',
    tagsFilter: 'tag',
    targetsFilter: 'target',
    tasksFilter: 'task',
    ticketsFilter: 'ticket',
    tlsCertificatesFilter: 'tlsCertificate',
    usersFilter: 'user',
    vulnerabilitiesFilter: 'vulnerability',
    cveFilter: 'cve',
    cpeFilter: 'cpe',
    nvtFilter: 'nvt',
    certBundFilter: 'certBund',
    dfnCertFilter: 'dfnCert',
    filters: [],
    onChange: testing.fn(),
  };

  const labels = [
    'Alerts Filter',
    'Audit Reports Filter',
    'Scan Configs Filter',
    'Credentials Filter',
    'Filters Filter',
    'Groups Filter',
    'Hosts Filter',
    'Notes Filter',
    'Operating Systems Filter',
    'Overrides Filter',
    'Permissions Filter',
    'Port Lists Filter',
    'Reports Filter',
    'Report Formats Filter',
    'Results Filter',
    'Roles Filter',
    'Scanners Filter',
    'Schedules Filter',
    'Tags Filter',
    'Targets Filter',
    'Tasks Filter',
    'Tickets Filter',
    'TLS Certificates Filter',
    'Users Filter',
    'Vulnerabilities Filter',
    'CPE Filter',
    'CVE Filter',
    'NVT Filter',
    'CERT-Bund Advisories Filter',
    'DFN-CERT Advisories Filter',
  ];

  test('renders all filters form groups and selects', () => {
    render(<FilterPart {...props} />);
    const selects = screen.getAllByTestId('form-select');
    expect(selects).toHaveLength(labels.length);
  });

  test('renders all filter labels and selects correctly', () => {
    render(<FilterPart {...props} />);
    const selects = screen.getAllByTestId('form-select');

    // Check each label and corresponding select in a single render
    labels.forEach((label, idx) => {
      expect(screen.getByText(label)).toBeVisible();
      expect(selects[idx]).toBeVisible();
    });
  });
});
