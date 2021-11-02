/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import {fireEvent, rendererWith} from 'web/utils/testing';

import CertLink from '../certlink';

setLocale('en');

describe('CertLink tests', () => {
  test('should render CertLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink type="CERT-Bund" id="foo" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute(
      'title',
      'View details of CERT-Bund Advisory foo',
    );
  });

  test('should render unknown type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink type="foo" id="foo" />);

    expect(element.querySelector('b')).toHaveTextContent('?');
    expect(element).toHaveTextContent('foo');
  });

  test('should route to certbund details', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink type="CERT-Bund" id="foo" />);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/certbund/foo');
  });

  test('should route to dfncert details', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink type="DFN-CERT" id="foo" />);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/dfncert/foo');
  });

  test('should not route to unknown type', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink type="foo" id="foo" />);
    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });

  test('should not route in text mode', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <CertLink type="DFN-CERT" id="foo" textOnly={true} />,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });
});

// vim: set ts=2 sw=2 tw=80:
