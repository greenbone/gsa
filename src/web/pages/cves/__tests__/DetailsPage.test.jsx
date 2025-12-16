/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import Cve from 'gmp/models/cve';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
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

    expect(screen.getByTitle('Export CVE')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /CVE: CVE-2020-9997/}),
    ).toBeInTheDocument();

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      'CVE-2020-9997',
    );
    expect(
      entityInfo.getByRole('row', {name: /^Published:/}),
    ).toHaveTextContent('Thu, Oct 22, 2020 7:15 PM Coordinated Universal Time');
    expect(entityInfo.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
      'Fri, Oct 30, 2020 11:44 AM Coordinated Universal Time',
    );
    expect(
      entityInfo.getByRole('row', {name: /^Last updated:/}),
    ).toHaveTextContent('Mon, Oct 26, 2020 8:27 PM Coordinated Universal Time');

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /^Description/}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^An information disclosure issue/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', {name: /^CVSS/})).toBeInTheDocument();
    expect(screen.getByRole('row', {name: /^Base Score/})).toHaveTextContent(
      '5.5 (Medium)',
    );
    expect(screen.getByRole('row', {name: /^Base Vector/})).toHaveTextContent(
      'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
    );
    expect(screen.getByRole('row', {name: /^Attack Vector/})).toHaveTextContent(
      'Local',
    );
    expect(
      screen.getByRole('row', {name: /^Attack Complexity/}),
    ).toHaveTextContent('Low');
    expect(
      screen.getByRole('row', {name: /^Privileges Required/}),
    ).toHaveTextContent('None');
    expect(
      screen.getByRole('row', {name: /^User Interaction/}),
    ).toHaveTextContent('Required');
    expect(screen.getByRole('row', {name: /^Scope/})).toHaveTextContent(
      'Unchanged',
    );
    expect(
      screen.getByRole('row', {name: /^Confidentiality Impact/}),
    ).toHaveTextContent('High');
    expect(
      screen.getByRole('row', {name: /^Integrity Impact/}),
    ).toHaveTextContent('None');
    expect(
      screen.getByRole('row', {name: /^Availability Impact/}),
    ).toHaveTextContent('None');

    expect(screen.getByRole('heading', {name: /^EPSS/})).toBeInTheDocument();
    expect(screen.getByRole('row', {name: /^Score/})).toHaveTextContent(
      '50.000%',
    );
    expect(screen.getByRole('row', {name: /Percentile/})).toHaveTextContent(
      '75th',
    );

    expect(
      screen.getByRole('heading', {name: 'References'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', {name: /MISC.*HT211289/})).toHaveTextContent(
      'https://support.apple.com/kb/HT211289',
    );
    expect(screen.getByRole('row', {name: /MISC.*HT211291/})).toHaveTextContent(
      'https://support.apple.com/kb/HT211291',
    );

    expect(
      screen.getByRole('heading', {
        name: /CERT Advisories referencing this CVE/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', {name: /^CB-K20\/0730/})).toHaveTextContent(
      'Apple macOS: Mehrere Schwachstellen',
    );

    expect(
      screen.getByRole('heading', {name: /^Vulnerable Products/}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('cpe:/o:apple:mac_os_x:10.15.5'),
    ).toBeInTheDocument();
    expect(screen.getByText('cpe:/o:apple:watchos:6.2.8')).toBeInTheDocument();
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

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
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
