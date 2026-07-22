/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWithTableBody, screen} from 'web/testing';
import Vulnerability from 'gmp/models/vulnerability';
import {createSession} from 'gmp/testing';
import VulnsRow from 'web/pages/vulns/VulnsRow';

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
  resultsOldest = '2024-01-01T00:00:00Z',
  resultsNewest = '2024-06-01T00:00:00Z',
}: {
  id: string;
  name: string;
  severity?: number;
  qod?: number;
  resultsCount?: number;
  hostsCount?: number;
  resultsOldest?: string;
  resultsNewest?: string;
}) =>
  Vulnerability.fromElement({
    _id: id,
    name,
    severity,
    qod,
    results: {
      count: resultsCount,
      oldest: resultsOldest,
      newest: resultsNewest,
    },
    hosts: {
      count: hostsCount,
    },
  });

describe('VulnsRow tests', () => {
  test('should render vulnerability name as a details link', () => {
    const vuln = createVulnerability({id: '1', name: 'CVE-2024-0001'});
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    const link = screen.getByRole('link', {name: 'CVE-2024-0001'});
    expect(link).toHaveAttribute('href', '/nvt/1');
  });

  test('should render vulnerability name as plain text when links is false', () => {
    const vuln = createVulnerability({id: '1', name: 'CVE-2024-0001'});
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} links={false} />);
    screen.getByText('CVE-2024-0001');
    expect(screen.queryByRole('link', {name: 'CVE-2024-0001'})).toBeNull();
  });

  test('should render oldest and newest result dates', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      resultsOldest: '2024-01-15T10:30:00Z',
      resultsNewest: '2024-06-20T14:45:00Z',
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    screen.getByText(/Jan 15, 2024/);
    screen.getByText(/Jun 20, 2024/);
  });

  test('should render severity bar', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      severity: 8.5,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    screen.getByText(/8\.5/);
  });

  test('should render QoD value', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      qod: 80,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    screen.getByText(/80/);
  });

  test('should render results count as a link', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      resultsCount: 5,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    const link = screen.getByRole('link', {name: '5'});
    expect(link).toHaveAttribute('href', '/results?filter=nvt%3D1');
  });

  test('should render results count as plain text when links is false', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      resultsCount: 5,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} links={false} />);
    screen.getByText('5');
    expect(screen.queryByRole('link', {name: '5'})).toBeNull();
  });

  test('should render hosts count', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      hostsCount: 3,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    const cells = screen.getAllByRole('cell');
    const lastCell = cells[cells.length - 2];
    expect(lastCell).toHaveTextContent('3');
  });

  test('should render with zero results and hosts', () => {
    const vuln = createVulnerability({
      id: '1',
      name: 'CVE-2024-0001',
      resultsCount: 0,
      hostsCount: 0,
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<VulnsRow entity={vuln} />);
    screen.getByText('CVE-2024-0001');
  });
});
