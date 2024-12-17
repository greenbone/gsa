/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, rendererWith} from 'web/utils/testing';

import CveLink from '../cvelink';

describe('CveLink tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test page', '/');
  });
  test('should render CveLink', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink id="foo" title="Foo" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should not override type', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink id="foo" title="Foo" type="bar" />);

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', '/cve/foo');
  });

  test('should route to details', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink id="foo" title="Foo" />);

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/cve/foo');
  });

  test('should not route to details in text mode', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<CveLink id="foo" textOnly={true} title="Foo" />);

    expect(window.location.pathname).toEqual('/');

    fireEvent.click(element);

    expect(window.location.pathname).toEqual('/');
  });
});

// vim: set ts=2 sw=2 tw=80:
