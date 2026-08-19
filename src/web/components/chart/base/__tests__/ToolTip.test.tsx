/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import ToolTip from 'web/components/chart/base/ToolTip';

const TestTarget = () => (
  <ToolTip content="Tooltip content">
    {({show, hide, targetRef}) => (
      <>
        <button
          ref={targetRef as React.Ref<HTMLButtonElement>}
          data-testid="target"
          onClick={show}
        >
          Target
        </button>
        <button data-testid="hide" onClick={hide} />
      </>
    )}
  </ToolTip>
);

describe('ToolTip', () => {
  test('should show content when the target is hovered', () => {
    const {render} = rendererWith();

    render(<TestTarget />);

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('target'));
    expect(screen.getByText('Tooltip content')).toBeVisible();
    expect(screen.getByTestId('target')).toHaveStyle({cursor: 'pointer'});
  });

  test('should hide content when the target is no longer hovered', () => {
    const {render} = rendererWith();

    render(<TestTarget />);
    const target = screen.getByTestId('target');
    fireEvent.click(target);
    expect(screen.getByText('Tooltip content')).toBeVisible();

    fireEvent.click(screen.getByTestId('hide'));
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  test('should not render a tooltip without content', () => {
    const {render} = rendererWith();

    render(
      <ToolTip>
        {({show, targetRef}) => (
          <button
            ref={targetRef as React.Ref<HTMLButtonElement>}
            data-testid="target"
            onClick={show}
          >
            Target
          </button>
        )}
      </ToolTip>,
    );

    fireEvent.click(screen.getByTestId('target'));
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
});
