/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Credential from 'gmp/models/credential';
import ScanConfig from 'gmp/models/scanconfig';
import Scanner, {
  CVE_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import Task from 'gmp/models/task';
import ScannerDetails from 'web/pages/scanners/ScannerDetails';

describe('ScannerDetails tests', () => {
  test('should render scanner details for openvas scanner', () => {
    const scanner = new Scanner({
      id: '1234',
      comment: 'Some Comment',
      name: 'Test Scanner',
      host: '/var/run/ospd/ospd-openvas.sock',
      scannerType: OPENVAS_SCANNER_TYPE,
      caPub: {certificate: 'Test CA Certificate'},
      credential: new Credential({id: '5678', name: 'Test Credential'}),
      tasks: [
        new Task({id: '1', name: 'Task 1'}),
        new Task({id: '2', name: 'Task 2'}),
      ],
      configs: [
        new ScanConfig({id: '1', name: 'Config 1'}),
        new ScanConfig({id: '2', name: 'Config 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerDetails entity={scanner} />);

    expect(screen.getByText('Some Comment')).toBeInTheDocument();
    expect(screen.getByText('OpenVAS Scanner')).toBeInTheDocument();

    expect(screen.queryByText('Host')).not.toBeInTheDocument();
    expect(screen.queryByText('Port')).not.toBeInTheDocument();

    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();

    expect(screen.getByText('Tasks using this Scanner')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    expect(
      screen.getByText('Scan Configs using this Scanner'),
    ).toBeInTheDocument();
    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();

    expect(
      screen.queryByText('Client Certificate (from Credential)'),
    ).not.toBeInTheDocument();
  });

  test('should render scanner details for openvasd scanner', () => {
    const scanner = new Scanner({
      id: '1234',
      comment: 'Some Comment',
      name: 'Test Scanner',
      host: '127.0.0.1',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      caPub: {certificate: 'Test CA Certificate'},
      credential: new Credential({
        id: '5678',
        name: 'Test Credential',
        certificate_info: {issuer: 'Test Issuer'},
      }),
      tasks: [
        new Task({id: '1', name: 'Task 1'}),
        new Task({id: '2', name: 'Task 2'}),
      ],
      configs: [
        new ScanConfig({id: '1', name: 'Config 1'}),
        new ScanConfig({id: '2', name: 'Config 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerDetails entity={scanner} />);

    expect(screen.getByText('Some Comment')).toBeInTheDocument();
    expect(screen.getByText('OpenVASD Scanner')).toBeInTheDocument();

    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('443')).toBeInTheDocument();

    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();

    expect(screen.getByText('Tasks using this Scanner')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    expect(
      screen.getByText('Scan Configs using this Scanner'),
    ).toBeInTheDocument();
    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();

    expect(
      screen.queryByText('Client Certificate (from Credential)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Issuer')).toBeInTheDocument();
  });

  test('should render scanner details for cve scanner', () => {
    const scanner = new Scanner({
      id: '1234',
      comment: 'Some Comment',
      name: 'Test Scanner',
      scannerType: CVE_SCANNER_TYPE,
      tasks: [
        new Task({id: '1', name: 'Task 1'}),
        new Task({id: '2', name: 'Task 2'}),
      ],
      configs: [
        new ScanConfig({id: '1', name: 'Config 1'}),
        new ScanConfig({id: '2', name: 'Config 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerDetails entity={scanner} />);

    expect(screen.getByText('Some Comment')).toBeInTheDocument();
    expect(screen.getByText('CVE Scanner')).toBeInTheDocument();

    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Port')).toBeInTheDocument();

    expect(screen.queryAllByText('N/A (Builtin Scanner)').length).toBe(2);

    expect(screen.queryByText('Credential')).not.toBeInTheDocument();

    expect(screen.getByText('Tasks using this Scanner')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    expect(
      screen.getByText('Scan Configs using this Scanner'),
    ).toBeInTheDocument();
    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();

    expect(
      screen.queryByText('Client Certificate (from Credential)'),
    ).not.toBeInTheDocument();
  });

  test('should not render optional fields when not defined', () => {
    const minimalScanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerDetails entity={minimalScanner} />);

    expect(screen.getByText('OpenVASD Scanner')).toBeInTheDocument();
    expect(screen.queryByText('Host')).toBeInTheDocument();
    expect(screen.queryByText('Port')).toBeInTheDocument();

    expect(screen.queryByText('Comment')).not.toBeInTheDocument();
    expect(screen.queryByText('Credential')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Tasks using this Scanner'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Scan Configs using this Scanner'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Client Certificate (from Credential)'),
    ).not.toBeInTheDocument();
  });
});
