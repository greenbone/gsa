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

import Capabilities from 'gmp/capabilities/capabilities';

import {fireEvent, rendererWith} from 'web/utils/testing';

import DetailsLink from '../detailslink';

describe('DetailsLink tests', () => {
  test('should render DetailsLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <DetailsLink title="Foo" type="foo" id="bar">
        Foo
      </DetailsLink>,
    );

    expect(element).toHaveTextContent('Foo');
    expect(element).toHaveAttribute('title', 'Foo');
  });

  test('should route to url', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});

    const {element} = render(
      <DetailsLink title="Foo" type="foo" id="1">
        Foo
      </DetailsLink>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo/1');
  });

  test('should url encode id', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});

    const {element} = render(
      <DetailsLink title="Foo" type="foo" id="cpe:/a:jenkins:jenkins:2.141">
        Foo
      </DetailsLink>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual(
      '/foo/cpe%3A%2Fa%3Ajenkins%3Ajenkins%3A2.141',
    );
  });

  test('should not route to url in text mode', () => {
    const {render, history} = rendererWith({capabilities: true, router: true});

    const {element} = render(
      <DetailsLink title="Foo" type="foo" id="1" textOnly={true}>
        Foo
      </DetailsLink>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });

  test('should not route to url without capabilities', () => {
    const capabilities = new Capabilities();
    const {render, history} = rendererWith({capabilities, router: true});

    const {element} = render(
      <DetailsLink title="Foo" type="foo" id="1">
        Foo
      </DetailsLink>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });
});

// vim: set ts=2 sw=2 tw=80:
