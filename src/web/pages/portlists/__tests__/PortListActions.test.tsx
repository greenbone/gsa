/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableRow, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import PortList from 'gmp/models/portlist';
import PortListActions from 'web/pages/portlists/PortListActions';
import SelectionType from 'web/utils/SelectionType';

describe('PortListActions tests', () => {
  test('should render all action icons', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /clone/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /export/i})).toBeInTheDocument();
  });

  test('should call onPortListDeleteClick when delete icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const deleteButton = screen.getByRole('button', {name: /delete/i});
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(portList);
  });

  test('should call onPortListEditClick when edit icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(portList);
  });

  test('should disable edit icon if entity is predefined', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
      predefined: true,
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const editButton = screen.getByRole('button', {name: /edit/i});
    expect(editButton).toBeDisabled();
    fireEvent.click(editButton);
    expect(handleEdit).not.toHaveBeenCalled();
  });

  test('should call onPortListCloneClick when clone icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);

    expect(handleClone).toHaveBeenCalledWith(portList);
  });

  test('should call onPortListDownloadClick when export icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    const exportButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(exportButton);

    expect(handleDownload).toHaveBeenCalledWith(portList);
  });

  test('should render user selection', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <PortListActions
        entity={portList}
        selectionType={SelectionType.SELECTION_USER}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    expect(screen.getByTestId('entity-selection-1')).toBeInTheDocument();
  });
});
