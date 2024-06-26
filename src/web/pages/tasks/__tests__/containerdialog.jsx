/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import ContainerDialog from '../containerdialog';
import Task from 'gmp/models/task';

describe('ContainerDialog tests', () => {
  test('should render create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement} = render(
      <ContainerDialog onClose={handleClose} onSave={handleSave} />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should render edit dialog', () => {
    const task = Task.fromElement({name: 'foo', _id: 't1'});
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement} = render(
      <ContainerDialog task={task} onClose={handleClose} onSave={handleSave} />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should change fields in create dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByName, getByTestId} = render(
      <ContainerDialog
        name="foo"
        comment="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'ipsum'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'lorem'}});

    const saveButton = getByTestId('dialog-save-button');
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

    const {getByName, queryAllByName, getByTestId} = render(
      <ContainerDialog
        task={task}
        name="foo"
        comment="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'ipsum'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'lorem'}});

    const [, inAssetsNoRadio] = queryAllByName('in_assets');
    fireEvent.click(inAssetsNoRadio);

    const saveButton = getByTestId('dialog-save-button');
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

    const {getByTestId} = render(
      <ContainerDialog
        name="foo"
        comment="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
