/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent, within} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Scanner, {
  CVE_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import ScannerTable from 'web/pages/scanners/ScannerTable';
import SelectionType from 'web/utils/SelectionType';

describe('ScannerTable tests', () => {
  test("should render empty table when there's no scanner", () => {
    const {render} = rendererWith({capabilities: true});
    render(<ScannerTable entities={[]} />);

    expect(screen.getByText('No scanners available')).toBeInTheDocument();
  });

  test('should render table with scanners', () => {
    const scanner1 = new Scanner({
      id: '1234',
      name: 'Scanner 1',
      host: 'http://scanner1-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const scanner2 = new Scanner({
      id: '5678',
      name: 'Scanner 2',
      scannerType: CVE_SCANNER_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerTable entities={[scanner1, scanner2]} />);

    expect(screen.getByText('Scanner 1')).toBeInTheDocument();
    expect(screen.getByText('http://scanner1-host')).toBeInTheDocument();
    expect(screen.getByText('443')).toBeInTheDocument();
    expect(screen.getByText('OpenVASD Scanner')).toBeInTheDocument();

    expect(screen.getByText('Scanner 2')).toBeInTheDocument();
    expect(screen.getByText('CVE Scanner')).toBeInTheDocument();
  });

  test('should render table headers correctly', () => {
    const scanner1 = new Scanner({
      id: '1234',
      name: 'Scanner 1',
      host: 'http://scanner1-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerTable entities={[scanner1]} />);

    const header = screen.queryAllByRole('columnheader');
    expect(header).toHaveLength(6);
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('Port');
    expect(header[3]).toHaveTextContent('Type');
    expect(header[4]).toHaveTextContent('Credential');
    expect(header[5]).toHaveTextContent('Actions');
  });

  test('should unfold row details when clicking on the scanner name', () => {
    const scanner1 = new Scanner({
      id: '1234',
      name: 'Scanner 1',
      host: 'http://scanner1-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(<ScannerTable entities={[scanner1]} />);

    expect(screen.queryByTestId('scanner-details')).not.toBeInTheDocument();
    const nameElement = screen.getByTestId('row-details-toggle');
    fireEvent.click(nameElement);
    expect(screen.getByTestId('scanner-details')).toBeInTheDocument();
  });

  test('should allow to call handlers', () => {
    const scanner1 = new Scanner({
      id: '1234',
      name: 'Scanner 1',
      host: 'http://scanner1-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleCloneClick = testing.fn();
    const handleDeleteClick = testing.fn();
    const handleDownloadClick = testing.fn();
    const handleEditClick = testing.fn();
    const handleVerifyClick = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <ScannerTable
        entities={[scanner1]}
        onScannerCloneClick={handleCloneClick}
        onScannerDeleteClick={handleDeleteClick}
        onScannerDownloadClick={handleDownloadClick}
        onScannerEditClick={handleEditClick}
        onScannerVerifyClick={handleVerifyClick}
      />,
    );
    const cloneIcon = screen.getByRole('button', {name: /Clone Icon/i});
    fireEvent.click(cloneIcon);
    expect(handleCloneClick).toHaveBeenCalledWith(scanner1);

    const editIcon = screen.getByRole('button', {name: /Edit Icon/i});
    fireEvent.click(editIcon);
    expect(handleEditClick).toHaveBeenCalledWith(scanner1);

    const trashIcon = screen.queryAllByRole('button', {
      name: /Delete Icon/i,
    })[0];
    fireEvent.click(trashIcon);
    expect(handleDeleteClick).toHaveBeenCalledWith(scanner1);

    const verifyIcon = screen.getByRole('button', {name: /Verify Icon/i});
    fireEvent.click(verifyIcon);
    expect(handleVerifyClick).toHaveBeenCalledWith(scanner1);

    const exportIcon = screen.getByRole('button', {name: /Export Icon/i});
    fireEvent.click(exportIcon);
    expect(handleDownloadClick).toHaveBeenCalledWith(scanner1);
  });

  test('should allow to call footer handlers', () => {
    const scanner1 = new Scanner({
      id: '1234',
      name: 'Scanner 1',
      host: 'http://scanner1-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleDeleteBulkClick = testing.fn();
    const handleDownloadBulkClick = testing.fn();
    const handleTagsBulkClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScannerTable
        entities={[scanner1]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onDeleteBulk={handleDeleteBulkClick}
        onDownloadBulk={handleDownloadBulkClick}
        onTagsBulk={handleTagsBulkClick}
      />,
    );
    const entitiesFooter = within(screen.getByTestId('entities-footer'));
    // const deleteBulkButton = entitiesFooter.getByRole('button', {
    //   name: /Delete Icon/i,
    // });
    // fireEvent.click(deleteBulkButton);
    // expect(handleDeleteBulkClick).toHaveBeenCalled();
    const exportBulkButton = entitiesFooter.getByRole('button', {
      name: /Export Icon/i,
    });
    fireEvent.click(exportBulkButton);
    expect(handleDownloadBulkClick).toHaveBeenCalled();
    const tagBulkButton = entitiesFooter.getByRole('button', {
      name: /Tags Icon/i,
    });
    fireEvent.click(tagBulkButton);
    expect(handleTagsBulkClick).toHaveBeenCalled();
  });
});
