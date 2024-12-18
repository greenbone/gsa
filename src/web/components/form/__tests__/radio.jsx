/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/utils/testing';

import Radio from '../radio';

describe('Radio tests', () => {
  test('should render radio', () => {
    const {element} = render(<Radio />);

    expect(element).toBeInTheDocument();
  });

  test('should call change handler', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalled();
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

    render(<Radio data-testid="input" disabled={true} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    const {element} = render(<Radio data-testid="input" title="foo" />);

    const titleElement = element.querySelector('label');
    expect(titleElement).toHaveTextContent('foo');
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
