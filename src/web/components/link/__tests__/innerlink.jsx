/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import InnerLink from '../innerlink';

describe('InnerLink tests', () => {
  test('should render InnerLink', () => {
    const {element} = render(<InnerLink to="foo" />);

    expect(element).toHaveAttribute('href', '#foo');
  });

  test('should forward props', () => {
    const {element} = render(
      <InnerLink to="foo" title="bar">
        Ipsum
      </InnerLink>,
    );

    expect(element).toHaveAttribute('href', '#foo');
    expect(element).toHaveAttribute('title', 'bar');
    expect(element).toHaveTextContent('Ipsum');
  });
});
