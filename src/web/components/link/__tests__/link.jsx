/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {rendererWith, fireEvent} from 'web/utils/testing';

import Link from '../link';

describe('Link tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
  });
  test('render Link', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(<Link to="foo">Foo</Link>);

    expect(element).toHaveTextContent('Foo');
  });

  test('renders correctly with anchor', () => {
    const {render} = rendererWith({router: true});

    const {container} = render(<Link anchor="section1" to="/test" />);
    expect(container.querySelector('a').getAttribute('href')).toBe(
      '/test#section1',
    );
  });

  test('should route to absolute url on click', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(<Link to="/foo">Foo</Link>);

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/foo');
  });

  test('should route to url with filter on click', () => {
    const filter = Filter.fromString('foo=bar');
    const {render} = rendererWith({router: true});

    const {element} = render(
      <Link filter={filter} to="foo">
        Foo
      </Link>,
    );

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/foo');

    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get('filter')).toEqual('foo=bar');
  });

  test('should route to url with query on click', () => {
    const {render} = rendererWith({router: true});
    const query = {foo: 'bar'};

    const {element} = render(
      <Link query={query} to="foo">
        Foo
      </Link>,
    );

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/foo');

    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get('foo')).toEqual('bar');
  });

  test('should route to url with anchor on click', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(
      <Link anchor="bar" to="foo">
        Foo
      </Link>,
    );

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/foo');
    expect(window.location.hash).toEqual('#bar');
  });

  test('should not route to url in text mode', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(
      <Link textOnly={true} to="foo">
        Foo
      </Link>,
    );

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/');
  });

  test('should render styles', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(<Link to="foo">Foo</Link>);

    expect(element).toMatchSnapshot();
  });

  test('should render styles in text mode', () => {
    const {render} = rendererWith({router: true});

    const {element} = render(
      <Link textOnly={true} to="foo">
        Foo
      </Link>,
    );

    expect(element).toMatchSnapshot();
  });
});
