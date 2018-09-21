/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import renderer from 'react-test-renderer';

import 'jest-styled-components';

import Layout from 'web/components/layout/layout';

describe('Layout tests', () => {

  test('should render Layout', () => {
    const tree = renderer.create(<Layout/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should render Layout with flex', () => {
    const tree = renderer.create(<Layout flex/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should render Layout with flex="row"', () => {
    const tree = renderer.create(<Layout flex="row" />).toJSON();
    expect(tree).toMatchSnapshot();

  });

  test('should render Layout with flex="column"', () => {
    const tree = renderer.create(<Layout flex="column" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with wrap', () => {
    const tree = renderer.create(<Layout wrap/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with wrap=wrap', () => {
    const tree = renderer.create(<Layout wrap="wrap"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with wrap=nowrap', () => {
    const tree = renderer.create(<Layout wrap="nowrap"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with grow', () => {
    const tree = renderer.create(<Layout grow/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with grow="1"', () => {
    const tree = renderer.create(<Layout grow="1"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with grow="666"', () => {
    const tree = renderer.create(<Layout grow="666"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with shrink', () => {
    const tree = renderer.create(<Layout shrink/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with shrink="1"', () => {
    const tree = renderer.create(<Layout shrink="1"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with shrink="666"', () => {
    const tree = renderer.create(<Layout shrink="666"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with basis="auto"', () => {
    const tree = renderer.create(<Layout basis="auto"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with basis="20%"', () => {
    const tree = renderer.create(<Layout basis="20%"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with align="start"', () => {
    const tree = renderer.create(<Layout align="start"/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with flex="column" and align="start"', () => {
    const tree = renderer.create(<Layout flex="column" align="start"/>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with align=[start, end]', () => {
    const tree = renderer.create(<Layout align={['start', 'end']}/>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with align=[stretch, center]', () => {
    const tree = renderer.create(<Layout align={['stretch', 'center']}/>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should create Layout with flex="column" align=[stretch, center]', () => { // eslint-disable-line max-len
    const tree = renderer.create(
      <Layout
        flex="column"
        align={['stretch', 'center']}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

});

// vim: set ts=2 sw=2 tw=80:
