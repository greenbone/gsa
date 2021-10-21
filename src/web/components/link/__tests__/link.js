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

import {rendererWith, fireEvent} from 'web/utils/testing';

import Link from '../link';
import Filter from 'gmp/models/filter';

describe('Link tests', () => {
  test('render Link', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(<Link to="foo">Foo</Link>);

    expect(element).toHaveTextContent('Foo');
  });

  test('should route to url on click', () => {
    const {render, history} = rendererWith({router: true});

    const {element} = render(<Link to="foo">Foo</Link>);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo');
  });

  test('should route to absolute url on click', () => {
    const {render, history} = rendererWith({router: true});

    const {element} = render(<Link to="/foo">Foo</Link>);

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo');
  });

  test('should route to url with filter on click', () => {
    const filter = Filter.fromString('foo=bar');
    const {render, history} = rendererWith({router: true});

    const {element} = render(
      <Link to="foo" filter={filter}>
        Foo
      </Link>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo');
    expect(history.location.query).toEqual({filter: 'foo=bar'});
  });

  test('should route to url with query on click', () => {
    const {render, history} = rendererWith({router: true});
    const query = {foo: 'bar'};

    const {element} = render(
      <Link to="foo" query={query}>
        Foo
      </Link>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo');
    expect(history.location.query).toEqual(query);
  });

  test('should route to url with anchor on click', () => {
    const {render, history} = rendererWith({router: true});

    const {element} = render(
      <Link to="foo" anchor="bar">
        Foo
      </Link>,
    );

    expect(history.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/foo');
    expect(history.location.hash).toEqual('#bar');
  });

  test('should not route to url in text mode', () => {
    const {render, history} = rendererWith({router: true});

    const {element} = render(
      <Link to="foo" textOnly={true}>
        Foo
      </Link>,
    );

    fireEvent.click(element);

    expect(history.location.pathname).toEqual('/');
  });

  test('should render styles', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(<Link to="foo">Foo</Link>);

    expect(element).toMatchSnapshot();
  });

  test('should render styles in text mode', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(
      <Link to="foo" textOnly={true}>
        Foo
      </Link>,
    );

    expect(element).toMatchSnapshot();
  });
});

// vim: set ts=2 sw=2 tw=80:
