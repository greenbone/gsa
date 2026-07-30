/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  testing,
  beforeEach,
  afterEach,
} from '@gsa/testing';
import {render, screen, fireEvent, act} from 'web/testing';
import SearchBar from 'web/components/searchbar/SearchBar';

const placeholder = 'Search...';

describe('SearchBar', () => {
  beforeEach(() => {
    testing.useFakeTimers();
  });

  afterEach(() => {
    testing.useRealTimers();
  });

  test('should render the search input with the given placeholder', () => {
    const onSearch = testing.fn();
    render(
      <SearchBar
        matchesCount={2}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );

    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  test('should call onSearch with an empty string on initial render', async () => {
    const onSearch = testing.fn();
    render(
      <SearchBar
        matchesCount={2}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );

    await act(async () => testing.advanceTimersByTime(200));

    expect(onSearch).toHaveBeenCalledWith('');
  });

  test('should call onSearch with the debounced input value after typing', async () => {
    const onSearch = testing.fn();
    render(
      <SearchBar
        matchesCount={2}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(placeholder), {
      target: {value: 'ap'},
    });

    await act(async () => testing.advanceTimersByTime(200));

    expect(onSearch).toHaveBeenCalledWith('ap');
  });

  test('should show "No matches found" when matchesCount is 0', () => {
    const onSearch = testing.fn();
    render(
      <SearchBar
        matchesCount={0}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );

    expect(screen.getByText('No matches found.')).toBeInTheDocument();
  });

  test('should not show "No matches found" when matchesCount is greater than 0', () => {
    const onSearch = testing.fn();
    render(
      <SearchBar
        matchesCount={3}
        placeholder={placeholder}
        onSearch={onSearch}
      />,
    );

    expect(screen.queryByText('No matches found.')).not.toBeInTheDocument();
  });
});
