/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import ManualLink from 'web/components/link/ManualLink';

const createGmp = (settings = {}) => ({
  settings: {
    manualUrl: 'http://foo.bar',
    ...settings,
  },
});

describe('ManualLink tests', () => {
  test('should render ManualLink', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink page="foo" title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with anchor', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink anchor="bar" page="foo" />);

    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html#bar');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render search page', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink page="search" searchTerm="bar" />);

    expect(element).toHaveAttribute(
      'href',
      'http://foo.bar/en/search.html?q=bar',
    );
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with german locale', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'de',
      },
    });
    const {element} = render(<ManualLink page="foo" title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/de/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with english locale', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink page="foo" title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render fallback to english locale', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink lang="foo" page="foo" title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should use manual language mapping', () => {
    const {render} = rendererWith({
      gmp: createGmp({
        manualLanguageMapping: {
          de: 'foo',
        },
      }),
      store: true,
      language: {
        language: 'en',
      },
    });
    const {element} = render(<ManualLink lang="de" page="foo" title="Foo" />);

    expect(element).toHaveAttribute('href', 'http://foo.bar/foo/foo.html');
  });
});
