/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/Testing';

import BlankLink from '../BlankLink';

describe('BlankLink tests', () => {
  test('should render BlankLink', () => {
    const {element} = render(<BlankLink to="foo" />);

    expect(element).toHaveAttribute('href', 'foo');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
    expect(element).toHaveAttribute('target', '_blank');
  });

  test('should forward props', () => {
    const {element} = render(
      <BlankLink title="bar" to="foo">
        Ipsum
      </BlankLink>,
    );

    expect(element).toHaveAttribute('href', 'foo');
    expect(element).toHaveAttribute('title', 'bar');
    expect(element).toHaveTextContent('Ipsum');
  });
});
