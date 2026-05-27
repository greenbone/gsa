/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTable, fireEvent, wait} from 'web/testing';
import EntitiesFooter from 'web/entities/EntitiesFooter';

describe('EntitiesFooter tests', () => {
  test('should render children', async () => {
    const {render} = rendererWithTable();

    render(<EntitiesFooter span={2}>Some Content</EntitiesFooter>);

    expect(screen.getByText('Some Content')).toBeVisible();
  });

  test('should render children inside actions area', async () => {
    const {render} = rendererWithTable();

    render(
      <EntitiesFooter span={2}>
        <button type="button">Custom Footer Action</button>
      </EntitiesFooter>,
    );

    expect(screen.getByText('Custom Footer Action')).toBeVisible();
  });

  test('should show ConfirmationDialog when DeleteIcon is clicked and notification', async () => {
    const {render} = rendererWithTable();
    const onDeleteClick = testing.fn();

    render(
      <EntitiesFooter delete={true} span={2} onDeleteClick={onDeleteClick} />,
    );

    const deleteButton = screen.getByTestId('delete-icon');
    expect(deleteButton).toBeVisible();

    fireEvent.click(deleteButton);

    const dialogTitle = screen.getDialogTitle();
    expect(dialogTitle).toBeVisible();

    const dialogText = screen.getByText(
      /Are you sure you want to delete all items on this page/,
    );
    expect(dialogText).toBeVisible();

    const resumeButton = screen.getByRole('button', {
      name: 'Delete',
    });
    expect(resumeButton).toBeVisible();

    fireEvent.click(resumeButton);

    expect(screen.getByText('Deletion started')).toBeVisible();

    await wait();

    expect(onDeleteClick).toHaveBeenCalled();
    expect(screen.getByText('Deletion completed')).toBeVisible();
    expect(dialogTitle).not.toBeVisible();
  });

  test('should show ConfirmationDialog when TrashIcon is clicked and notification', async () => {
    const {render} = rendererWithTable();
    const onTrashClick = testing.fn();

    render(
      <EntitiesFooter span={2} trash={true} onTrashClick={onTrashClick} />,
    );

    const trashButton = screen.getByTestId('trash-icon');
    expect(trashButton).toBeVisible();

    fireEvent.click(trashButton);

    const dialogTitle = screen.getDialogTitle();
    expect(dialogTitle).toBeVisible();

    const dialogText = screen.getByText(
      /Are you sure you want to move all items on this page to the trashcan\?/,
    );
    expect(dialogText).toBeVisible();

    const resumeButton = screen.getByRole('button', {
      name: 'Move to Trashcan',
    });

    expect(resumeButton).toBeVisible();
    expect(resumeButton).toHaveTextContent('Move to Trashcan');

    fireEvent.click(resumeButton);

    expect(screen.getByText('Moving to trashcan')).toBeVisible();

    await wait();

    expect(onTrashClick).toHaveBeenCalled();
    expect(screen.getByText('Move to trashcan completed')).toBeVisible();
    expect(dialogTitle).not.toBeVisible();
  });

  test('should call onTagsClick when TagsIcon is clicked', async () => {
    const {render} = rendererWithTable();
    const onTagsClick = testing.fn();

    render(<EntitiesFooter span={2} tags={true} onTagsClick={onTagsClick} />);

    const tagsButton = screen.getByTestId('tags-icon');
    expect(tagsButton).toBeVisible();

    fireEvent.click(tagsButton);

    expect(onTagsClick).toHaveBeenCalled();
  });

  test('should not render TagsIcon when tags is false', async () => {
    const {render} = rendererWithTable();

    render(<EntitiesFooter span={2} tags={false} />);

    expect(screen.queryByTestId('tags-icon')).not.toBeInTheDocument();
  });

  test('should not render selection dropdown when selection is false', async () => {
    const {render} = rendererWithTable();

    render(<EntitiesFooter selection={false} span={2} />);

    expect(
      screen.queryByTestId('entities-footer-select'),
    ).not.toBeInTheDocument();
  });

  test('should render custom data-testid', async () => {
    const {render} = rendererWithTable();

    render(
      <EntitiesFooter data-testid="custom-entities-footer" span={2}>
        Some Content
      </EntitiesFooter>,
    );

    expect(screen.getByTestId('custom-entities-footer')).toBeVisible();
    expect(screen.getByText('Some Content')).toBeVisible();
  });

  test('should render children only when actions is false', async () => {
    const {render} = rendererWithTable();

    render(
      <EntitiesFooter actions={false} delete={true} span={2}>
        Only Children
      </EntitiesFooter>,
    );

    expect(screen.getByText('Only Children')).toBeVisible();
    expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
  });
});
