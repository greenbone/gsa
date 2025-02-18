/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import Link from '../link';

describe('Link tests', () => {
  test('render Link', () => {
    const {render} = rendererWith({router: true});
    render(<Link to="foo">Foo</Link>);

    const element = screen.getByText('Foo');
    expect(element).toHaveTextContent('Foo');
  });

  test('renders correctly with anchor', () => {
    const {render} = rendererWith({router: true});
    render(<Link anchor="section1" to="/test" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test#section1');
  });

  test('should route to absolute url on click', () => {
    const {render} = rendererWith({
      router: true,
      showLocation: true,
    });
    render(<Link to="/foo">Foo</Link>);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/foo');
  });

  test('should route to url with filter on click', () => {
    const filter = Filter.fromString('foo=bar');
    const {render} = rendererWith({
      router: true,
      showLocation: true,
    });
    render(
      <Link filter={filter} to="foo">
        Foo
      </Link>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/foo');
    expect(
      decodeURIComponent(screen.getByTestId('location-search').textContent),
    ).toBe('?filter=foo=bar');
  });

  test('should route to url with query on click', () => {
    const query = {foo: 'bar'};
    const {render} = rendererWith({
      router: true,
      showLocation: true,
    });
    render(
      <Link query={query} to="foo">
        Foo
      </Link>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/foo');
    expect(screen.getByTestId('location-search')).toHaveTextContent('?foo=bar');
  });

  test('should route to url with anchor on click', () => {
    const {render} = rendererWith({
      router: true,
      showLocation: true,
    });
    render(
      <Link anchor="bar" to="foo">
        Foo
      </Link>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));
    expect(locationPathname).toHaveTextContent('/foo');

    expect(screen.getByTestId('location-hash')).toHaveTextContent('#bar');
  });

  test('should not route to url in text mode', () => {
    const {render} = rendererWith({
      router: true,
      showLocation: true,
    });
    render(
      <Link textOnly={true} to="foo">
        Foo
      </Link>,
    );

    fireEvent.click(screen.getByText('Foo'));

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');
  });

  test('should render styles', () => {
    const {render} = rendererWith({router: true});
    render(<Link to="foo">Foo</Link>);

    const element = screen.getByText('Foo');
    const style = window.getComputedStyle(element);

    expect(style.display).toBe('inline-flex');
    expect(style.fontSize).toBe('var(--mantine-font-size-md)');
    expect(element).toHaveTextContent('Foo');
  });

  test('should render styles in text mode', () => {
    const {render} = rendererWith({router: true});
    render(
      <Link textOnly={true} to="foo">
        Foo
      </Link>,
    );

    const element = screen.getByText('Foo');
    const style = window.getComputedStyle(element);

    expect(style.display).toBe('inline-flex');
    expect(style.fontSize).toBe('var(--mantine-font-size-md)');
    expect(element).toHaveTextContent('Foo');
  });
});
