/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
