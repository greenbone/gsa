/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen} from 'web/utils/testing';

import TextArea from '../textarea';

describe('TextArea tests', () => {
  test('should render', () => {
    const {element} = render(<TextArea />);

    expect(element).toBeInTheDocument();
  });

  test('should render error', () => {
    render(<TextArea errorContent="Some Error" />);

    expect(screen.getByText('Some Error')).toBeVisible();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(<TextArea data-testid="input" value="foo" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(
      <TextArea
        data-testid="input"
        name="foo"
        value="ipsum"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(
      <TextArea
        data-testid="input"
        disabled={true}
        value="foo"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
