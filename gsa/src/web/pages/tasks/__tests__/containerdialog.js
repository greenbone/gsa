/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import ContainerDialog from '../containerdialog';
import Task, {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

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
    const task = new Task({name: 'foo', _id: 't1'});
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
      auto_delete: AUTO_DELETE_KEEP,
      auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
      in_assets: 1,
      id: undefined,
      name: 'ipsum',
    });
  });

  test('should change fields in edit dialog', () => {
    const task = new Task({name: 'foo', _id: 't1'});
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

    const autoDeleteKeepInput = getByName('auto_delete_data');
    fireEvent.change(autoDeleteKeepInput, {target: {value: '10'}});

    const [autoDeleteNoRadio] = queryAllByName('auto_delete');
    fireEvent.click(autoDeleteNoRadio);

    const [, inAssetsNoRadio] = queryAllByName('in_assets');
    fireEvent.click(inAssetsNoRadio);

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'lorem',
      auto_delete: AUTO_DELETE_NO,
      auto_delete_data: 10,
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
