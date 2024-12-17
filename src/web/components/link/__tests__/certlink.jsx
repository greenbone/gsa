/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {beforeEach} from 'vitest';
import {fireEvent, rendererWith} from 'web/utils/testing';

import CertLink from '../certlink';


describe('CertLink tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
  });
  test('should render CertLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink id="foo" type="CERT-Bund" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute(
      'title',
      'View details of CERT-Bund Advisory foo',
    );
  });

  test('should render unknown type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink id="foo" type="foo" />);

    expect(element.querySelector('b')).toHaveTextContent('?');
    expect(element).toHaveTextContent('foo');
  });

  test('should route to certbund details', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink id="foo" type="CERT-Bund" />);

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/certbund/foo');
  });

  test('should route to dfncert details', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink id="foo" type="DFN-CERT" />);

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);
    expect(window.location.pathname).toEqual('/dfncert/foo');
  });

  test('should not route to unknown type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CertLink id="foo" type="foo" />);
    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/');
  });

  test('should not route in text mode', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(
      <CertLink id="foo" textOnly={true} type="DFN-CERT" />,
    );

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/');
  });
});

// vim: set ts=2 sw=2 tw=80:
