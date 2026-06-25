/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collection-counts';

describe('CollectionCounts tests', () => {
  test('should use 0 defaults', () => {
    const counts = new CollectionCounts();

    expect(counts.first).toEqual(0);
    expect(counts.all).toEqual(0);
    expect(counts.filtered).toEqual(0);
    expect(counts.length).toEqual(0);
    expect(counts.rows).toEqual(0);
    expect(counts.last).toEqual(0);

    expect(counts.isFirst()).toEqual(false);
    expect(counts.hasPrevious()).toEqual(false);
    expect(counts.isLast()).toEqual(true);
    expect(counts.hasNext()).toEqual(false);
  });

  test('should parse numeric string values and compute navigation flags', () => {
    const counts = new CollectionCounts({
      first: '11',
      all: '100',
      filtered: '21',
      length: '10',
      rows: '10',
    });

    expect(counts.first).toEqual(11);
    expect(counts.all).toEqual(100);
    expect(counts.filtered).toEqual(21);
    expect(counts.length).toEqual(10);
    expect(counts.rows).toEqual(10);
    expect(counts.last).toEqual(20);

    expect(counts.isFirst()).toEqual(false);
    expect(counts.hasPrevious()).toEqual(true);
    expect(counts.isLast()).toEqual(false);
    expect(counts.hasNext()).toEqual(true);
  });

  test('should treat invalid numeric values as 0', () => {
    const counts = new CollectionCounts({
      first: 'foo',
      all: 'bar',
      filtered: 'baz',
      length: 'test',
      rows: 'abc',
    });

    expect(counts.first).toEqual(0);
    expect(counts.all).toEqual(0);
    expect(counts.filtered).toEqual(0);
    expect(counts.length).toEqual(0);
    expect(counts.rows).toEqual(0);
    expect(counts.last).toEqual(0);
  });

  test('should report last page correctly', () => {
    const counts = new CollectionCounts({
      first: 11,
      filtered: 20,
      length: 10,
      rows: 10,
    });

    expect(counts.last).toEqual(20);
    expect(counts.isLast()).toEqual(true);
    expect(counts.hasNext()).toEqual(false);
  });

  test('should clone and override selected values only', () => {
    const counts = new CollectionCounts({
      first: 1,
      all: 10,
      filtered: 8,
      length: 5,
      rows: 5,
    });

    const clone = counts.clone({first: 6, filtered: 10});

    expect(clone).not.toBe(counts);
    expect(clone.first).toEqual(6);
    expect(clone.all).toEqual(10);
    expect(clone.filtered).toEqual(10);
    expect(clone.length).toEqual(5);
    expect(clone.rows).toEqual(5);
    expect(clone.last).toEqual(10);

    expect(counts.first).toEqual(1);
    expect(counts.filtered).toEqual(8);
  });
});
