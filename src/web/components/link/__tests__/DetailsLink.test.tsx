/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import DetailsLink from 'web/components/link/DetailsLink';

describe('DetailsLink tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
  });

  test('should render DetailsLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <DetailsLink id="bar" title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    const element = screen.getByText('Foo');
    expect(element).toHaveAttribute('title', 'Foo');
  });

  test('should route to url', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(
      <DetailsLink id="1" title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/foo/1');
  });

  test('should url encode id', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(
      <DetailsLink id="cpe:/a:jenkins:jenkins:2.141" title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent(
      '/foo/cpe%3A%2Fa%3Ajenkins%3Ajenkins%3A2.141',
    );
  });

  test('should not route to url in text mode', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(
      <DetailsLink id="1" textOnly={true} title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/');
  });

  test('should not route to url without capabilities', () => {
    const capabilities = new Capabilities();
    const {render} = rendererWith({
      capabilities,
      router: true,
      showLocation: true,
    });
    render(
      <DetailsLink id="1" title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('Foo'));

    expect(locationPathname).toHaveTextContent('/');
  });

  test('should render with textOnly', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <DetailsLink id="1" textOnly={true} title="Foo" type="foo">
        Foo
      </DetailsLink>,
    );

    expect(element).toHaveTextContent('Foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).not.toHaveAttribute('href');
  });
});
