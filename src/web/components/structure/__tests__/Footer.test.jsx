/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import Footer from 'web/components/structure/Footer';
import {render} from 'web/utils/Testing';


describe('Footer tests', () => {
  test('should render footer with copyright', () => {
    const currentYear = date().year();
    const {element} = render(<Footer />);

    expect(element).toHaveTextContent(
      'Copyright © 2009-' +
        currentYear +
        ' by Greenbone AG, www.greenbone.net',
    );
  });
});
