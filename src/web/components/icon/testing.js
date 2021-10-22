/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

/* eslint-disable max-len */
import React from 'react';

import {render, fireEvent, act} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import {ICON_SIZE_SMALL_PIXELS} from './withIconSize';

export const testIcon = Icon => {
  test('should render with default width and height', () => {
    const {element} = render(<Icon />);

    expect(element).toHaveStyleRule('width', ICON_SIZE_SMALL_PIXELS);
    expect(element).toHaveStyleRule('height', ICON_SIZE_SMALL_PIXELS);
  });

  test('should handle click', () => {
    const handler = jest.fn();
    const {element} = render(<Icon onClick={handler} value="1" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('1');
  });

  test('should change appearance when disabled', () => {
    const {element} = render(<Icon disabled={true} />);

    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: '& svg path',
    });
  });

  test('should change appearance when inactive', () => {
    const {element} = render(<Icon active={false} />);

    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: '& svg path',
    });
  });

  test('should not call clickhandler when disabled', () => {
    const handler = jest.fn();
    const {element} = render(<Icon disabled={true} onClick={handler} />);

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should render loading state', async () => {
    let resolve;
    const promise = new Promise((res, rej) => {
      resolve = res;
    });

    const handler = jest.fn().mockReturnValue(promise);

    const {element} = render(
      <Icon title="foo" loadingTitle="bar" onClick={handler} />,
    );

    const svgElement = element.querySelector('svg');

    expect(element).toHaveAttribute('title', 'foo');
    expect(svgElement).toHaveAttribute('title', 'foo');

    fireEvent.click(element);

    expect(element).toHaveStyleRule('display', 'none', {
      modifier: '& svg path',
    });
    expect(element).toHaveStyleRule(
      'background',
      'url(/img/loading.gif) center center no-repeat',
      {
        modifier: '& svg',
      },
    );

    expect(element).toHaveAttribute('title', 'bar');
    expect(svgElement).toHaveAttribute('title', 'bar');

    await act(async () => {
      resolve();
    });

    expect(element).toHaveAttribute('title', 'foo');
    expect(svgElement).toHaveAttribute('title', 'foo');
  });
};

// vim: set ts=2 sw=2 tw=80:
