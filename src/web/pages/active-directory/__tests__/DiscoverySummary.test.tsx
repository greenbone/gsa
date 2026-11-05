/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen, within} from 'web/testing';
import DiscoverySummary from 'web/pages/active-directory/DiscoverySummary';

const counts = {
  found: 6,
  unresolvable: 1,
  disabled: 1,
  captured: 1,
  available: 4,
};

describe('DiscoverySummary', () => {
  test('labels loaded computers and preserves overlapping indicators', () => {
    render(<DiscoverySummary counts={counts} showDisabled={false} />);
    const summary = screen.getByRole('group', {name: 'Discovery summary'});
    expect(within(summary).getByText('Loaded computers')).toBeVisible();
    expect(within(summary).getByText('Unresolvable')).toBeVisible();
    expect(
      within(summary)
        .getAllByRole('definition')
        .map(value => value.textContent),
    ).toEqual(['6', '1', '1', '1', '4']);
    expect(
      within(summary).getByLabelText('About discovery counts'),
    ).toBeInTheDocument();
    expect(within(summary).getByTestId('database-icon')).toBeInTheDocument();
    expect(within(summary).queryByTestId('copy-icon')).not.toBeInTheDocument();
  });

  test('announces updated counts without changing the discovery total', () => {
    const {rerender} = render(
      <DiscoverySummary counts={counts} showDisabled={false} />,
    );
    rerender(<DiscoverySummary showDisabled counts={counts} />);
    const summary = screen.getByRole('group', {name: 'Discovery summary'});
    expect(summary).toHaveAttribute('aria-live', 'polite');
    expect(
      within(summary)
        .getAllByRole('definition')
        .map(value => value.textContent),
    ).toEqual(['6', '1', '0', '1', '4']);
  });
  test('keeps all five cards and marks missing information unavailable', () => {
    render(
      <DiscoverySummary
        counts={{found: 0, disabled: 0}}
        showDisabled={false}
      />,
    );
    expect(
      screen.getAllByRole('definition').map(value => value.textContent),
    ).toEqual(['0', 'Unavailable', '0', 'Unavailable', 'Unavailable']);
  });
});
