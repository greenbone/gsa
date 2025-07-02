/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Toolbar from 'web/components/bar/Toolbar';

describe('Toolbar tests', () => {
  test('should render with children', () => {
    render(
      <Toolbar>
        <button>Test Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toBeVisible();
    expect(toolbar).toHaveStyle('display: flex');
    expect(toolbar).toHaveStyle('justify-content: space-between');
    expect(toolbar).toHaveStyle('align-items: flex-start');

    expect(screen.getByRole('button')).toBeVisible();
  });
});
