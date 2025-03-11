/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import Footer from 'web/components/structure/Footer';
import {setLocale} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';

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
    const {store, render} = rendererWith({store: true});

    store.dispatch(setLocale(locale));

    const {element} = render(<Footer />);

    expect(element.querySelector('a')).toHaveAttribute('href', expectedHref);
  });
});
