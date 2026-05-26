/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, rendererWith, screen} from 'web/testing';
import HttpMethodPart from 'web/pages/alerts/dialog/HttpMethodPart';

describe('HttpMethodPart tests', () => {
  test('should render with URL', () => {
    const onChange = testing.fn();
    const {render} = rendererWith();
    render(<HttpMethodPart URL="http://example.com" onChange={onChange} />);

    expect(screen.getByRole('textbox', {name: 'HTTP Get URL'})).toHaveValue(
      'http://example.com',
    );
  });

  test('should call onChange when URL changes', () => {
    const onChange = testing.fn();
    const {render} = rendererWith();
    render(<HttpMethodPart URL="http://example.com" onChange={onChange} />);

    changeInputValue(
      screen.getByRole('textbox', {name: 'HTTP Get URL'}),
      'http://new-url.com',
    );

    expect(onChange).toHaveBeenCalledWith('http://new-url.com', 'URL');
  });

  test('should add prefix to name', () => {
    const onChange = testing.fn();
    const {render} = rendererWith();
    render(
      <HttpMethodPart
        URL="http://example.com"
        prefix="method"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'HTTP Get URL'})).toHaveAttribute(
      'name',
      'method_URL',
    );
  });
});
