/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTable, screen, within} from 'web/testing';
import AgentTableFooter from 'web/pages/agents/AgentTableFooter';

describe('AgentTableFooter tests', () => {
  test('should render agent footer', () => {
    const {render} = rendererWithTable();

    render(<AgentTableFooter />);

    expect(screen.getByTestId('agents-footer')).toBeVisible();
  });

  test('should render generic and agent-specific footer actions', () => {
    const {render} = rendererWithTable();

    render(<AgentTableFooter />);

    const footer = screen.getByTestId('agents-footer');

    expect(within(footer).getByTestId('tags-icon')).toBeVisible();
    expect(within(footer).getByTestId('delete-icon')).toBeVisible();
    expect(within(footer).getByTestId('circle-plus-icon')).toBeVisible();
    expect(within(footer).getByTestId('circle-minus-icon')).toBeVisible();
    expect(
      within(footer).getByTestId('enable-update-to-latest-icon'),
    ).toBeVisible();
    expect(
      within(footer).getByTestId('disable-update-to-latest-icon'),
    ).toBeVisible();
  });

  test('should call onTagsBulk when tags action is clicked', () => {
    const {render} = rendererWithTable();
    const onTagsBulk = testing.fn();

    render(<AgentTableFooter onTagsBulk={onTagsBulk} />);

    const footer = screen.getByTestId('agents-footer');
    const tagsIcon = within(footer).getByTestId('tags-icon');

    fireEvent.click(tagsIcon);

    expect(onTagsBulk).toHaveBeenCalled();
  });

  test('should call onDeleteBulk when delete action is confirmed', () => {
    const {render} = rendererWithTable();
    const onDeleteBulk = testing.fn();

    render(<AgentTableFooter onDeleteBulk={onDeleteBulk} />);

    const footer = screen.getByTestId('agents-footer');
    const deleteIcon = within(footer).getByTestId('delete-icon');

    fireEvent.click(deleteIcon);

    expect(screen.getDialogTitle()).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(onDeleteBulk).toHaveBeenCalled();
  });

  test('should call onAuthorizeBulk when authorize action is confirmed', () => {
    const {render} = rendererWithTable();
    const onAuthorizeBulk = testing.fn();

    render(<AgentTableFooter onAuthorizeBulk={onAuthorizeBulk} />);

    const footer = screen.getByTestId('agents-footer');
    const authorizeIcon = within(footer).getByTestId('circle-plus-icon');

    fireEvent.click(authorizeIcon);

    expect(screen.getDialogTitle()).toBeVisible();
    expect(
      screen.getByText(
        /Are you sure you want to authorize all selected agents\?/,
      ),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Authorize',
      }),
    );

    expect(onAuthorizeBulk).toHaveBeenCalled();
  });

  test('should call onRevokeBulk when revoke action is confirmed', () => {
    const {render} = rendererWithTable();
    const onRevokeBulk = testing.fn();

    render(<AgentTableFooter onRevokeBulk={onRevokeBulk} />);

    const footer = screen.getByTestId('agents-footer');
    const revokeIcon = within(footer).getByTestId('circle-minus-icon');

    fireEvent.click(revokeIcon);

    expect(screen.getDialogTitle()).toBeVisible();
    expect(
      screen.getByText(/Are you sure you want to revoke all selected agents\?/),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Revoke',
      }),
    );

    expect(onRevokeBulk).toHaveBeenCalled();
  });

  test('should call onEnableUpdateToLatestBulk when enable update to latest action is confirmed', () => {
    const {render} = rendererWithTable();
    const onEnableUpdateToLatestBulk = testing.fn();

    render(
      <AgentTableFooter
        onEnableUpdateToLatestBulk={onEnableUpdateToLatestBulk}
      />,
    );

    const footer = screen.getByTestId('agents-footer');
    const enableUpdateToLatestIcon = within(footer).getByTestId(
      'enable-update-to-latest-icon',
    );

    fireEvent.click(enableUpdateToLatestIcon);

    expect(screen.getDialogTitle()).toBeVisible();
    expect(
      screen.getByText(
        /Are you sure you want to enable automatic update to latest for all selected agents\?/,
      ),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Enable automatic Update to Latest',
      }),
    );

    expect(onEnableUpdateToLatestBulk).toHaveBeenCalled();
  });

  test('should call onDisableUpdateToLatestBulk when disable update to latest action is confirmed', () => {
    const {render} = rendererWithTable();
    const onDisableUpdateToLatestBulk = testing.fn();

    render(
      <AgentTableFooter
        onDisableUpdateToLatestBulk={onDisableUpdateToLatestBulk}
      />,
    );

    const footer = screen.getByTestId('agents-footer');
    const disableUpdateToLatestIcon = within(footer).getByTestId(
      'disable-update-to-latest-icon',
    );

    fireEvent.click(disableUpdateToLatestIcon);

    expect(screen.getDialogTitle()).toBeVisible();
    expect(
      screen.getByText(
        /Are you sure you want to disable automatic update to latest for all selected agents\?/,
      ),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Disable automatic Update to Latest',
      }),
    );

    expect(onDisableUpdateToLatestBulk).toHaveBeenCalled();
  });
});
