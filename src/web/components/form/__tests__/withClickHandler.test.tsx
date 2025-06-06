/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/testing';
import withClickHandler, {
  WithClickHandlerProps,
} from 'web/components/form/withClickHandler';

const TestInput = ({...props}) => <input {...props} type="text" />;

interface TestComponentProps extends WithClickHandlerProps<string> {
  onChange?: (value: string) => void;
}

describe('withClickHandler tests', () => {
  test('should call click handler with value', () => {
    const Component = withClickHandler<TestComponentProps, string>({
      valueFunc: (_event, props): string => props.value,
      nameFunc: (_event, props): string | undefined => props.name,
    })(TestInput);
    const onChange = testing.fn();
    const onClick = testing.fn();
    const {element} = render(
      <Component value="foo" onChange={onChange} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call click handler with value and name', () => {
    const Component = withClickHandler<TestComponentProps, string>({
      valueFunc: (_event, props): string => props.value,
      nameFunc: (_event, props): string | undefined => props.name,
    })(TestInput);

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
});
