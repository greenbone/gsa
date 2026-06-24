/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Override from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import OverrideTableActions from 'web/pages/overrides/OverrideTableActions';
import SelectionType from 'web/utils/SelectionType';

const wrongCaps = new Capabilities(['get_overrides']);

const createGmp = () => ({
  session: createSession(),
});

const createOverride = (capabilities: Capabilities) =>
  new Override({
    id: '314',
    text: 'override text',
    userCapabilities: capabilities,
    writable: 1,
  });

describe('OverrideTableActions tests', () => {
  test('should render', () => {
    const override = createOverride(new Capabilities(['everything']));

    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    const {element} = render(
      <OverrideTableActions
        entity={override}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const override = createOverride(new Capabilities(['everything']));

    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <OverrideTableActions
        entity={override}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
      />,
    );

    const deleteIcon = screen.getByTitle('Move Override to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleOverrideDelete).toHaveBeenCalledWith(override);

    const editIcon = screen.getByTitle('Edit Override');
    fireEvent.click(editIcon);
    expect(handleOverrideEdit).toHaveBeenCalledWith(override);

    const cloneIcon = screen.getByTitle('Clone Override');
    fireEvent.click(cloneIcon);
    expect(handleOverrideClone).toHaveBeenCalledWith(override);

    const exportIcon = screen.getByTitle('Export Override');
    fireEvent.click(exportIcon);
    expect(handleOverrideDownload).toHaveBeenCalledWith(override);
  });

  test('should not call restricted click handlers without permissions', () => {
    const override = createOverride(wrongCaps);

    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: wrongCaps,
      gmp: createGmp(),
    });
    render(
      <OverrideTableActions
        entity={override}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
      />,
    );

    const deleteIcon = screen.getByRole('button', {name: 'Delete Icon'});
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Override to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleOverrideDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByRole('button', {name: 'Edit Icon'});
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Override denied',
    );
    fireEvent.click(editIcon);
    expect(handleOverrideEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByRole('button', {name: 'Clone Icon'});
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Override denied',
    );
    fireEvent.click(cloneIcon);
    expect(handleOverrideClone).not.toHaveBeenCalled();

    const exportIcon = screen.getByRole('button', {name: 'Export Icon'});
    expect(exportIcon).toHaveAttribute('title', 'Export Override');
    fireEvent.click(exportIcon);
    expect(handleOverrideDownload).toHaveBeenCalledWith(override);
  });

  test('should render entity selection in user selection mode', () => {
    const override = createOverride(new Capabilities(['everything']));

    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <OverrideTableActions
        entity={override}
        selectionType={SelectionType.SELECTION_USER}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
      />,
    );

    expect(screen.getByTestId('entity-selection-314')).toBeInTheDocument();
    expect(
      screen.queryByTitle('Move Override to trashcan'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Clone Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Export Override')).not.toBeInTheDocument();
  });

  test('should disable delete action when override is in use', () => {
    const override = new Override({
      id: '315',
      inUse: true,
      text: 'override in use',
      userCapabilities: new Capabilities(['everything']),
      writable: 1,
    });

    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <OverrideTableActions
        entity={override}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
      />,
    );

    const deleteIcon = screen.getByTitle('Override is still in use');
    fireEvent.click(deleteIcon);
    expect(handleOverrideDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTitle('Edit Override');
    fireEvent.click(editIcon);
    expect(handleOverrideEdit).toHaveBeenCalledWith(override);
  });
});
