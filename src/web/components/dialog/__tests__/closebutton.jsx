/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {
  ICON_SIZE_LARGE_PIXELS,
  ICON_SIZE_MEDIUM_PIXELS,
} from 'web/components/icon/withIconSize';

import CloseButton from '../closebutton';

describe('Dialog CloseButton tests', () => {
  test('should render', () => {
    const {element} = render(<CloseButton onClick={() => {}} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveAttribute('title', 'Close');
    expect(element).toHaveStyleRule('height', ICON_SIZE_MEDIUM_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_MEDIUM_PIXELS);
  });

  test('should call close handler', () => {
    const handler = testing.fn();

    const {element} = render(<CloseButton onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render a large button', () => {
    const {element} = render(<CloseButton onClick={() => {}} size="large" />);

    expect(element).toHaveStyleRule('height', ICON_SIZE_LARGE_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_LARGE_PIXELS);
  });
});

// vim: set ts=2 sw=2 tw=80:
