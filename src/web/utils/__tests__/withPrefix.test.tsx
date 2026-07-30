/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import withPrefix, {type WithPrefixComponentProps} from 'web/utils/withPrefix';

interface TestProps extends WithPrefixComponentProps {
  label?: string;
}

const TestComponent = ({label = 'test', prefix}: TestProps) => (
  <div>
    <span data-testid="label">{label}</span>
    <span data-testid="prefix">{prefix}</span>
  </div>
);

describe('withPrefix HOC', () => {
  test('should append an underscore to a defined prefix', () => {
    const WrappedComponent = withPrefix<TestProps>(TestComponent);

    render(<WrappedComponent prefix="foo" />);

    expect(screen.getByTestId('prefix')).toHaveTextContent('foo_');
  });

  test('should use an empty string prefix when prefix is undefined', () => {
    const WrappedComponent = withPrefix<TestProps>(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByTestId('prefix')).toHaveTextContent('');
  });

  test('should pass through additional props to the wrapped component', () => {
    const WrappedComponent = withPrefix<TestProps>(TestComponent);

    render(<WrappedComponent label="custom-label" prefix="bar" />);

    expect(screen.getByTestId('label')).toHaveTextContent('custom-label');
  });

  test('should set the display name based on the wrapped component', () => {
    const WrappedComponent = withPrefix<TestProps>(TestComponent);

    expect(WrappedComponent.displayName).toBe('withPrefix(TestComponent)');
  });
});
