/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import DialogError from '../error';

describe('Dialog error tests', () => {
  test('should render with defined error', () => {
    const {element} = render(
      <DialogError error="foo" onCloseClick={() => {}} />,
    );

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveStyleRule('background-color', Theme.lightRed);
  });

  test('should not render with undefined error', () => {
    const {element} = render(<DialogError onCloseClick={() => {}} />);

    expect(element).toBe(null);
  });

  test('should call close handler', () => {
    const handler = testing.fn();

    const {element} = render(
      <DialogError error="foo" onCloseClick={handler} />,
    );

    const button = screen.getByTitle('Close');

    expect(element).toHaveTextContent('foo');

    fireEvent.click(button);
    expect(handler).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
