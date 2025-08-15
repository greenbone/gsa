/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import PortList from 'gmp/models/portlist';
import PortListDetailsPageToolBarIcons from 'web/pages/portlists/PortListDetailsPageToolBarIcons';

const portList = new PortList({
  id: '1',
  name: 'Test PortList',
  predefined: false,
  userCapabilities: new EverythingCapabilities(),
});

const gmp = {
  settings: {
    manualUrl: 'https://example.com/manual',
  },
};

describe('PortListDetailsPageToolBarIcons', () => {
  test('should render all icons', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListDetailsPageToolBarIcons entity={portList} />);

    expect(screen.getByTitle('Help: Port Lists')).toBeInTheDocument();
    expect(screen.getByTitle('PortList List')).toBeInTheDocument();
    expect(screen.getByTitle('Create new Port List')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Port List')).toBeInTheDocument();
    expect(screen.getByTitle('Move Port List to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Export Port List as XML')).toBeInTheDocument();
  });

  test('should not render action icons when capabilities are missing', () => {
    const {render} = rendererWith({capabilities: new Capabilities(), gmp});
    render(<PortListDetailsPageToolBarIcons entity={portList} />);

    expect(screen.getByTitle('Help: Port Lists')).toBeInTheDocument();
    expect(screen.getByTitle('PortList List')).toBeInTheDocument();
    expect(screen.queryByTitle('Create new Port List')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit Port List')).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Move Port List to trashcan'),
    ).not.toBeInTheDocument();
    expect(screen.getByTitle('Export Port List as XML')).toBeInTheDocument();
  });

  test('should allow to create a port list', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListCreateClick={handleCreate}
      />,
    );

    const createIcon = screen.getByRole('button', {name: /new icon/i});
    fireEvent.click(createIcon);
    expect(handleCreate).toHaveBeenCalled();
  });

  test('should allow to clone a port list', () => {
    const handleClone = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListCloneClick={handleClone}
      />,
    );

    const cloneIcon = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneIcon);
    expect(handleClone).toHaveBeenCalledWith(portList);
  });

  test('should allow to edit a port list', () => {
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListEditClick={handleEdit}
      />,
    );

    const editIcon = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editIcon);
    expect(handleEdit).toHaveBeenCalledWith(portList);
  });

  test('should disable EditIcon when entity is predefined', () => {
    const portList = new PortList({
      id: '1',
      name: 'Predefined PortList',
      predefined: true,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListEditClick={handleEdit}
      />,
    );

    const editIcon = screen.getByRole('button', {name: /edit/i});
    expect(editIcon).toBeDisabled();

    fireEvent.click(editIcon);
    expect(handleEdit).not.toHaveBeenCalled();
  });

  test('should allow to delete a port list', () => {
    const handleDelete = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListDeleteClick={handleDelete}
      />,
    );

    const trashIcon = screen.getByRole('button', {name: /delete/i});
    fireEvent.click(trashIcon);
    expect(handleDelete).toHaveBeenCalledWith(portList);
  });

  test('should allow to download a port list', () => {
    const handleDownload = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListDetailsPageToolBarIcons
        entity={portList}
        onPortListDownloadClick={handleDownload}
      />,
    );

    const exportIcon = screen.getByRole('button', {name: /export/i});
    fireEvent.click(exportIcon);
    expect(handleDownload).toHaveBeenCalledWith(portList);
  });

  test('should render ManualIcon with correct title and anchor', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListDetailsPageToolBarIcons entity={portList} />);

    const manualIcon = screen.getByTitle('Help: Port Lists');
    expect(manualIcon).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/scanning.html#creating-and-managing-port-lists',
    );
  });

  test('should render ListIcon with correct title', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListDetailsPageToolBarIcons entity={portList} />);

    const listIcon = screen.getByTitle('PortList List');
    expect(listIcon).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /list/i})).toHaveAttribute(
      'href',
      '/portlists',
    );
  });
});
