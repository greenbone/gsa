/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTableBody, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential from 'gmp/models/credential';
import Scanner, {OPENVASD_SCANNER_TYPE} from 'gmp/models/scanner';
import ScannerRow from 'web/pages/scanners/ScannerRow';

describe('ScannerRow tests', () => {
  test('should render scanner row', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      credential: new Credential({id: '5678', name: 'Test Credential'}),
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(<ScannerRow entity={scanner} />);

    expect(screen.getByText('Test Scanner')).toBeInTheDocument();
    expect(screen.getByText('http://scanner-host')).toBeInTheDocument();
    expect(screen.getByText('443')).toBeInTheDocument();
    expect(screen.getByText('OpenVASD Scanner')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();
  });

  test('should call onToggleDetailsClick when clicking on the entity name', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      credential: new Credential({id: '5678', name: 'Test Credential'}),
    });
    const onToggleDetailsClick = testing.fn();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <ScannerRow
        entity={scanner}
        onToggleDetailsClick={onToggleDetailsClick}
      />,
    );

    const nameElement = screen.getByText('Test Scanner');
    fireEvent.click(nameElement);
    expect(onToggleDetailsClick).toHaveBeenCalledWith(scanner, '1234');
  });

  test("should render default actions component if it's not provided", () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      credential: new Credential({id: '5678', name: 'Test Credential'}),
      userCapabilities: new EverythingCapabilities(),
    });
    const handleCloneClick = testing.fn();
    const handleEditClick = testing.fn();
    const handleDeleteClick = testing.fn();
    const handleVerifyClick = testing.fn();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <ScannerRow
        entity={scanner}
        onScannerCloneClick={handleCloneClick}
        onScannerDeleteClick={handleDeleteClick}
        onScannerEditClick={handleEditClick}
        onScannerVerifyClick={handleVerifyClick}
      />,
    );

    expect(screen.getByRole('button', {name: 'Edit Icon'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Clone Icon'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Delete Icon'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Verify Icon'}),
    ).toBeInTheDocument();
  });

  test("should render actions component if it's provided", () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      credential: new Credential({id: '5678', name: 'Test Credential'}),
    });
    const ActionsComponent = ({entity}) => (
      <td>
        <button type="button">Action for {entity.name}</button>
      </td>
    );
    const {render} = rendererWithTableBody({capabilities: true});
    render(<ScannerRow actionsComponent={ActionsComponent} entity={scanner} />);

    expect(screen.getByText('Action for Test Scanner')).toBeInTheDocument();
  });
});
