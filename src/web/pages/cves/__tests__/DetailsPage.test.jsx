/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import Cve from 'gmp/models/cve';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import CvePage from 'web/pages/cves/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/cves';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const cve = Cve.fromElement({
  _id: 'CVE-2020-9997',
  owner: {
    name: '',
  },
  name: 'CVE-2020-9997',
  comment: '',
  creation_time: '2020-10-22T19:15:00Z',
  modification_time: '2020-10-26T20:27:00Z',
  writable: 0,
  in_use: 0,
  permissions: '',
  update_time: '2020-10-30T11:44:00.000+0000',
  cve: {
    severity: 5.5,
    cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
    description:
      'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
    products: 'cpe:/o:apple:mac_os_x:10.15.5 cpe:/o:apple:watchos:6.2.8',
    nvts: '',
    epss: {
      score: 0.5,
      percentile: 75.0,
    },
    cert: {
      cert_ref: {
        _type: 'CERT-Bund',
        name: 'CB-K20/0730',
        title: 'Apple macOS: Mehrere Schwachstellen',
      },
    },
    raw_data: {
      entry: {
        _id: 'CVE-2020-9997',
        'vulnerable-software-list': {
          product: [
            'cpe:/o:apple:mac_os_x:10.15.5',
            'cpe:/o:apple:watchos:6.2.8',
          ],
        },
        'cve-id': 'CVE-2020-9997',
        'published-datetime': '2020-10-22T19:15:00+00:00',
        'last-modified-datetime': '2020-10-26T20:27:00+00:00',
        cvss: {
          base_metrics: {
            'integrity-impact': 'NONE',
            'access-complexity': 'MEDIUM',
            'availability-impact': 'NONE',
            'vector-string': 'AV:N/AC:M/Au:N/C:P/I:N/A:N',
            'confidentiality-impact': 'PARTIAL',
            'access-vector': 'NETWORK',
            authentication: 'NONE',
            score: 4.3,
            source: 'http://nvd.nist.gov',
            'generated-on-datetime': '2020-10-26T20:27:00+00:00',
          },
        },
        cvss3: {
          base_metrics: {
            'availability-impact': 'NONE',
            'attack-complexity': 'LOW',
            'vector-string': 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
            'integrity-impact': 'NONE',
            'user-interaction': 'REQUIRED',
            'base-score': 5.5,
            'attack-vector': 'LOCAL',
            'privileges-required': 'NONE',
            scope: 'UNCHANGED',
            'confidentiality-impact': 'HIGH',
            'base-severity': 'MEDIUM',
          },
          'generated-on-datetime': '2020-10-26T20:27:00+00:00',
        },
        cwe: {
          _id: 'NVD-CWE-noinfo',
        },
        references: [
          {
            source: 'MISC',
            reference: {
              __text: 'https://support.apple.com/kb/HT211289',
              _href: 'https://support.apple.com/kb/HT211289',
            },
          },
          {
            source: 'MISC',
            reference: {
              __text: 'https://support.apple.com/kb/HT211291',
              _href: 'https://support.apple.com/kb/HT211291',
            },
          },
        ],
        summary:
          'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
      },
    },
  },
});

const reloadInterval = 1;
const manualUrl = 'test/';

const createGmp = ({
  getCveResponse = new Response(cve),
  currentSettingsResponse = currentSettingsDefaultResponse,
  exportCveResponse = new Response({foo: 'bar'}),
  getCve = testing.fn().mockResolvedValue(getCveResponse),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  exportCve = testing.fn().mockResolvedValue(exportCveResponse),
} = {}) => {
  return {
    cve: {
      get: getCve,
      export: exportCve,
    },
    reloadInterval,
    settings: {
      manualUrl,
      enableEPSS: true,
    },
    user: {
      currentSettings,
    },
  };
};

describe('CveDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('CVE-2020-9997', cve));

    render(<CvePage id="CVE-2020-9997" />);

    expect(screen.getByTitle('CVE List')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cve',
    );
    expect(screen.getByTitle('CVE List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/cves',
    );

    screen.getByTitle('Export CVE');

    screen.getByRole('heading', {name: /CVE: CVE-2020-9997/});

    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent('CVE-2020-9997');
    expect(infoRows[1]).toHaveTextContent(
      'Thu, Oct 22, 2020 7:15 PM Coordinated Universal Time',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Fri, Oct 30, 2020 11:44 AM Coordinated Universal Time',
    );
    expect(infoRows[3]).toHaveTextContent(
      'Mon, Oct 26, 2020 8:27 PM Coordinated Universal Time',
    );

    const tablist = screen.getByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});

    screen.getByRole('heading', {name: /^Description/});
    screen.getByText(/^An information disclosure issue/i);

    screen.getByRole('heading', {name: /^CVSS/});
    screen.getByText('5.5 (Medium)');
    screen.getByText('CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N');
    screen.getByText('Local');
    screen.getByText('Low');
    // Note: 'None' appears multiple times (Privileges Required, Integrity, Availability)
    screen.getByText('Required');
    screen.getByText('Unchanged');
    screen.getByText('High');
    // Note: Two instances of 'None' exist for Integrity and Availability

    screen.getByRole('heading', {name: /^EPSS/});
    screen.getByText('50.000%');
    screen.getByText('75th');

    screen.getByRole('heading', {name: 'References'});
    screen.getByText('https://support.apple.com/kb/HT211289');
    screen.getByText('https://support.apple.com/kb/HT211291');

    screen.getByText(/CERT Advisories referencing this CVE/);
    screen.getByText('Apple macOS: Mehrere Schwachstellen');

    screen.getByRole('heading', {name: /^Vulnerable Products/});
    screen.getByText('cpe:/o:apple:mac_os_x:10.15.5');
    screen.getByText('cpe:/o:apple:watchos:6.2.8');
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('CVE-2020-9997', cve));

    const {container} = render(<CvePage id="CVE-2020-9997" />);

    const tablist = screen.getByRole('tablist');
    const userTagsTab = within(tablist).getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('CVE-2020-9997', cve));

    render(<CvePage id="CVE-2020-9997" />);

    const exportIcon = screen.getByTitle('Export CVE');
    fireEvent.click(exportIcon);
    expect(gmp.cve.export).toHaveBeenCalledWith(cve);
  });
});
