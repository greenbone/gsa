/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWithTableRow} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential from 'gmp/models/credential';
import Scanner, {OPENVASD_SCANNER_TYPE} from 'gmp/models/scanner';
import ScannerActions from 'web/pages/scanners/ScannerActions';
import SelectionType from 'web/utils/SelectionType';

describe('ScannerActions tests', () => {
  test('should render all action icons', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
      caPub: {certificate: 'My CA Certificate'},
      credential: new Credential({id: '5678', name: 'My Credential'}),
    });
    const {render} = rendererWithTableRow({capabilities: true});
    render(<ScannerActions entity={scanner} />);

    expect(screen.getByTitle('Move Scanner to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Export Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Verify Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Download Certificate')).toBeInTheDocument();
  });

  test('should render action icons without user capabilities', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new Capabilities(),
      caPub: {certificate: 'My CA Certificate'},
      credential: new Credential({id: '5678', name: 'My Credential'}),
    });
    const {render} = rendererWithTableRow({capabilities: true});
    render(<ScannerActions entity={scanner} />);
    // screen.debug(undefined, 999999999999);

    expect(
      screen.getByTitle('Permission to move Scanner to trashcan denied'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Permission to edit Scanner denied'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Permission to clone Scanner denied'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Export Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Verify Scanner')).toBeInTheDocument();
    expect(screen.getByTitle('Download Certificate')).toBeInTheDocument();
  });

  test('should render action icons without capabilities', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new Capabilities(),
      caPub: {certificate: 'My CA Certificate'},
      credential: new Credential({id: '5678', name: 'My Credential'}),
    });
    const {render} = rendererWithTableRow({capabilities: false});
    render(<ScannerActions entity={scanner} />);

    expect(
      screen.getByTitle('Permission to move Scanner to trashcan denied'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Permission to edit Scanner denied'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Permission to clone Scanner denied'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Export Scanner')).toBeInTheDocument();
    expect(
      screen.getByTitle('Permissions to verify Scanner denied'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Download Certificate')).toBeInTheDocument();
  });

  test('should call onScannerDeleteClick when TrashIcon is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleScannerDeleteClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerDeleteClick={handleScannerDeleteClick}
      />,
    );
    const trashIcon = screen.getByRole('button', {name: /Delete Icon/i});
    fireEvent.click(trashIcon);
    expect(handleScannerDeleteClick).toHaveBeenCalledWith(scanner);
  });

  test('should call onScannerEditClick when EditIcon is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleScannerEditClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerEditClick={handleScannerEditClick}
      />,
    );
    const editIcon = screen.getByRole('button', {name: /Edit Icon/i});
    fireEvent.click(editIcon);
    expect(handleScannerEditClick).toHaveBeenCalledWith(scanner);
  });

  test('should call onScannerCloneClick when CloneIcon is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleScannerCloneClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerCloneClick={handleScannerCloneClick}
      />,
    );
    const cloneIcon = screen.getByRole('button', {name: /Clone Icon/i});
    fireEvent.click(cloneIcon);
    expect(handleScannerCloneClick).toHaveBeenCalledWith(scanner);
  });

  test('should call onScannerDownloadClick when ExportIcon is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleScannerDownloadClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerDownloadClick={handleScannerDownloadClick}
      />,
    );
    const exportIcon = screen.getByRole('button', {name: /Export Icon/i});
    fireEvent.click(exportIcon);
    expect(handleScannerDownloadClick).toHaveBeenCalledWith(scanner);
  });

  test('should call onScannerVerifyClick when VerifyIcon is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleScannerVerifyClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerVerifyClick={handleScannerVerifyClick}
      />,
    );
    const verifyIcon = screen.getByRole('button', {name: 'Verify Icon'});
    fireEvent.click(verifyIcon);
    expect(handleScannerVerifyClick).toHaveBeenCalledWith(scanner);
  });

  test('should calls onScannerCredentialDownloadClick when DownloadKeyIcon for credential is clicked', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
      credential: new Credential({id: '5678', name: 'My Credential'}),
    });
    const handleScannerCredentialDownloadClick = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        onScannerCredentialDownloadClick={handleScannerCredentialDownloadClick}
      />,
    );
    const credentialIcon = screen.getByRole('button', {
      name: /Download Key Icon/i,
    });
    fireEvent.click(credentialIcon);
    expect(handleScannerCredentialDownloadClick).toHaveBeenCalledWith(scanner);
  });

  test('should allow to select and deselect the scanner', () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'My Scanner',
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
      caPub: {certificate: 'My CA Certificate'},
    });
    const handleSelected = testing.fn();
    const handleDeselected = testing.fn();
    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <ScannerActions
        entity={scanner}
        selectionType={SelectionType.SELECTION_USER}
        onEntityDeselected={handleDeselected}
        onEntitySelected={handleSelected}
      />,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleSelected).toHaveBeenCalledWith(scanner);
    fireEvent.click(checkbox);
    expect(handleDeselected).toHaveBeenCalledWith(scanner);
  });
});
