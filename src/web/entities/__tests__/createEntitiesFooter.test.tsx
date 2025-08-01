/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTable, fireEvent, wait} from 'web/testing';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';

describe('EntitiesFooter tests', () => {
  test('should render', () => {
    const {render} = rendererWithTable();
    const Footer = createEntitiesFooter();

    render(<Footer>Some Content</Footer>);

    expect(screen.getByText('Some Content')).toBeVisible();
  });

  test('should show ConfirmationDialog when DeleteIcon is clicked and notification', async () => {
    const {render} = rendererWithTable();
    const Footer = createEntitiesFooter({
      delete: true,
      span: 2,
    });
    const onDeleteBulk = testing.fn();

    render(<Footer onDeleteBulk={onDeleteBulk} />);

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
    expect(onDeleteBulk).toHaveBeenCalled();
  });

  test('should show ConfirmationDialog when TrashIcon is clicked and notification', async () => {
    const {render} = rendererWithTable();
    const Footer = createEntitiesFooter({
      trash: true,
      span: 2,
    });
    const onDeleteBulk = testing.fn();

    render(<Footer onDeleteBulk={onDeleteBulk} />);

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
    expect(onDeleteBulk).toHaveBeenCalled();
  });

  test('should render the footer with custom options', () => {
    const {render} = rendererWithTable();
    const Footer = createEntitiesFooter({
      span: 3,
      delete: true,
      download: 'foo.xml',
      selection: true,
      trash: true,
      tags: true,
    });

    render(<Footer>Some Content</Footer>);

    expect(screen.getByTestId('entities-footer')).toBeVisible();
    expect(screen.getByTestId('entities-footer-select')).toBeVisible();
    expect(screen.getByTestId('delete-icon')).toBeVisible();
    expect(screen.getByTestId('trash-icon')).toBeVisible();
    expect(screen.getByTestId('tags-icon')).toBeVisible();
    expect(screen.getByTestId('export-icon')).toBeVisible();
    expect(screen.getByText('Some Content')).toBeVisible();
  });
});
