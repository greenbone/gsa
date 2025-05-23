/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import withClickHandler, {
  WithClickHandlerProps,
} from 'web/components/form/withClickHandler';
import {render, fireEvent} from 'web/utils/Testing';

const TestInput = ({...props}) => <input {...props} type="text" />;

interface TestComponentProps<TValue = string>
  extends WithClickHandlerProps<TValue> {
  onChange: (value: string, name?: string) => void;
}

describe('withClickHandler tests', () => {
  test('should call click handler with value', () => {
    const Component = withClickHandler<string, string, TestComponentProps>()(
      TestInput,
    );
    const onChange = testing.fn();
    const onClick = testing.fn();
    const {element} = render(
      <Component value="foo" onChange={onChange} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call click handler with value and name', () => {
    const Component = withClickHandler<string, string, TestComponentProps>()(
      TestInput,
    );

    const onClick = testing.fn();
    const onChange = testing.fn();
    const {element} = render(
      <Component
        name="bar"
        value="foo"
        onChange={onChange}
        onClick={onClick}
      />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should call click handler with converted value', () => {
    const Component = withClickHandler<
      number,
      number,
      TestComponentProps<number>
    >()(TestInput);

    const onClick = testing.fn();
    const onChange = testing.fn();
    const {element} = render(
      <Component
        convert={v => v * 2}
        value={21}
        onChange={onChange}
        onClick={onClick}
      />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(42, undefined);
  });
});
