/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Target from 'gmp/models/target';
import TargetTable from 'web/pages/targets/TargetTable';

const gmp = {
  settings: {
    enableKrb5: true,
  },
};

describe('TargetTable tests', () => {
  test('should render without crashing', () => {
    const targets = [
      new Target({
        id: '1',
        name: 'Port List 1',
      }),
      new Target({
        id: '2',
        name: 'Port List 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true, gmp});
    render(<TargetTable entities={targets} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no targets are available', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<TargetTable entities={[]} />);
    expect(screen.getByText('No targets available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if targets aren't available", () => {
    const {render} = rendererWith({capabilities: true, gmp});
    const {container} = render(<TargetTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render targets', () => {
    const targets = [
      new Target({
        id: '1',
        name: 'Target 1',
      }),
      new Target({
        id: '2',
        name: 'Target 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true, gmp});
    render(<TargetTable entities={targets} />);
    expect(screen.getByText('Target 1')).toBeInTheDocument();
    expect(screen.getByText('Target 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(targets.length + 2); // +2 for one header row and one footer row
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should allow to call action handlers', () => {
    const targets = [
      new Target({
        id: '1',
        name: 'Target 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <TargetTable
        entities={targets}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(targets[0]);

    const deleteButton = screen.queryAllByRole('button', {name: /delete/i})[0];
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
