/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import path from '../path';

describe('path tests', () => {
  test('should draw a move path', () => {
    expect(path().move(10, 10).toString()).toEqual('M 10 10');
  });

  test('should draw a line path', () => {
    expect(path().line(10, 10).toString()).toEqual('L 10 10');
  });

  test('should close a path', () => {
    const p = path().move(10, 10).close();

    expect(p.toString()).toEqual('M 10 10 Z');
  });

  test('should concat path elements', () => {
    const p = path().move(10, 10);

    expect(p.toString()).toEqual('M 10 10');

    p.line(20, 20);

    expect(p.toString()).toEqual('M 10 10 L 20 20');
  });

  test('should ignore calls after close', () => {
    const p = path().move(10, 10).close();

    expect(p.toString()).toEqual('M 10 10 Z');

    p.line(20, 20);

    expect(p.toString()).toEqual('M 10 10 Z');
  });

  test('should draw default arc', () => {
    const p = path().arc(5, 5, 10, 10);

    expect(p.toString()).toEqual('A 5 5 0 0 0 10 10');
  });

  test('should draw large arc', () => {
    const p = path().arc(5, 5, 10, 10, {largeArc: 1});

    expect(p.toString()).toEqual('A 5 5 0 1 0 10 10');
  });

  test('should draw sweep arc', () => {
    const p = path().arc(5, 5, 10, 10, {sweep: 1});

    expect(p.toString()).toEqual('A 5 5 0 0 1 10 10');
  });

  test('should draw rotated arc', () => {
    const p = path().arc(5, 5, 10, 10, {rotationDegree: 20});

    expect(p.toString()).toEqual('A 5 5 20 0 0 10 10');
  });
});

// vim: set ts=2 sw=2 tw=80:
