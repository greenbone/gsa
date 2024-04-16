/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent, screen, userEvent} from 'web/utils/testing';

import Spinner from '../spinner';

const getInput = element =>
  element.querySelector('input.mantine-NumberInput-input');

const getIncrementButton = element =>
  element.querySelector('.mantine-NumberInput-controlUp');
const getDecrementButton = element =>
  element.querySelector('.mantine-NumberInput-controlDown');

const clickIncrementButton = async element =>
  await userEvent.click(getIncrementButton(element));

const clickDecrementButton = async element =>
  await userEvent.click(getDecrementButton(element));

describe('Spinner tests', () => {
  test('should render', () => {
    render(<Spinner data-testid="input" value={1} />);

    const element = screen.getByTestId('input');

    expect(element).toHaveAttribute('value', '1');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    render(<Spinner data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should call change handler for characters with empty string', () => {
    const onChange = testing.fn();
    render(<Spinner data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'ABC'}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
  });

  test('should allow to clear input', () => {
    const onChange = testing.fn();
    render(<Spinner data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();
    render(
      <Spinner data-testid="input" name="foo" value={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, 'foo');
    expect(element).toHaveAttribute('value', '2');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    render(
      <Spinner
        data-testid="input"
        disabled={true}
        value={1}
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should update value', () => {
    const onChange = testing.fn();
    const {rerender} = render(
      <Spinner data-testid="input" value={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');

    rerender(<Spinner data-testid="input" value={2} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '2');

    rerender(<Spinner data-testid="input" value={3} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '3');
  });

  test('should use max if value > max', () => {
    const onChange = testing.fn();
    render(
      <Spinner data-testid="input" value={1} max={2} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '3'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should use min if value < min', () => {
    const onChange = testing.fn();
    render(
      <Spinner data-testid="input" value={2} min={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '0'}});

    expect(onChange).toHaveBeenCalledWith(1, undefined);
    expect(element).toHaveAttribute('value', '1');
  });

  test('should increment value on button click', async () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} onChange={handler} />);

    await clickIncrementButton(element);

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should decrement value on button click', async () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} onChange={handler} />);

    await clickDecrementButton(element);

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should increment on key up', () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} onChange={handler} />);

    const input = getInput(element);

    fireEvent.keyDown(input, {key: 'ArrowUp', keyCode: KeyCode.UP});

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should decrement on key down', () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} onChange={handler} />);

    const input = getInput(element);

    fireEvent.keyDown(input, {key: 'ArrowDown', keyCode: KeyCode.DOWN});

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should not call event handler if disabled', () => {
    const handler = testing.fn();
    const {element} = render(
      <Spinner disabled={true} value={1} onChange={handler} />,
    );

    const input = getInput(element);
    fireEvent.keyDown(input, {key: 'ArrowDown', keyCode: KeyCode.DOWN});
    fireEvent.keyDown(input, {key: 'ArrowUp', keyCode: KeyCode.UP});

    expect(getIncrementButton(element)).toBeNull();
    expect(getDecrementButton(element)).toBeNull();

    expect(handler).not.toHaveBeenCalled();
  });

  test('should not increment value beyond max', async () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} max={1} onChange={handler} />);

    await clickIncrementButton(element);

    expect(handler).toHaveBeenCalledWith(1, undefined);
  });

  test('should not decrement value below min', async () => {
    const handler = testing.fn();
    const {element} = render(<Spinner value={1} min={1} onChange={handler} />);

    await clickDecrementButton(element);

    expect(handler).toHaveBeenCalledWith(1, undefined);
  });

  test('should increment float value', async () => {
    const handler = testing.fn();
    const {element} = render(
      <Spinner type="float" value={1.1} onChange={handler} />,
    );

    await clickIncrementButton(element);

    expect(handler).toHaveBeenCalledWith(1.2, undefined);
  });

  test('should increment value with step', async () => {
    const handler = testing.fn();
    const {element} = render(
      <Spinner step={0.5} type="float" value={1} onChange={handler} />,
    );

    await clickIncrementButton(element);

    expect(handler).toHaveBeenCalledWith(1.5, undefined);
  });
});
