/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Footer from 'web/entities/Footer';
import {
  screen,
  rendererWithTableFooter,
  fireEvent,
  userEvent,
} from 'web/utils/Testing';

const entities = [];
const entitiesCounts = {filtered: 0, all: 0};
const filter = '';
const selectedEntities = [];
const onClose = testing.fn();
const onTrashClick = testing.fn();
const gmp = {
  user: {
    renewSession: testing.fn().mockResolvedValue({data: 123}),
  },
};

describe('Footer', () => {
  test('should render the Footer component', async () => {
    const {render} = rendererWithTableFooter({gmp});

    render(
      <Footer
        delete={true}
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        isGenericBulkTrashcanDeleteDialog={true}
        selectedEntities={selectedEntities}
        span={2}
        onClose={onClose}
        onDeleteClick={testing.fn()}
      />,
    );

    const deleteBtn = screen.getByTestId('delete-icon');

    expect(deleteBtn).toBeVisible();

    fireEvent.click(deleteBtn);

    const dialogTitle = await screen.findByText('Confirm Deletion');

    expect(dialogTitle).toBeVisible();

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });

    await userEvent.click(cancelButton);

    expect(dialogTitle).not.toBeVisible();
  });

  test('should show ConfirmationDialog when DeleteIcon is clicked and notification', async () => {
    const {render} = rendererWithTableFooter({gmp});

    render(
      <Footer
        delete={true}
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        isGenericBulkTrashcanDeleteDialog={true}
        selectedEntities={selectedEntities}
        span={2}
        onClose={onClose}
        onDeleteClick={testing.fn()}
      />,
    );

    // Find and click the delete icon
    const deleteButton = screen.getByTestId('delete-icon');
    expect(deleteButton).toBeVisible();
    fireEvent.click(deleteButton);

    const dialogTitle = await screen.findByText('Confirm Deletion');
    expect(dialogTitle).toBeVisible();

    const dialogText = screen.getByText(
      /Are you sure you want to delete all items on this page/,
    );
    expect(dialogText).toBeVisible();

    const resumeButton = screen.getByRole('button', {
      name: 'Delete',
    });

    expect(resumeButton).toBeVisible();
    expect(resumeButton).toHaveTextContent('Delete');

    userEvent.click(resumeButton);

    const notification = await screen.findByText('Deletion started');
    expect(notification).toBeVisible();
    const successNotification = await screen.findByText('Deletion completed');
    expect(successNotification).toBeVisible();
    expect(dialogTitle).not.toBeVisible();
  });

  test('should show ConfirmationDialog when TrashIcon is clicked and notification', async () => {
    const {render} = rendererWithTableFooter({gmp});

    render(
      <Footer
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        isGenericBulkTrashcanDeleteDialog={true}
        selectedEntities={selectedEntities}
        span={2}
        trash={true}
        onClose={onClose}
        onTrashClick={onTrashClick}
      />,
    );

    const trashButton = screen.getByTestId('trash-icon');
    expect(trashButton).toBeVisible();
    fireEvent.click(trashButton);

    const dialogTitle = await screen.findByText('Confirm move to trashcan');
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

    userEvent.click(resumeButton);

    const notification = await screen.findByText('Moving to trashcan');
    expect(notification).toBeVisible();
    const successNotification = await screen.findByText(
      'Move to trashcan completed',
    );
    expect(successNotification).toBeVisible();
    expect(dialogTitle).not.toBeVisible();
  });
});
