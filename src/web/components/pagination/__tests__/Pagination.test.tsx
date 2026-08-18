/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Pagination from 'web/components/pagination/Pagination';

const createCounts = (first = 1) =>
  new CollectionCounts({
    first,
    filtered: 25,
    length: 10,
    rows: 10,
  });

describe('Pagination tests', () => {
  test('should render nothing without counts', () => {
    render(<Pagination />);

    expect(screen.queryByText(/of/)).not.toBeInTheDocument();
  });

  test('should render the range and disable navigation at the first page', () => {
    render(
      <Pagination
        counts={createCounts()}
        onFirstClick={testing.fn()}
        onLastClick={testing.fn()}
        onNextClick={testing.fn()}
        onPreviousClick={testing.fn()}
      />,
    );

    expect(screen.getByText('1 - 10 of 25')).toBeInTheDocument();
    expect(screen.getByTitle('First')).toBeDisabled();
    expect(screen.getByTitle('Previous')).toBeDisabled();
    expect(screen.getByTitle('Next')).not.toBeDisabled();
    expect(screen.getByTitle('Last')).not.toBeDisabled();
  });

  test('should disable navigation at the last page', () => {
    render(
      <Pagination
        counts={createCounts(21)}
        onFirstClick={testing.fn()}
        onLastClick={testing.fn()}
        onNextClick={testing.fn()}
        onPreviousClick={testing.fn()}
      />,
    );

    expect(screen.getByText('21 - 30 of 25')).toBeInTheDocument();
    expect(screen.getByTitle('First')).not.toBeDisabled();
    expect(screen.getByTitle('Previous')).not.toBeDisabled();
    expect(screen.getByTitle('Next')).toBeDisabled();
    expect(screen.getByTitle('Last')).toBeDisabled();
  });

  test('should call navigation handlers', () => {
    const onFirstClick = testing.fn();
    const onLastClick = testing.fn();
    const onNextClick = testing.fn();
    const onPreviousClick = testing.fn();

    render(
      <Pagination
        counts={createCounts(11)}
        onFirstClick={onFirstClick}
        onLastClick={onLastClick}
        onNextClick={onNextClick}
        onPreviousClick={onPreviousClick}
      />,
    );

    fireEvent.click(screen.getByTitle('First'));
    fireEvent.click(screen.getByTitle('Previous'));
    fireEvent.click(screen.getByTitle('Next'));
    fireEvent.click(screen.getByTitle('Last'));

    expect(onFirstClick).toHaveBeenCalledTimes(1);
    expect(onPreviousClick).toHaveBeenCalledTimes(1);
    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(onLastClick).toHaveBeenCalledTimes(1);
  });
});
