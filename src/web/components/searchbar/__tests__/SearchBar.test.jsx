/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import SearchBar from 'web/components/searchbar/SearchBar';
import {render, screen, fireEvent, waitFor} from 'web/utils/Testing';

describe('SearchBar', () => {
  const placeholder = 'Search...';
  const onSearch = testing.fn();

  test('calls onSearch with debounced input value', async () => {
    render(
      <SearchBar
        matchesCount={2}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );
    const input = screen.getByPlaceholderText(placeholder);

    fireEvent.change(input, {target: {value: 'ap'}});

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('ap');
    });
  });

  test('shows no results message when resultsCount is zero', async () => {
    render(
      <SearchBar
        matchesCount={0}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );
    const input = screen.getByPlaceholderText(placeholder);

    fireEvent.change(input, {target: {value: 'xyz'}});

    await waitFor(() => {
      expect(screen.getByText('No matches found.')).toBeVisible();
    });
  });
});
