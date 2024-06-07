/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
