/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import Dialog from 'web/entities/TagsDialog';

describe('TagsDialog dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    render(
      <Dialog
        entitiesCount={3}
        tags={[{name: 'foo', id: '123'}]}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should disable tag selection when no options available', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    render(
      <Dialog
        entitiesCount={3}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    expect(screen.getSelectElement()).toBeDisabled();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleNewTagClick = testing.fn();
    const handleSave = testing.fn();
    const handleTagChange = testing.fn();

    render(
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

    const saveButton = screen.getDialogSaveButton();
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

    render(
      <Dialog
        entitiesCount={3}
        tags={[{name: 'foo', id: '123'}]}
        onClose={handleClose}
        onNewTagClick={handleNewTagClick}
        onSave={handleSave}
        onTagChanged={handleTagChange}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});
