/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import {rendererWith} from 'web/utils/testing';

import ManualLink from '../manuallink';

const createGmp = (settings = {}) => ({
  settings: {
    manualUrl: 'http://foo.bar',
    ...settings,
  },
});

describe('ManualLink tests', () => {
  test('should render ManualLink', () => {
    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink title="Foo" page="foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with anchor', () => {
    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink page="foo" anchor="bar" />);

    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html#bar');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render search page', () => {
    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink page="search" searchTerm="bar" />);

    expect(element).toHaveAttribute(
      'href',
      'http://foo.bar/en/search.html?q=bar',
    );
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with german locale', () => {
    setLocale('de');

    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink title="Foo" page="foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/de/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render with english locale', () => {
    setLocale('en');

    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink title="Foo" page="foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar/en/foo.html');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should render fallback to english locale', () => {
    const {render} = rendererWith({gmp: createGmp()});
    const {element} = render(<ManualLink title="Foo" lang="foo" page="foo" />);

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
    });
    const {element} = render(<ManualLink title="Foo" lang="de" page="foo" />);

    expect(element).toHaveAttribute('href', 'http://foo.bar/foo/foo.html');
  });
});

// vim: set ts=2 sw=2 tw=80:
