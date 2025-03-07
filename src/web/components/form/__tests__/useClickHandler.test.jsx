/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import useClickHandler from 'web/components/form/useClickHandler';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';

describe('useClickHandler tests', () => {
  test('should call click handler with value', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() => useClickHandler({onClick, name: 'test'}));
    result.current({target: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('foo', 'test');
  });

  test('should call click handler with value from props', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler({
        onClick,
        valueFunc: (event, props) => props.bar,
        bar: 'baz',
      }),
    );
    result.current({target: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('baz', 'test');
  });

  test('should call click handler with name from props', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler({
        onClick,
        nameFunc: (event, props) => props.name,
        name: 'ipsum',
      }),
    );
    result.current({target: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('foo', 'ipsum');
  });

  test('should call click handler with converted value', () => {
    const {renderHook} = rendererWith();

    const onClick = testing.fn();
    const {result} = renderHook(() =>
      useClickHandler({
        onClick,
        convert: value => value.toUpperCase(),
      }),
    );
    result.current({target: {value: 'foo', name: 'test'}});

    expect(onClick).toHaveBeenCalledWith('FOO', 'test');
  });

  test('should work with a button component', () => {
    const {render} = rendererWith();
    const handleClick = testing.fn();
    const ClickComponent = ({onClick}) => {
      const handleClick = useClickHandler({onClick});
      return (
        <button
          data-testid="button"
          name="test"
          value="foo"
          onClick={handleClick}
        />
      );
    };
    render(<ClickComponent onClick={handleClick} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledWith('foo', 'test');
  });
});
