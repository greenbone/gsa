/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import ToolBar from 'web/components/bar/ToolBar';

describe('Toolbar tests', () => {
  test('should render with children', () => {
    render(
      <ToolBar>
        <button>Test Button</button>
      </ToolBar>,
    );

    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toBeVisible();
    expect(toolbar).toHaveStyle('display: flex');
    expect(toolbar).toHaveStyle('justify-content: space-between');
    expect(toolbar).toHaveStyle('align-items: flex-start');

    expect(screen.getByRole('button')).toBeVisible();
  });
});
