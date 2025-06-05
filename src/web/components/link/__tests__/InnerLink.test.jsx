/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import InnerLink from 'web/components/link/InnerLink';
import {render} from 'web/testing';

describe('InnerLink tests', () => {
  test('should render InnerLink', () => {
    const {element} = render(<InnerLink to="foo" />);

    expect(element).toHaveAttribute('href', '#foo');
  });

  test('should forward props', () => {
    const {element} = render(
      <InnerLink title="bar" to="foo">
        Ipsum
      </InnerLink>,
    );

    expect(element).toHaveAttribute('href', '#foo');
    expect(element).toHaveAttribute('title', 'bar');
    expect(element).toHaveTextContent('Ipsum');
  });
});
