/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import Layout from 'web/components/layout/Layout';

describe('Layout tests', () => {
  test('should render Layout', () => {
    const {element} = render(<Layout />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'row',
      'justify-content': 'start',
      'align-items': 'center',
    });
  });

  test('should render Layout with flex', () => {
    const {element} = render(<Layout flex />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'row',
      'justify-content': 'start',
      'align-items': 'center',
    });
  });

  test('should render Layout with flex="row"', () => {
    const {element} = render(<Layout flex="row" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'row',
      'justify-content': 'start',
      'align-items': 'center',
    });
  });

  test('should render Layout with flex="column"', () => {
    const {element} = render(<Layout flex="column" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'stretch',
    });
  });

  test('should create Layout with wrap', () => {
    const {element} = render(<Layout wrap />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-wrap': 'wrap',
    });
  });

  test('should create Layout with wrap=wrap', () => {
    const {element} = render(<Layout wrap="wrap" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-wrap': 'wrap',
    });
  });

  test('should create Layout with wrap=nowrap', () => {
    const {element} = render(<Layout wrap="nowrap" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-wrap': 'nowrap',
    });
  });

  test('should create Layout with grow', () => {
    const {element} = render(<Layout grow />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-grow': '1',
    });
  });

  test('should create Layout with grow="1"', () => {
    const {element} = render(<Layout grow="1" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-grow': '1',
    });
  });

  test('should create Layout with grow="666"', () => {
    const {element} = render(<Layout grow="666" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-grow': '666',
    });
  });

  test('should create Layout with shrink', () => {
    const {element} = render(<Layout shrink />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-shrink': '1',
    });
  });

  test('should create Layout with shrink="1"', () => {
    const {element} = render(<Layout shrink="1" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-shrink': '1',
    });
  });

  test('should create Layout with shrink="666"', () => {
    const {element} = render(<Layout shrink="666" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-shrink': '666',
    });
  });

  test('should create Layout with basis="auto"', () => {
    const {element} = render(<Layout basis="auto" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-basis': 'auto',
    });
  });

  test('should create Layout with basis="20%"', () => {
    const {element} = render(<Layout basis="20%" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-basis': '20%',
    });
  });

  test('should create Layout with align="start"', () => {
    const {element} = render(<Layout align="start" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'justify-content': 'flex-start',
    });
  });

  test('should create Layout with flex="column" and align="start"', () => {
    const {element} = render(<Layout align="start" flex="column" />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'flex-start',
    });
  });

  test('should create Layout with align=[start, end]', () => {
    const {element} = render(<Layout align={['start', 'end']} />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'justify-content': 'flex-start',
      'align-items': 'flex-end',
    });
  });

  test('should create Layout with align=[stretch, center]', () => {
    const {element} = render(<Layout align={['stretch', 'center']} />);
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'justify-content': 'stretch',
      'align-items': 'center',
    });
  });

  test('should create Layout with flex="column" align=[stretch, center]', () => {
    const {element} = render(
      <Layout align={['stretch', 'center']} flex="column" />,
    );
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'stretch',
      'align-items': 'center',
    });
  });
});
