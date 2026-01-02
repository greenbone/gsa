/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import date from 'gmp/models/date';
import Footer from 'web/components/structure/Footer';

describe('Footer tests', () => {
  test('should render footer with copyright', () => {
    const {render} = rendererWith({store: true});

    const currentYear = date().year();
    render(<Footer />);

    const copyrightText = `Copyright © 2009-${currentYear} by Greenbone AG,`;
    expect(screen.getByText(copyrightText)).toBeInTheDocument();

    expect(
      screen.getByRole('link', {name: 'www.greenbone.net'}),
    ).toHaveAttribute('href', 'https://www.greenbone.net/en');
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

    render(<Footer />);

    expect(screen.getByRole('link')).toHaveAttribute('href', expectedHref);
  });
});
