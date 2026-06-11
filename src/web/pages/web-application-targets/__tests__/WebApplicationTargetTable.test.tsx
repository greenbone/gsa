/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential from 'gmp/models/credential';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {createSession} from 'gmp/testing';
import WebApplicationTargetTable from 'web/pages/web-application-targets/WebApplicationTargetTable';

const createGmp = () => ({
  session: createSession(),
});

describe('WebApplicationTargetTable tests', () => {
  test('should render without crashing', () => {
    const targets = [
      new WebApplicationTarget({
        id: '1',
        name: 'Target 1',
        urls: ['https://a.com'],
      }),
      new WebApplicationTarget({
        id: '2',
        name: 'Target 2',
        urls: ['https://b.com'],
      }),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<WebApplicationTargetTable entities={targets} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no targets are available', () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<WebApplicationTargetTable entities={[]} />);
    expect(
      screen.getByText('No web application targets available'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if targets aren't available", () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    const {container} = render(<WebApplicationTargetTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the targets', () => {
    const targets = [
      new WebApplicationTarget({
        id: '1',
        name: 'Target 1',
        urls: ['https://a.com'],
      }),
      new WebApplicationTarget({
        id: '2',
        name: 'Target 2',
        urls: ['https://b.com'],
      }),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<WebApplicationTargetTable entities={targets} />);
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
      new WebApplicationTarget({
        id: '1',
        name: 'Target 1',
        urls: ['https://a.com'],
        credential: cred,
      }),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<WebApplicationTargetTable entities={targets} />);
    expect(screen.getByText('Cred 1')).toBeInTheDocument();
  });

  test('should allow to call action handlers', () => {
    const targets = [
      new WebApplicationTarget({
        id: '1',
        name: 'Target 1',
        urls: ['https://a.com'],
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <WebApplicationTargetTable
        entities={targets}
        onWebApplicationTargetCloneClick={handleClone}
        onWebApplicationTargetDeleteClick={handleDelete}
        onWebApplicationTargetDownloadClick={handleDownload}
        onWebApplicationTargetEditClick={handleEdit}
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
