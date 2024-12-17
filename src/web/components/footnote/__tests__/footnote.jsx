/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';

import FootNote from '../footnote';

describe('Footnote tests', () => {
  test('should render footnote', () => {
    const {element} = render(<FootNote />);

    expect(element).toMatchSnapshot();
  });

  test('should render children', () => {
    const {element} = render(<FootNote>Hello World</FootNote>);

    expect(element).toHaveTextContent('Hello World');
  });
});
