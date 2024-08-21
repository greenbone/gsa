/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import Dialog from '../tagsdialog';

describe('TagsDialog dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    const {baseElement} = render(
      <Dialog
        entitiesCount={3}
        tags={[{name: 'foo', id: '123'}]}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should disable tag selection when no options available', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    const {baseElement} = render(
      <Dialog
        entitiesCount={3}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    const {getByTestId} = render(
      <Dialog
        comment="foo"
        entitiesCount={3}
        name="bar"
        tagId="123"
        tags={[{name: 'foo', id: '123'}]}
        value="lorem"
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      comment: 'foo',
      id: '123',
      name: 'bar',
      value: 'lorem',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    const {getByTestId} = render(
      <Dialog
        entitiesCount={3}
        tags={[{name: 'foo', id: '123'}]}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
