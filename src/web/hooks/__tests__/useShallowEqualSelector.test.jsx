/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {configureStore} from '@reduxjs/toolkit';
import {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';

const reducer = (state = {value: 0}, action) => {
  switch (action.type) {
    case 'increment':
      return {...state, value: 1};
    default:
      return state;
  }
};

const update = () => ({type: 'increment'});

const TestComponent1 = ({renderCallback}) => {
  const state = useSelector(state => state.counter);
  const dispatch = useDispatch();
  const updateCounter = useCallback(() => dispatch(update()), [dispatch]);
  renderCallback();
  return (
    <div>
      <div data-testid="counter">{state.value}</div>
      <button data-testid="update" onClick={updateCounter}>
        Increment
      </button>
    </div>
  );
};

const TestComponent2 = ({renderCallback}) => {
  const state = useShallowEqualSelector(state => state.counter);
  renderCallback();
  return (
    <div>
      <div data-testid="shallowCounter">{state.value}</div>
    </div>
  );
};

describe('useShallowEqualSelector tests', () => {
  test('should return the selected state', () => {
    const renderCount = testing.fn();
    const shallowRenderCount = testing.fn();
    const store = configureStore({
      reducer: {
        counter: reducer,
      },
      middleware: () => [],
    });

    const {render} = rendererWith({store});

    render(
      <>
        <TestComponent1 renderCallback={renderCount} />
        <TestComponent2 renderCallback={shallowRenderCount} />
      </>,
    );

    const counter = screen.getByTestId('counter');
    const shallowCounter = screen.getByTestId('shallowCounter');
    expect(counter).toHaveTextContent('0');
    expect(shallowCounter).toHaveTextContent('0');
    expect(renderCount).toHaveBeenCalledTimes(1);
    expect(shallowRenderCount).toHaveBeenCalledTimes(1);

    const updateCounter = screen.getByTestId('update');
    fireEvent.click(updateCounter);

    expect(counter).toHaveTextContent('1');
    expect(renderCount).toHaveBeenCalledTimes(2);
    expect(shallowCounter).toHaveTextContent('1');
    expect(shallowRenderCount).toHaveBeenCalledTimes(2);

    fireEvent.click(updateCounter);

    expect(counter).toHaveTextContent('1');
    expect(renderCount).toHaveBeenCalledTimes(3);
    expect(shallowCounter).toHaveTextContent('1');
    expect(shallowRenderCount).toHaveBeenCalledTimes(2);
  });
});
