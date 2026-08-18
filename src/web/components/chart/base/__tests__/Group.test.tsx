/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Group from 'web/components/chart/base/Group';

const renderGroup = (
  props: React.ComponentProps<typeof Group>,
  children?: React.ReactNode,
) => {
  const {render} = rendererWith();

  render(
    <svg>
      <Group {...props} data-testid="group">
        {children}
      </Group>
    </svg>,
  );

  return screen.getByTestId('group');
};

describe('Group', () => {
  test('should render the default transform', () => {
    expect(renderGroup({})).toHaveAttribute(
      'transform',
      'translate(0, 0),scale(1)',
    );
  });

  test('should render custom position, scale, and children', () => {
    const group = renderGroup(
      {left: 10, scale: 2, top: 20},
      <text>Content</text>,
    );
    expect(group).toHaveAttribute('transform', 'translate(10, 20),scale(2)');
    expect(group).toHaveTextContent('Content');
  });

  test('should forward click handlers and pointer styling', () => {
    const onClick = testing.fn();
    const group = renderGroup({onClick});
    fireEvent.click(group);

    expect(onClick).toHaveBeenCalledOnce();
    expect(group).toHaveStyle({cursor: 'pointer'});
  });
});
