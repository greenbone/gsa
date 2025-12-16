/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Cpe from 'gmp/models/cpe';
import CpeDetailsPageToolBarIcons from 'web/pages/cpes/CpeDetailsPageToolBarIcons';

const cpe = Cpe.fromElement({
  _id: 'cpe:/a:foo',
  name: 'foo',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  update_time: '2019-06-24T10:12:27Z',
  cpe: {
    cve_refs: 3,
    cves: {
      cve: [
        {entry: {cvss: {base_metrics: {score: 9.7}}, _id: 'CVE-2020-1234'}},
        {entry: {cvss: {base_metrics: {score: 5.4}}, _id: 'CVE-2020-5678'}},
        {entry: {cvss: {base_metrics: {score: 1.8}}, _id: 'CVE-2019-5678'}},
      ],
    },
    title: 'bar',
    severity: 9.8,
    nvd_id: '',
  },
});
const manualUrl = 'test/';

describe('CpeDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleCpeDownload = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: true,
      router: true,
    });

    render(
      <CpeDetailsPageToolBarIcons
        entity={cpe}
        onCpeDownloadClick={handleCpeDownload}
      />,
    );

    expect(screen.getByTitle('Help: CPEs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(screen.getByTitle('CPE List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/cpes',
    );
    expect(screen.getByTitle('Export CPE')).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleCpeDownload = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: true,
      router: true,
    });

    render(
      <CpeDetailsPageToolBarIcons
        entity={cpe}
        onCpeDownloadClick={handleCpeDownload}
      />,
    );

    const exportIcon = screen.getByTitle('Export CPE');
    fireEvent.click(exportIcon);
    expect(handleCpeDownload).toHaveBeenCalledWith(cpe);
  });
});
