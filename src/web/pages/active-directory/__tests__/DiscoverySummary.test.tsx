/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen, within} from 'web/testing';
import {
  emptyDirectoryGraph,
  replaceDirectorySnapshot,
} from 'gmp/models/directory-graph';
import {summarizeDirectory} from 'web/pages/active-directory/directory-summary';
import DiscoverySummary from 'web/pages/active-directory/DiscoverySummary';

const counts = {
  found: 6,
  unresolvable: 1,
  disabled: 1,
  captured: 1,
  available: 4,
};

describe('DiscoverySummary', () => {
  test('clears partial status when a refreshed parent drops the partial branch', () => {
    let graph = replaceDirectorySnapshot(
      emptyDirectoryGraph(),
      'directory-root',
      'root',
      [{id: 'parent', kind: 'ou', name: 'Parent', parentDn: ''}],
      true,
    );
    graph = replaceDirectorySnapshot(
      graph,
      'parent',
      'first',
      [{id: 'child', kind: 'ou', name: 'Child', parentDn: 'parent'}],
      true,
    );
    graph = replaceDirectorySnapshot(graph, 'child', 'child', [], false);
    expect(summarizeDirectory(graph).isPartial).toBe(true);

    graph = replaceDirectorySnapshot(graph, 'parent', 'refresh', [], true);
    expect(summarizeDirectory(graph).isPartial).toBe(false);
  });
  test('labels loaded computers and preserves overlapping indicators', () => {
    render(<DiscoverySummary counts={counts} showDisabled={false} />);
    const summary = screen.getByRole('group', {name: 'Discovery summary'});
    const loaded = within(summary).getByText('Loaded computers');
    expect(loaded).toBeVisible();
    expect(within(summary).getByText('Unresolvable')).toBeVisible();
    expect(
      within(summary)
        .getAllByRole('definition')
        .map(value => value.textContent),
    ).toEqual(['6', '1', '1', '1', '4']);
    expect(loaded).toHaveAttribute(
      'title',
      expect.stringContaining(
        'Results may be partial and indicators can overlap.',
      ),
    );
    expect(within(summary).getByTestId('database-icon')).toBeInTheDocument();
    expect(within(summary).queryByTestId('copy-icon')).not.toBeInTheDocument();
  });

  test('puts the discovery counts explanation in the partial badge title', () => {
    render(<DiscoverySummary isPartial counts={counts} showDisabled={false} />);
    expect(screen.queryByTestId('info-i')).not.toBeInTheDocument();
    expect(
      screen.getByTitle(/Results may be partial and indicators can overlap/),
    ).toContainElement(screen.getByText('Partial', {exact: true}));
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
