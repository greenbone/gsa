/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent, waitFor} from 'web/utils/testing';

import SearchBar from '../searchbar';

describe('SearchBar', () => {
  const placeholder = 'Search...';
  const onSearch = testing.fn();

  test('calls onSearch with debounced input value', async () => {
    render(
      <SearchBar
        placeholder={placeholder}
        resultsCount={2}
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
        placeholder={placeholder}
        resultsCount={0}
        onSearch={onSearch}
      />,
    );
    const input = screen.getByPlaceholderText(placeholder);

    fireEvent.change(input, {target: {value: 'xyz'}});

    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeVisible();
    });
  });
});
