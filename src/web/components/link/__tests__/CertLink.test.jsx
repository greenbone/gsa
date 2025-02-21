/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';

import CertLink from '../CertLink';

describe('CertLink tests', () => {
  test('should render CertLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(<CertLink id="foo" type="CERT-Bund" />);

    const element = screen.getByText('foo');
    expect(element).toHaveAttribute(
      'title',
      'View details of CERT-Bund Advisory foo',
    );
  });

  test('should render unknown type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(<CertLink id="foo" type="foo" />);

    const element = screen.getByText('foo');
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(element).toHaveTextContent('foo');
  });

  test('should route to certbund details', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CertLink id="foo" type="CERT-Bund" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('foo'));

    expect(locationPathname).toHaveTextContent('/certbund/foo');
  });

  test('should route to dfncert details', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CertLink id="foo" type="DFN-CERT" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('foo'));

    expect(locationPathname).toHaveTextContent('/dfncert/foo');
  });

  test('should not route to unknown type', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CertLink id="foo" type="foo" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('foo'));

    expect(locationPathname).toHaveTextContent('/');
  });

  test('should not route in text mode', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    render(<CertLink id="foo" textOnly={true} type="DFN-CERT" />);

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');

    fireEvent.click(screen.getByText('foo'));

    expect(locationPathname).toHaveTextContent('/');
  });
});
