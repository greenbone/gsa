/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Cve from 'gmp/models/cve';
import CveDetailsPageToolBarIcons from 'web/pages/cves/CveDetailsPageToolBarIcons';

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
  update_time: '2020-10-30T11:44:00.000+0000',
  cve: {
    severity: 5.5,
    cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
    description:
      'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
    products: 'cpe:/o:apple:mac_os_x:10.15.5 cpe:/o:apple:watchos:6.2.8',
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
      },
    },
  },
});

const manualUrl = 'test/';

describe('CveDetailsPageToolBarIcons tests', () => {
  test('should render all icons', () => {
    const gmp = {settings: {manualUrl}};
    const handleCveDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });
    render(
      <CveDetailsPageToolBarIcons
        entity={cve}
        onCveDownloadClick={handleCveDownloadClick}
      />,
    );

    expect(screen.getByTitle('Help: CVEs')).toBeInTheDocument();
    expect(screen.getByTitle('CVE List')).toBeInTheDocument();
    expect(screen.getByTitle('Export CVE')).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const gmp = {settings: {manualUrl}};
    const handleCveDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });
    render(
      <CveDetailsPageToolBarIcons
        entity={cve}
        onCveDownloadClick={handleCveDownloadClick}
      />,
    );

    const exportIcon = screen.getByTitle('Export CVE');
    fireEvent.click(exportIcon);
    expect(handleCveDownloadClick).toHaveBeenCalledWith(cve);
  });
});
