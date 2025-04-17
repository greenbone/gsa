/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import TabPanels from 'web/components/tab/TabPanels';
import {render, screen} from 'web/utils/Testing';

describe('TabPanels', () => {
  test('should render the active tab panel', () => {
    const {rerender} = render(
      <TabPanels active={1}>
        <div data-testid="panel-1">Panel 1</div>
        <div data-testid="panel-2">Panel 2</div>
      </TabPanels>,
    );

    expect(screen.queryByTestId('panel-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('panel-2')).toBeInTheDocument();

    // Change the active tab
    rerender(
      <TabPanels active={0}>
        <div data-testid="panel-1">Panel 1</div>
        <div data-testid="panel-2">Panel 2</div>
      </TabPanels>,
    );
    expect(screen.queryByTestId('panel-1')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-2')).not.toBeInTheDocument();
  });
});
