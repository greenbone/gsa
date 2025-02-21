/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CveLink from 'web/components/link/CveLink';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';


describe('CveLink tests', () => {
  test('should render CveLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(<CveLink id="foo" title="Foo" />);

    const element = screen.getByText('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should not override type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(<CveLink id="foo" title="Foo" type="bar" />);

    const element = screen.getByText('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should route to details', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CveLink id="foo" title="Foo" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByTestId('details-link'));

    expect(locationPathname).toHaveTextContent('/cve/foo');
  });

  test('should not route to details in text mode', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CveLink id="foo" textOnly={true} title="Foo" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('foo'));

    expect(locationPathname).toHaveTextContent('/');
  });
});
