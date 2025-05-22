/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Radio from 'web/components/form/Radio';
import {render, fireEvent, screen} from 'web/utils/Testing';

describe('Radio tests', () => {
  test('should render radio', () => {
    const {element} = render(<Radio value="" />);

    expect(element).toBeInTheDocument();
  });

  test('should call change handler', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" value="" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('', undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    render(
      <Radio
        data-testid="input"
        disabled={true}
        value=""
        onChange={onChange}
      />,
    );
    const element = screen.getByTestId('input');
    fireEvent.click(element);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('should use value as number', () => {
    const onChange = testing.fn();
    render(
      <Radio<number>
        convert={parseInt}
        data-testid="input"
        value={1}
        onChange={onChange}
      />,
    );
    const element = screen.getByTestId('input');
    fireEvent.click(element);
    expect(onChange).toHaveBeenCalledWith(1, undefined);
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" value="foo" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(
      <Radio data-testid="input" name="bar" value="foo" onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(
      <Radio
        data-testid="input"
        disabled={true}
        value=""
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    render(<Radio data-testid="input" title="foo" value="" />);

    const titleElement = screen.getByLabelText('foo');
    expect(titleElement).toBeInTheDocument();
  });

  test('should not call change handler if already checked', () => {
    const onChange = testing.fn();

    render(
      <Radio
        checked={true}
        data-testid="input"
        value="foo"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });
});
