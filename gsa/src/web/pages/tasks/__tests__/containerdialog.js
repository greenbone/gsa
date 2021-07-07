/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import ContainerDialog from '../containerdialog';
import Task from 'gmp/models/task';

describe('ContainerDialog tests', () => {
  test('should render create dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {baseElement} = render(
      <ContainerDialog onClose={handleClose} onSave={handleSave} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should render edit dialog', () => {
    const task = Task.fromElement({name: 'foo', _id: 't1'});
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {baseElement} = render(
      <ContainerDialog task={task} onClose={handleClose} onSave={handleSave} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should change fields in create dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

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
    const handleClose = jest.fn();
    const handleSave = jest.fn();

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
    const handleClose = jest.fn();
    const handleSave = jest.fn();

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
