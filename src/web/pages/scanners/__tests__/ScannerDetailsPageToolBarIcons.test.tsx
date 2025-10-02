/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Features from 'gmp/capabilities/features';
import Credential from 'gmp/models/credential';
import Scanner, {OPENVAS_SCANNER_TYPE} from 'gmp/models/scanner';
import ScannerDetailsPageToolBarIcons from 'web/pages/scanners/ScannerDetailsPageToolBarIcons';

describe('ScannerDetailsPageToolBarIcons', () => {
  test('should renders the create icon when agents feature is enabled', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
      gmp,
    });
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.getByTitle('Create new Scanner')).toBeInTheDocument();
  });

  test('should renders the create icon when sensors are enabled', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.getByTitle('Create new Scanner')).toBeInTheDocument();
  });

  test('should not render the create icon when agents feature is disabled', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.queryByTitle('Create new Scanner')).not.toBeInTheDocument();
  });

  test('should not render the create icon when user has no create scanner permission', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: false,
      gmp,
    });
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.queryByTitle('Create new Scanner')).not.toBeInTheDocument();
  });

  test('should call create handler', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
      gmp,
    });
    const handleCreate = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerCreateClick={handleCreate}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'New Icon'}));
    expect(handleCreate).toHaveBeenCalledWith();
  });

  test('should render manual icon with correct props', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
        manualUrl: 'https://example.com/manual',
      },
    };
    const {render} = rendererWith({capabilities: true, gmp});
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.getByTitle('Help: Scanners')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/scanning.html#managing-scanners',
    );
  });

  test('should render the list icon', () => {
    const scanner = new Scanner({});
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(<ScannerDetailsPageToolBarIcons entity={scanner} />);

    expect(screen.getByTitle('Scanner List')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'List Icon'})).toHaveAttribute(
      'href',
      '/scanners',
    );
  });

  test('should render clone icon and call clone handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleClone = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerCloneClick={handleClone}
      />,
    );

    expect(screen.getByTitle('Clone Scanner')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Clone Icon'}));
    expect(handleClone).toHaveBeenCalledWith(scanner);
  });

  test('should render clone icon disabled when user may not clone scanner', () => {
    const scanner = new Scanner({
      scannerType: OPENVAS_SCANNER_TYPE,
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleClone = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerCloneClick={handleClone}
      />,
    );

    expect(scanner.isCloneable()).toEqual(false);
    expect(screen.getByTitle('Scanner may not be cloned')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Clone Icon'}));
    expect(handleClone).not.toHaveBeenCalled();
  });

  test('should render edit icon and call edit handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleEdit = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerEditClick={handleEdit}
      />,
    );

    expect(screen.getByTitle('Edit Scanner')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Edit Icon'}));
    expect(handleEdit).toHaveBeenCalledWith(scanner);
  });

  test('should render trash icon and call delete handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleDelete = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerDeleteClick={handleDelete}
      />,
    );

    expect(screen.getByTitle('Move Scanner to trashcan')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Delete Icon'}));
    expect(handleDelete).toHaveBeenCalledWith(scanner);
  });

  test('should render export icon and call download handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleDownload = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerDownloadClick={handleDownload}
      />,
    );

    expect(screen.getByTitle('Export Scanner as XML')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Export Icon'}));
    expect(handleDownload).toHaveBeenCalledWith(scanner);
  });

  test('should render verify icon and call verify handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleVerify = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerVerifyClick={handleVerify}
      />,
    );

    expect(screen.getByTitle('Verify Scanner')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Verify Icon'}));
    expect(handleVerify).toHaveBeenCalledWith(scanner);
  });

  test('should render download key icon and call credential download handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
      credential: new Credential(),
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleCredentialDownload = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerCredentialDownloadClick={handleCredentialDownload}
      />,
    );

    expect(screen.getByTitle('Download Certificate')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Download Key Icon'}));
    expect(handleCredentialDownload).toHaveBeenCalledWith(scanner);
  });

  test('should render download key icon and call ca certificate download handler', () => {
    const scanner = new Scanner({
      userCapabilities: new EverythingCapabilities(),
      caPub: {
        certificate: 'Test CA Certificate',
      },
    });
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    const handleCaCertificateDownload = testing.fn();
    render(
      <ScannerDetailsPageToolBarIcons
        entity={scanner}
        onScannerCertificateDownloadClick={handleCaCertificateDownload}
      />,
    );

    expect(screen.getByTitle('Download CA Certificate')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Download Key Icon'}));
    expect(handleCaCertificateDownload).toHaveBeenCalledWith(scanner);
  });
});
