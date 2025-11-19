/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableRow, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Target from 'gmp/models/target';
import TargetTableActions from 'web/pages/targets/TargetTableActions';
import SelectionType from 'web/utils/SelectionType';

describe('TargetTableActions tests', () => {
  test('should render all action icons', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /clone/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /export/i})).toBeInTheDocument();
  });

  test('should call onTargetDeleteClick when delete icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    const deleteButton = screen.getByRole('button', {name: /delete/i});
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(target);
  });

  test('should call onTargetEditClick when edit icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(target);
  });

  test('should call onTargetCloneClick when clone icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(target);
  });

  test('should call onTargetDownloadClick when export icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    const exportButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(exportButton);
    expect(handleDownload).toHaveBeenCalledWith(target);
  });

  test('should render user selection', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const target = new Target({
      id: '1',
      name: 'Test Target',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <TargetTableActions
        entity={target}
        selectionType={SelectionType.SELECTION_USER}
        onTargetCloneClick={handleClone}
        onTargetDeleteClick={handleDelete}
        onTargetDownloadClick={handleDownload}
        onTargetEditClick={handleEdit}
      />,
    );

    expect(screen.getByTestId('entity-selection-1')).toBeInTheDocument();
  });
});
