/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Layout from 'web/components/layout/layout';

import {render} from 'web/utils/testing';

describe('Layout tests', () => {
  test('should render Layout', () => {
    const {element} = render(<Layout />);
    expect(element).toMatchSnapshot();
  });

  test('should render Layout with flex', () => {
    const {element} = render(<Layout flex />);
    expect(element).toMatchSnapshot();
  });

  test('should render Layout with flex="row"', () => {
    const {element} = render(<Layout flex="row" />);
    expect(element).toMatchSnapshot();
  });

  test('should render Layout with flex="column"', () => {
    const {element} = render(<Layout flex="column" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with wrap', () => {
    const {element} = render(<Layout wrap />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with wrap=wrap', () => {
    const {element} = render(<Layout wrap="wrap" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with wrap=nowrap', () => {
    const {element} = render(<Layout wrap="nowrap" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with grow', () => {
    const {element} = render(<Layout grow />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with grow="1"', () => {
    const {element} = render(<Layout grow="1" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with grow="666"', () => {
    const {element} = render(<Layout grow="666" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with shrink', () => {
    const {element} = render(<Layout shrink />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with shrink="1"', () => {
    const {element} = render(<Layout shrink="1" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with shrink="666"', () => {
    const {element} = render(<Layout shrink="666" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with basis="auto"', () => {
    const {element} = render(<Layout basis="auto" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with basis="20%"', () => {
    const {element} = render(<Layout basis="20%" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with align="start"', () => {
    const {element} = render(<Layout align="start" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with flex="column" and align="start"', () => {
    const {element} = render(<Layout flex="column" align="start" />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with align=[start, end]', () => {
    const {element} = render(<Layout align={['start', 'end']} />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with align=[stretch, center]', () => {
    const {element} = render(<Layout align={['stretch', 'center']} />);
    expect(element).toMatchSnapshot();
  });

  test('should create Layout with flex="column" align=[stretch, center]', () => {
    // eslint-disable-line max-len
    const {element} = render(
      <Layout flex="column" align={['stretch', 'center']} />,
    );
    expect(element).toMatchSnapshot();
  });
});

// vim: set ts=2 sw=2 tw=80:
