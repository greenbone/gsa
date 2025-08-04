/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  render,
  fireEvent,
  getSelectItemElementsForSelect,
} from 'web/testing';
import Tag from 'gmp/models/tag';
import TagsDialog from 'web/entities/TagsDialog';

describe('TagsDialog tests', () => {
  test('should render dialog', () => {
    const tags = [new Tag({id: '123', name: 'foo'})];

    render(<TagsDialog entitiesCount={3} tags={tags} />);

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should disable tag selection when no existing tags are available', () => {
    const tags = [];

    render(<TagsDialog entitiesCount={3} tags={tags} />);

    expect(screen.getSelectElement()).toBeDisabled();
  });

  test('should save data', () => {
    const handleSave = testing.fn();
    const tags = [new Tag({id: '123', name: 'foo'})];

    render(
      <TagsDialog
        comment="foo"
        entitiesCount={3}
        name="bar"
        tagId="123"
        tags={tags}
        value="lorem"
        onSave={handleSave}
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
    const tags = [new Tag({id: '123', name: 'foo'})];

    render(<TagsDialog entitiesCount={3} tags={tags} onClose={handleClose} />);

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should display notification when entitiesCount exceeds threshold', () => {
    const tags = [new Tag({id: '123', name: 'foo'})];

    render(<TagsDialog entitiesCount={50001} tags={tags} />);

    expect(
      screen.getByText(
        'Please note that assigning a tag to 50001 items may take several minutes.',
      ),
    ).toBeInTheDocument();
  });

  test('should call onNewTagClick when new tag icon is clicked', () => {
    const handleNewTagClick = testing.fn();
    const tags = [new Tag({id: '123', name: 'foo'})];

    render(<TagsDialog tags={tags} onNewTagClick={handleNewTagClick} />);

    const newTagIcon = screen.getByTitle('Create a new Tag');
    fireEvent.click(newTagIcon);
    expect(handleNewTagClick).toHaveBeenCalled();
  });

  test('should call onTagChanged when a tag is selected', async () => {
    const handleTagChange = testing.fn();
    const tags = [
      new Tag({id: '123', name: 'foo'}),
      new Tag({id: '456', name: 'bar'}),
    ];

    render(<TagsDialog tags={tags} onTagChanged={handleTagChange} />);

    const selectElement = screen.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    fireEvent.click(selectItems[1]); // Select the second tag (id: '456')
    expect(handleTagChange).toHaveBeenCalledWith('456', 'name');
  });
});
