/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Vulnerability from 'gmp/models/vulnerability';
import {createSession} from 'gmp/testing';
import VulnsTable from 'web/pages/vulns/VulnsTable';

const createGmp = () => ({
  session: createSession(),
  settings: {
    severityRating: 'CVSSv3',
  },
});

const createVulnerability = ({
  id,
  name,
  severity = 5.0,
  qod = 70,
  resultsCount = 3,
  hostsCount = 1,
}: {
  id: string;
  name: string;
  severity?: number;
  qod?: number;
  resultsCount?: number;
  hostsCount?: number;
}) =>
  Vulnerability.fromElement({
    _id: id,
    name,
    severity,
    qod,
    results: {
      count: resultsCount,
      oldest: '2024-01-01T00:00:00Z',
      newest: '2024-06-01T00:00:00Z',
    },
    hosts: {
      count: hostsCount,
    },
  });

describe('VulnsTable tests', () => {
  test('should render without crashing', () => {
    const vulns = [
      createVulnerability({id: '1', name: 'CVE-2024-0001'}),
      createVulnerability({id: '2', name: 'CVE-2024-0002'}),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={vulns} />);
    screen.getByRole('table');
  });

  test('should render the empty title when no vulnerabilities are available', () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={[]} />);
    screen.getByText('No Vulnerabilities available');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test("should not render anything if vulnerabilities aren't available", () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    const {container} = render(<VulnsTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('should render vulnerabilities', () => {
    const vulns = [
      createVulnerability({id: '1', name: 'CVE-2024-0001'}),
      createVulnerability({id: '2', name: 'CVE-2024-0002'}),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={vulns} />);
    screen.getByText('CVE-2024-0001');
    screen.getByText('CVE-2024-0002');
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(vulns.length + 2);
  });

  test('should render vulnerability row data', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      severity: 8.5,
      qod: 80,
      resultsCount: 5,
      hostsCount: 2,
    });
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={[vuln]} />);
    screen.getByText('CVE-2024-0001');
    screen.getByText('5');
    screen.getByText('2');
  });

  test('should render details links for vulnerability names', () => {
    const vuln = createVulnerability({id: '1', name: 'CVE-2024-0001'});
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={[vuln]} />);
    const link = screen.getByRole('link', {name: 'CVE-2024-0001'});
    expect(link).toHaveAttribute('href', '/nvt/1');
  });

  test('should render results count as a link', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      resultsCount: 5,
    });
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={[vuln]} />);
    const resultsLink = screen.getByRole('link', {name: '5'});
    expect(resultsLink).toHaveAttribute('href', '/results?filter=nvt%3D1');
  });

  test('should render oldest and newest result dates', () => {
    const vuln = createVulnerability({id: '1', name: 'CVE-2024-0001'});
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<VulnsTable entities={[vuln]} />);
    screen.getByText(/Jan 1, 2024/);
    screen.getByText(/Jun 1, 2024/);
  });
});
