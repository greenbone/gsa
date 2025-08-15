/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import PortList from 'gmp/models/portlist';
import PortListTable from 'web/pages/portlists/PortListTable';

describe('PortListTable tests', () => {
  test('should render without crashing', () => {
    const portLists = [
      new PortList({
        id: '1',
        name: 'Port List 1',
      }),
      new PortList({
        id: '2',
        name: 'Port List 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<PortListTable entities={portLists} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no port lists are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<PortListTable entities={[]} />);
    expect(screen.getByText('No port lists available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if port list aren't available", () => {
    const {render} = rendererWith({capabilities: true});
    const {container} = render(<PortListTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the port lists', () => {
    const portLists = [
      new PortList({
        id: '1',
        name: 'Port List 1',
      }),
      new PortList({
        id: '2',
        name: 'Port List 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<PortListTable entities={portLists} />);
    expect(screen.getByText('Port List 1')).toBeInTheDocument();
    expect(screen.getByText('Port List 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(portLists.length + 3); // +3 for 2 header rows and one footer row
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should allow to call action handlers', () => {
    const portLists = [
      new PortList({
        id: '1',
        name: 'Port List 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <PortListTable
        entities={portLists}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(portLists[0]);

    const deleteButton = screen.queryAllByRole('button', {name: /delete/i})[0];
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(portLists[0]);

    const downloadButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(portLists[0]);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(portLists[0]);
  });
});
