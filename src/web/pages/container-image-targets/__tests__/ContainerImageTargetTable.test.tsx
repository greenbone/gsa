/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential from 'gmp/models/credential';
import OciImageTarget from 'gmp/models/oci-image-target';
import ContainerImageTargetTable from 'web/pages/container-image-targets/ContainerImageTargetTable';

describe('ContainerImageTargetTable tests', () => {
  test('should render without crashing', () => {
    const targets = [
      new OciImageTarget({
        id: '1',
        name: 'Target 1',
        imageReferences: [
          'registry.example.com/repo:1',
          'registry.example.com/repo:2',
        ],
      }),
      new OciImageTarget({
        id: '2',
        name: 'Target 2',
        imageReferences: ['registry.example.com/repo:3'],
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<ContainerImageTargetTable entities={targets} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no targets are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<ContainerImageTargetTable entities={[]} />);
    expect(screen.getByText('No targets available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if targets aren't available", () => {
    const {render} = rendererWith({capabilities: true});
    const {container} = render(<ContainerImageTargetTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the targets', () => {
    const targets = [
      new OciImageTarget({
        id: '1',
        name: 'Target 1',
        imageReferences: [
          'registry.example.com/repo:1',
          'registry.example.com/repo:2',
        ],
      }),
      new OciImageTarget({
        id: '2',
        name: 'Target 2',
        imageReferences: ['registry.example.com/repo:3'],
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<ContainerImageTargetTable entities={targets} />);
    expect(screen.getByText('Target 1')).toBeInTheDocument();
    expect(screen.getByText('Target 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(targets.length + 2); // +2 for header and footer rows
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should render credential link when credential is present', () => {
    const cred = new Credential({id: 'c1', name: 'Cred 1'});
    const targets = [
      new OciImageTarget({
        id: '1',
        name: 'Target 1',
        imageReferences: ['registry.example.com/repo:1'],
        credential: cred,
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<ContainerImageTargetTable entities={targets} />);
    expect(screen.getByText('Cred 1')).toBeInTheDocument();
  });

  test('should allow to call action handlers', () => {
    const targets = [
      new OciImageTarget({
        id: '1',
        name: 'Target 1',
        imageReferences: ['registry.example.com/repo:1'],
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ContainerImageTargetTable
        entities={targets}
        onContainerImageTargetCloneClick={handleClone}
        onContainerImageTargetDeleteClick={handleDelete}
        onContainerImageTargetDownloadClick={handleDownload}
        onContainerImageTargetEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(targets[0]);

    const deleteButton = screen.getByRole('button', {name: /delete/i});
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(targets[0]);

    const downloadButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(targets[0]);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(targets[0]);
  });
});
