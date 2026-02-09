/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import HorizontalSep from 'web/components/layout/HorizontalSep';

describe('HorizontalSep tests', () => {
  test('should render', () => {
    const {element} = render(<HorizontalSep />);
    expect(element.tagName).toBe('DIV');
    expect(element.children).toHaveLength(1);
    expect(element.children[0].tagName).toBe('DIV');
  });

  test('should render with separator option', () => {
    const {element} = render(<HorizontalSep $separator="|" />);
    expect(element.tagName).toBe('DIV');
    expect(element.children).toHaveLength(1);
    expect(element.children[0].tagName).toBe('DIV');
  });

  test('should render with spacing', () => {
    const {element} = render(<HorizontalSep $separator="|" $spacing="10px" />);
    expect(element.tagName).toBe('DIV');
    expect(element.children).toHaveLength(1);
    expect(element.children[0].tagName).toBe('DIV');
  });

  test('should allow to wrap', () => {
    const {element} = render(<HorizontalSep $wrap />);
    expect(element.tagName).toBe('DIV');
    expect(element.children).toHaveLength(1);
    expect(element.children[0].tagName).toBe('DIV');
  });
});
