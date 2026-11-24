/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, testing, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';

describe('RowDetailsToggle tests', () => {
  test('should render without crashing', () => {
    const {render} = rendererWith();

    render(<RowDetailsToggle />);

    expect(screen.getByTestId('row-details-toggle')).toBeInTheDocument();
  });

  test('should call onClick handler when row is clicked', async () => {
    const handleClick = testing.fn();
    const {render} = rendererWith();

    render(<RowDetailsToggle onClick={handleClick} />);

    const row = screen.getByTestId('row-details-toggle');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledWith();
  });

  test('exposes expansion state and the mounted details target', () => {
    const {render} = rendererWith();
    const previewLabel = 'Example < 5 & 10';
    const {rerender} = render(<RowDetailsToggle previewLabel={previewLabel} />);
    const button = screen.getByRole('button', {
      name: `Show preview for ${previewLabel}`,
    });
    expect(button).toHaveAttribute('title', `Show preview for ${previewLabel}`);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).not.toHaveAttribute('aria-controls');
    expect(button.querySelector('.lucide-chevron-down')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    rerender(
      <RowDetailsToggle
        detailsExpanded
        detailsId="details-test"
        previewLabel={previewLabel}
      />,
    );
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAccessibleName(`Hide preview for ${previewLabel}`);
    expect(button).toHaveAttribute('title', `Hide preview for ${previewLabel}`);
    expect(button).toHaveAttribute('aria-controls', 'details-test');
    expect(button.querySelector('.lucide-chevron-down')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test('supports keyboard activation and does not submit its surrounding form', async () => {
    const onClick = testing.fn();
    const onSubmit = testing.fn(event => event.preventDefault());
    const {render} = rendererWith();
    const {userEvent} = render(
      <form onSubmit={onSubmit}>
        <RowDetailsToggle previewLabel="Example" onClick={onClick} />
      </form>,
    );
    await userEvent.tab();
    expect(
      screen.getByRole('button', {name: /preview for Example/}),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenLastCalledWith();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
