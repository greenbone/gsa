/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
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
    const {element} = render(<Layout align="start" flex="column" />);
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
    const {element} = render(
      <Layout align={['stretch', 'center']} flex="column" />,
    );
    expect(element).toMatchSnapshot();
  });
});
