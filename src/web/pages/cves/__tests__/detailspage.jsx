/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';

import Cve from 'gmp/models/cve';

import {entityLoadingActions} from 'web/store/entities/cves';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import CvePage from '../detailspage';

const entity_v2 = Cve.fromElement({
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
      percentile: 0.75,
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

const caps = new Capabilities(['everything']);

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const reloadInterval = 1;
const manualUrl = 'test/';

describe('CVE Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const getCve = testing.fn().mockResolvedValue({
      data: entity_v2,
    });

    const gmp = {
      cve: {
        get: getCve,
      },
      reloadInterval,
      settings: {
        manualUrl,
        enableEPSS: true,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('CVE-2020-9997', entity_v2));

    const {baseElement, getAllByTestId} = render(
      <CvePage id="CVE-2020-9997" />,
    );

    expect(baseElement).toHaveTextContent('Score0.50000');
    expect(baseElement).toHaveTextContent('Percentage75.000%');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CVEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cve',
    );

    expect(icons[1]).toHaveAttribute('title', 'CVE List');
    expect(links[1]).toHaveAttribute('href', '/cves');

    expect(icons[2]).toHaveAttribute('title', 'Export CVE');

    expect(baseElement).toHaveTextContent('CVE: CVE-2020-9997');

    expect(baseElement).toHaveTextContent('CVE-2020-9997');
    expect(baseElement).toHaveTextContent(
      'Published:Thu, Oct 22, 2020 7:15 PM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Fri, Oct 30, 2020 11:44 AM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Last updated:Mon, Oct 26, 2020 8:27 PM UTC',
    );

    expect(baseElement).toHaveTextContent('Attack VectorLocal');
    expect(baseElement).toHaveTextContent('Attack ComplexityLow');
    expect(baseElement).toHaveTextContent('Privileges RequiredNone');
    expect(baseElement).toHaveTextContent('User InteractionRequired');
    expect(baseElement).toHaveTextContent('ScopeUnchanged');
    expect(baseElement).toHaveTextContent('Confidentiality ImpactHigh');
    expect(baseElement).toHaveTextContent('Integrity ImpactNone');
    expect(baseElement).toHaveTextContent('Availability ImpactNone');
    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.5 (Medium)');
    expect(baseElement).toHaveTextContent('References');
    expect(baseElement).toHaveTextContent(
      'MISChttps://support.apple.com/kb/HT211289',
    );
    expect(baseElement).toHaveTextContent(
      'MISChttps://support.apple.com/kb/HT211291',
    );
    expect(baseElement).toHaveTextContent(
      'CERT Advisories referencing this CVE',
    );
    expect(baseElement).toHaveTextContent('CB-K20/0730');
    expect(baseElement).toHaveTextContent(
      'Apple macOS: Mehrere Schwachstellen',
    );
    expect(baseElement).toHaveTextContent('Vulnerable Products');
    expect(baseElement).toHaveTextContent('cpe:/o:apple:mac_os_x:10.15.5');
    expect(baseElement).toHaveTextContent('cpe:/o:apple:watchos:6.2.8');
  });
});
