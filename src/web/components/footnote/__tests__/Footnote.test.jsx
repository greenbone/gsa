/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import FootNote from 'web/components/footnote/Footnote';
import Theme from 'web/utils/Theme';

describe('Footnote tests', () => {
  test('should render footnote', () => {
    const {element} = render(<FootNote />);

    expect(element.tagName).toBe('DIV');
    expect(element).toHaveColor(Theme.mediumGray);
  });

  test('should render children', () => {
    const {element} = render(<FootNote>Hello World</FootNote>);

    expect(element).toHaveTextContent('Hello World');
  });
});
