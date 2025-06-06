/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, screen, render, fireEvent} from 'web/testing';
import Task from 'gmp/models/task';
import ContainerDialog from 'web/pages/tasks/ContainerDialog';

describe('ContainerTaskDialog tests', () => {
  test('should render create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(<ContainerDialog onClose={handleClose} onSave={handleSave} />);

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.queryByName('in_assets')).not.toBeInTheDocument();
  });

  test('should render edit dialog', () => {
    const task = Task.fromElement({name: 'foo', _id: 't1'});
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <ContainerDialog task={task} onClose={handleClose} onSave={handleSave} />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.queryByName('in_assets')).toBeInTheDocument();
  });

  test('should change fields in create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <ContainerDialog
        comment="bar"
        name="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'lorem');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'lorem',
      in_assets: 1,
      id: undefined,
      name: 'ipsum',
    });
  });

  test('should change fields in edit dialog', () => {
    const task = Task.fromElement({name: 'foo', _id: 't1'});
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <ContainerDialog
        comment="bar"
        name="foo"
        task={task}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'lorem');

    const [, inAssetsNoRadio] = screen.getAllByName('in_assets');
    fireEvent.click(inAssetsNoRadio);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'lorem',
      in_assets: 0,
      id: 't1',
      name: 'ipsum',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <ContainerDialog
        comment="bar"
        name="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
