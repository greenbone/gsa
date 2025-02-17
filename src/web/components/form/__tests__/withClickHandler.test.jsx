/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/utils/testing';

import withClickHandler from '../withClickHandler';

 

const TestInput = ({value, ...props}) => <input {...props} type="text" />;

describe('withClickHandler tests', () => {
  test('should call click handler with value', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = testing.fn();
    const {element} = render(<Component value="foo" onClick={onClick} />);

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call click handler with value and name', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = testing.fn();
    const {element} = render(
      <Component name="bar" value="foo" onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should call click handler with converted value', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = testing.fn();
    const {element} = render(
      <Component convert={v => v * 2} value={21} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(42, undefined);
  });

  test('should allow to set a pre-defined convert function', () => {
    const Component = withClickHandler({
      convert_func: v => v * 2,
    })(TestInput);

    const onClick = testing.fn();
    const {element} = render(<Component value={21} onClick={onClick} />);

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(42, undefined);
  });

  test('should allow to set a pre-defined value function', () => {
    const Component = withClickHandler({
      value_func: (event, props) => props.foo,
    })(TestInput);

    const onClick = testing.fn();
    const {element} = render(
      <Component foo="bar" value={21} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('bar', undefined);
  });
});
