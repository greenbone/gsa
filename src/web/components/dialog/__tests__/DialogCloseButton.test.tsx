/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/testing';
import DialogCloseButton from 'web/components/dialog/DialogCloseButton';
import {
  ICON_SIZE_LARGE_PIXELS,
  ICON_SIZE_MEDIUM_PIXELS,
} from 'web/hooks/useIconSize';

describe('DialogCloseButton tests', () => {
  test('should render', () => {
    const {element} = render(<DialogCloseButton onClick={() => {}} />);

    expect(element).toHaveAttribute('title', 'Close');
    expect(element).toHaveStyleRule('height', ICON_SIZE_MEDIUM_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_MEDIUM_PIXELS);
  });

  test('should call close handler', () => {
    const handler = testing.fn();

    const {element} = render(<DialogCloseButton onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render a large button', () => {
    const {element} = render(
      <DialogCloseButton size="large" onClick={() => {}} />,
    );

    expect(element).toHaveStyleRule('height', ICON_SIZE_LARGE_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_LARGE_PIXELS);
  });
});
