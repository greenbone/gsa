/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {Delta} from 'gmp/models/result';
import ResultDelta from 'web/pages/results/ResultDelta';

describe('ResultDelta tests', () => {
  test('should render Delta.TYPE_NEW', () => {
    render(<ResultDelta delta={new Delta(Delta.TYPE_NEW)} />);
    expect(screen.getByTitle('New')).toHaveTextContent('[ + ]');
  });

  test('should render Delta.TYPE_CHANGED', () => {
    render(<ResultDelta delta={new Delta(Delta.TYPE_CHANGED)} />);
    expect(screen.getByTitle('Changed')).toHaveTextContent('[ ~ ]');
  });

  test('should render Delta.TYPE_GONE', () => {
    render(<ResultDelta delta={new Delta(Delta.TYPE_GONE)} />);
    expect(screen.getByTitle('Gone')).toHaveTextContent('[ − ]');
  });

  test('should render Delta.TYPE_SAME', () => {
    render(<ResultDelta delta={new Delta(Delta.TYPE_SAME)} />);
    expect(screen.getByTitle('Same')).toHaveTextContent('[ = ]');
  });

  test('should not render undefined delta', () => {
    render(<ResultDelta />);
    expect(screen.queryByTitle('New')).toBeNull();
    expect(screen.queryByTitle('Changed')).toBeNull();
    expect(screen.queryByTitle('Gone')).toBeNull();
    expect(screen.queryByTitle('Same')).toBeNull();
  });

  test('should not render unknown delta type', () => {
    render(<ResultDelta delta={{delta_type: 'UNKNOWN'}} />);
    expect(screen.queryByTitle('New')).toBeNull();
    expect(screen.queryByTitle('Changed')).toBeNull();
    expect(screen.queryByTitle('Gone')).toBeNull();
    expect(screen.queryByTitle('Same')).toBeNull();
  });
});
