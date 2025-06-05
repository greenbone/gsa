/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import DialogError from 'web/components/dialog/Error';
import {render, fireEvent, screen} from 'web/testing';

describe('Dialog error tests', () => {
  test('should render with defined error', () => {
    const {element} = render(
      <DialogError error="foo" onCloseClick={() => {}} />,
    );

    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('foo');
  });

  test('should not render with undefined error', () => {
    const {container} = render(<DialogError onCloseClick={() => {}} />);

    const divElement = container.querySelector('div');
    expect(divElement).not.toBeInTheDocument();
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
