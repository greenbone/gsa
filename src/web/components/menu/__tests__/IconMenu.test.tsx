/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {fireEvent, render, screen, waitFor} from 'web/testing';
import IconMenu from 'web/components/menu/IconMenu';

describe('IconMenu', () => {
  test('renders with children and default icon', async () => {
    render(
      <IconMenu>
        <div>Child 1</div>
        <div>Child 2</div>
      </IconMenu>,
    );

    const button = screen.getByRole('button', {name: /menu/i});
    fireEvent.click(button);

    expect(screen.getByText('Menu')).toBeVisible();
    await waitFor(() => {
      expect(screen.getByText('Child 1')).toBeVisible();
      expect(screen.getByText('Child 2')).toBeVisible();
    });
  });

  test('renders with custom icon', async () => {
    render(
      <IconMenu icon={<span>Custom Icon</span>}>
        <div>Child</div>
      </IconMenu>,
    );

    const button = screen.getByRole('button', {name: /custom icon/i});
    fireEvent.click(button);

    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Child')).toBeInTheDocument();
    });
  });
});
