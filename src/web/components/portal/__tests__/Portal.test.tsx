/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Portal from 'web/components/portal/Portal';

describe('Portal component tests', () => {
  test('should render children into the portal container', () => {
    render(
      <Portal>
        <span data-testid="portal-child">content</span>
      </Portal>,
    );

    expect(screen.getByTestId('portal-child')).toBeInTheDocument();
  });

  test('should append a child element to #portals on mount and remove it on unmount', () => {
    const portals = document.getElementById('portals');
    const childrenBefore = portals?.childElementCount ?? 0;

    const {unmount} = render(<Portal />);

    expect(portals?.childElementCount).toBe(childrenBefore + 1);

    unmount();

    expect(portals?.childElementCount).toBe(childrenBefore);
  });
});
