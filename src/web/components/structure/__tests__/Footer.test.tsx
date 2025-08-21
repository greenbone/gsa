/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import date from 'gmp/models/date';
import Footer from 'web/components/structure/Footer';

describe('Footer tests', () => {
  test('should render footer with copyright', () => {
    const {render} = rendererWith({store: true});

    const currentYear = date().year();
    const {element} = render(<Footer />);

    expect(element).toHaveTextContent(
      'Copyright © 2009-' +
        currentYear +
        ' by Greenbone AG, www.greenbone.net',
    );
  });

  test.each([
    ['de', 'https://www.greenbone.net'],
    ['en', 'https://www.greenbone.net/en'],
  ])('should render footer with %s link', (locale, expectedHref) => {
    const {render} = rendererWith({
      store: true,
      language: {
        language: locale,
      },
    });

    const {element} = render(<Footer />);

    expect(element.querySelector('a')).toHaveAttribute('href', expectedHref);
  });
});
