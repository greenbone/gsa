/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, renderHook, screen} from 'web/testing';
import useInstanceVariable from 'web/hooks/useInstanceVariable';

const TestComponent = () => {
  const [someVariable, setVariable] = useInstanceVariable(1);
  const [, setToggle] = useState(false);
  const forceUpdate = () => setToggle(toggle => !toggle);
  const changeValue = () => {
    setVariable(2);
    forceUpdate();
  };
  return (
    <div>
      <div data-testid="t1">{someVariable}</div>
      <button data-testid="changeValue" onClick={changeValue} />
    </div>
  );
};

describe('useInstanceVariable tests', () => {
  test('should render example component', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    const t1 = screen.getByTestId('t1');
    expect(t1).toHaveTextContent('1');
    const b1 = screen.getByTestId('changeValue');
    fireEvent.click(b1);
    expect(t1).toHaveTextContent('2');
  });

  test('should initialize with the given initial value', () => {
    const {result} = renderHook(() => useInstanceVariable(42));
    const [value] = result.current;

    expect(value).toBe(42);
  });

  test('should update the value when setInstanceVariable is called with a new value', async () => {
    const {result, rerender} = renderHook(() => useInstanceVariable(42));
    const [, setInstanceVariable] = result.current;

    setInstanceVariable(100);
    rerender();

    const [value] = result.current;
    expect(value).toBe(100);
  });

  test('should update the value when setInstanceVariable is called with a function', () => {
    const {result, rerender} = renderHook(() => useInstanceVariable(42));
    const [, setInstanceVariable] = result.current;

    setInstanceVariable(prev => prev + 8);
    rerender();

    const [value] = result.current;
    expect(value).toBe(50);
  });

  test('should not cause re-renders when the value is updated', () => {
    const renderSpy = testing.fn();
    const {result} = renderHook(() => {
      renderSpy();
      return useInstanceVariable(42);
    });

    const [, setInstanceVariable] = result.current;

    setInstanceVariable(100);

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
