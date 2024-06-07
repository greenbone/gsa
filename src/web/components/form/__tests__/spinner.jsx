/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent} from 'web/utils/testing';

import Spinner from '../spinner';

describe('Spinner tests', () => {
  test('should render', () => {
    const {element, getByTestId} = render(<Spinner value={1} />);

    const input = getByTestId('spinner-input');
    expect(input).toHaveAttribute('value', '1');

    expect(element).toMatchSnapshot();
  });

  test('should call change handler', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.change(input, {target: {value: '2'}});

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should call change handler with name', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner name="foo" value={1} onChange={handler} />,
    );

    const input = getByTestId('spinner-input');
    fireEvent.change(input, {target: {value: '2'}});

    expect(handler).toHaveBeenCalledWith(2, 'foo');
  });

  test('should increment value on button click', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const button = getByTestId('spinner-up');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should decrement value on button click', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const button = getByTestId('spinner-down');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should increment value on wheel up', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.wheel(input, {deltaY: 2});

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should decrement value on wheel down', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.wheel(input, {deltaY: -2});

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should increment on key up', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.keyDown(input, {key: 'ArrowUp', keyCode: KeyCode.UP});

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should increment on key page up', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.keyDown(input, {key: 'PageUp', keyCode: KeyCode.PAGE_UP});

    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should decrement on key down', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.keyDown(input, {key: 'ArrowDown', keyCode: KeyCode.DOWN});

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should decrement on key page down', () => {
    const handler = testing.fn();
    const {getByTestId} = render(<Spinner value={1} onChange={handler} />);

    const input = getByTestId('spinner-input');
    fireEvent.keyDown(input, {key: 'PageDown', keyCode: KeyCode.PAGE_DOWN});

    expect(handler).toHaveBeenCalledWith(0, undefined);
  });

  test('should not call event handler if disabled', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner disabled={true} value={1} onChange={handler} />,
    );

    const input = getByTestId('spinner-input');
    fireEvent.wheel(input, {deltaY: 2});
    fireEvent.wheel(input, {deltaY: -2});

    fireEvent.keyDown(input, {key: 'PageDown', keyCode: KeyCode.PAGE_DOWN});
    fireEvent.keyDown(input, {key: 'PageUp', keyCode: KeyCode.PAGE_UP});
    fireEvent.keyDown(input, {key: 'ArrowDown', keyCode: KeyCode.DOWN});
    fireEvent.keyDown(input, {key: 'ArrowUp', keyCode: KeyCode.UP});

    const dbutton = getByTestId('spinner-down');
    fireEvent.click(dbutton);
    const ubutton = getByTestId('spinner-up');
    fireEvent.click(ubutton);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should debounce notification', () => {
    testing.useFakeTimers();

    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner debounce={200} value={1} onChange={handler} />,
    );

    const ubutton = getByTestId('spinner-up');
    fireEvent.click(ubutton);
    fireEvent.click(ubutton);
    fireEvent.click(ubutton);

    testing.runAllTimers();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(2, undefined);
  });

  test('should not increment value beyond max', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner value={1} max={1} onChange={handler} />,
    );

    const button = getByTestId('spinner-up');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(1, undefined);
  });

  test('should not decrement value below min', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner value={1} min={1} onChange={handler} />,
    );

    const button = getByTestId('spinner-down');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(1, undefined);
  });

  test('should increment float value', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner type="float" value={1} onChange={handler} />,
    );

    const button = getByTestId('spinner-up');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(1.1, undefined);
  });

  test('should increment value with step', () => {
    const handler = testing.fn();
    const {getByTestId} = render(
      <Spinner step={0.5} type="float" value={1} onChange={handler} />,
    );

    const button = getByTestId('spinner-up');
    fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith(1.5, undefined);
  });
});
