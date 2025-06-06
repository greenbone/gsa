/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import useClickHandler, {
  nameFromEvent,
  valueFromEvent,
} from 'web/components/form/useClickHandler';

interface MockEvent {
  currentTarget: {
    value: string;
    name: string;
  };
}

describe('useClickHandler tests', () => {
  test('should call click handler with value', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler<{name: string}, string, MockEvent>({
        onClick,
        nameFunc: nameFromEvent,
        valueFunc: valueFromEvent,
        props: {name: 'test'},
      }),
    );
    result.current({currentTarget: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('foo', 'test');
  });

  test('should call click handler with value from props', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler<{bar: string}, string, MockEvent>({
        onClick,
        valueFunc: (event, props) => props.bar,
        nameFunc: nameFromEvent,
        props: {bar: 'baz'},
      }),
    );
    result.current({currentTarget: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('baz', 'test');
  });

  test('should call click handler with name from props', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler<{name: string}, string, MockEvent>({
        onClick,
        valueFunc: valueFromEvent,
        nameFunc: (event, props) => props.name,
        props: {name: 'ipsum'},
      }),
    );
    result.current({currentTarget: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('foo', 'ipsum');
  });

  test('should call click handler with converted value', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler<{}, string, MockEvent>({
        onClick,
        nameFunc: nameFromEvent,
        valueFunc: event => valueFromEvent(event).toUpperCase(),
      }),
    );
    result.current({currentTarget: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('FOO', 'test');
  });

  test('should work with a button component', () => {
    const {render} = rendererWith();
    const handleClick = testing.fn();
    const ClickComponent = ({onClick}) => {
      const handleClick = useClickHandler({
        onClick,
        valueFunc: valueFromEvent,
        nameFunc: nameFromEvent,
      });
      return <button data-testid="button" value="foo" onClick={handleClick} />;
    };
    render(<ClickComponent onClick={handleClick} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledWith('foo', '');
  });

  test('should work with a button component and name', () => {
    const {render} = rendererWith();
    const handleClick = testing.fn();
    const ClickComponent = ({onClick}) => {
      const handleClick = useClickHandler({
        onClick,
        valueFunc: valueFromEvent,
        nameFunc: nameFromEvent,
      });
      return (
        <button
          data-testid="button"
          name="foo"
          value="foo"
          onClick={handleClick}
        />
      );
    };
    render(<ClickComponent onClick={handleClick} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledWith('foo', 'foo');
  });
});
