/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Model from 'gmp/models/model';
import OciImageTarget from 'gmp/models/oci-image-target';
import ContainerImageTargetRow from 'web/pages/container-image-targets/ContainerImageTargetRow';

const entity = new OciImageTarget({
  id: 'target-1',
  name: 'Test Container Image Target',
  imageReferences: ['repo/image:tag', 'repo2/image2:tag2'],
  credential: new Model({id: 'cred-1', name: 'Test Credential'}),
  reverseLookupOnly: false,
  reverseLookupUnify: false,
  userCapabilities: new EverythingCapabilities(),
});

describe('ContainerImageTargetRow tests', () => {
  test('should render entity name, image references, and credential', () => {
    const {render} = rendererWithTableBody({capabilities: true});
    render(<ContainerImageTargetRow entity={entity} />);
    expect(screen.getByText('Test Container Image Target')).toBeInTheDocument();
    expect(
      screen.getByText('repo/image:tag, repo2/image2:tag2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Credential:')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();
  });

  test('should render action buttons', () => {
    const {render} = rendererWithTableBody({capabilities: true});
    render(<ContainerImageTargetRow entity={entity} />);
    expect(screen.getByTestId('trashcan-icon')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clone-icon')).toBeInTheDocument();
    expect(screen.getByTestId('export-icon')).toBeInTheDocument();
  });

  test('should call action handlers', () => {
    const handleEdit = testing.fn();
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <ContainerImageTargetRow
        entity={entity}
        onContainerImageTargetCloneClick={handleClone}
        onContainerImageTargetDeleteClick={handleDelete}
        onContainerImageTargetDownloadClick={handleDownload}
        onContainerImageTargetEditClick={handleEdit}
      />,
    );
    fireEvent.click(screen.getByTestId('edit-icon'));
    expect(handleEdit).toHaveBeenCalledWith(entity);
    fireEvent.click(screen.getByTestId('clone-icon'));
    expect(handleClone).toHaveBeenCalledWith(entity);
    fireEvent.click(screen.getByTestId('trashcan-icon'));
    expect(handleDelete).toHaveBeenCalledWith(entity);
    fireEvent.click(screen.getByTestId('export-icon'));
    expect(handleDownload).toHaveBeenCalledWith(entity);
  });

  test('should not render credential if undefined', () => {
    const entityNoCred = new OciImageTarget({
      id: 'target-1',
      name: 'Test Container Image Target',
      imageReferences: ['repo/image:tag', 'repo2/image2:tag2'],
      credential: undefined,
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      userCapabilities: new EverythingCapabilities(),
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(<ContainerImageTargetRow entity={entityNoCred} />);
    expect(screen.queryByText('Credential:')).not.toBeInTheDocument();
  });
});
