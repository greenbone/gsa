/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Model from 'gmp/models/model';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {createSession} from 'gmp/testing';
import WebApplicationTargetRow from 'web/pages/web-application-targets/WebApplicationTargetRow';

const entity = new WebApplicationTarget({
  id: 'target-1',
  name: 'Test Web Application Target',
  urls: ['https://example.com'],
  credential: new Model({id: 'cred-1', name: 'Test Credential'}),
  reverseLookupOnly: false,
  reverseLookupUnify: false,
  userCapabilities: new EverythingCapabilities(),
});

const createGmp = () => ({
  session: createSession(),
});

describe('WebApplicationTargetRow tests', () => {
  test('should render entity name, url, and credential', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<WebApplicationTargetRow entity={entity} />);
    expect(screen.getByText('Test Web Application Target')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Credential:')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();
  });

  test('should render action buttons', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<WebApplicationTargetRow entity={entity} />);
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
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <WebApplicationTargetRow
        entity={entity}
        onWebApplicationTargetCloneClick={handleClone}
        onWebApplicationTargetDeleteClick={handleDelete}
        onWebApplicationTargetDownloadClick={handleDownload}
        onWebApplicationTargetEditClick={handleEdit}
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
    const entityNoCred = new WebApplicationTarget({
      id: 'target-1',
      name: 'Test Web Application Target',
      urls: ['https://example.com'],
      credential: undefined,
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      userCapabilities: new EverythingCapabilities(),
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<WebApplicationTargetRow entity={entityNoCred} />);
    expect(screen.queryByText('Credential:')).not.toBeInTheDocument();
  });

  test('should render with empty url without throwing error', () => {
    const entityNoUrl = new WebApplicationTarget({
      id: 'target-1',
      name: 'Test Web Application Target',
      credential: new Model({id: 'cred-1', name: 'Test Credential'}),
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      userCapabilities: new EverythingCapabilities(),
    });
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(<WebApplicationTargetRow entity={entityNoUrl} />);
    expect(screen.getByText('Test Web Application Target')).toBeInTheDocument();
    expect(screen.getByText('Credential:')).toBeInTheDocument();
  });
});
