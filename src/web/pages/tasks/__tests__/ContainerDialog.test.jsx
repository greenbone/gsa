/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Task from 'gmp/models/task';
import {
  changeInputValue,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';
import ContainerDialog from 'web/pages/tasks/ContainerDialog';
import {render, fireEvent} from 'web/utils/Testing';

describe('ContainerDialog tests', () => {
  test('should render create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {queryByName} = render(
      <ContainerDialog onClose={handleClose} onSave={handleSave} />,
    );

    expect(getDialog()).toBeInTheDocument();
    expect(queryByName('in_assets')).not.toBeInTheDocument();
  });

  test('should render edit dialog', () => {
    const task = Task.fromElement({name: 'foo', _id: 't1'});
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {queryByName} = render(
      <ContainerDialog task={task} onClose={handleClose} onSave={handleSave} />,
    );

    expect(getDialog()).toBeInTheDocument();
    expect(queryByName('in_assets')).toBeInTheDocument();
  });

  test('should change fields in create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByName} = render(
      <ContainerDialog
        comment="bar"
        name="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = getByName('comment');
    changeInputValue(commentInput, 'lorem');

    const saveButton = getDialogSaveButton();
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

    const {getByName, getAllByName} = render(
      <ContainerDialog
        comment="bar"
        name="foo"
        task={task}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = getByName('comment');
    changeInputValue(commentInput, 'lorem');

    const [, inAssetsNoRadio] = getAllByName('in_assets');
    fireEvent.click(inAssetsNoRadio);

    const saveButton = getDialogSaveButton();
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

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
