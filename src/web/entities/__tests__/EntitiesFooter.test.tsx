/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTable, fireEvent, wait} from 'web/testing';
import EntitiesFooter from 'web/entities/EntitiesFooter';

describe('EntitiesFooter tests', () => {
  test('should render', async () => {
    const {render} = rendererWithTable();

    render(<EntitiesFooter>Some Content</EntitiesFooter>);

    expect(screen.getByText('Some Content')).toBeVisible();
  });

  test('should show ConfirmationDialog when DeleteIcon is clicked and notification', async () => {
    const {render} = rendererWithTable();

    render(
      <EntitiesFooter delete={true} span={2} onDeleteClick={testing.fn()} />,
    );

    // Find and click the delete icon
    const deleteButton = screen.getByTestId('delete-icon');
    expect(deleteButton).toBeVisible();
    fireEvent.click(deleteButton);

    const dialogTitle = screen.getDialogTitle();
    const dialogText = screen.getByText(
      /Are you sure you want to delete all items on this page/,
    );
    expect(dialogText).toBeVisible();
    const resumeButton = screen.getByRole('button', {
      name: 'Delete',
    });

    fireEvent.click(resumeButton);

    expect(screen.getByText('Deletion started')).toBeVisible();
    await wait();
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
    expect(screen.getByText('Move to trashcan completed')).toBeVisible();
    expect(dialogTitle).not.toBeVisible();
  });
});
