/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import {SubscriptionContext} from 'web/components/provider/SubscriptionProvider';
import withSubscription, {
  type WithSubscriptionComponentProps,
} from 'web/utils/withSubscription';

interface TestProps extends WithSubscriptionComponentProps {
  label?: string;
}

const TestComponent = ({label = 'test', subscribe}: TestProps) => (
  <div>
    <span data-testid="label">{label}</span>
    <button onClick={() => subscribe?.('task.changed', () => {})}>
      subscribe
    </button>
  </div>
);

describe('withSubscription HOC', () => {
  test('should inject subscribe from context and allow calling it', () => {
    const subscribe = testing.fn().mockReturnValue(() => {});
    const WrappedComponent = withSubscription<TestProps>(TestComponent);

    render(
      <SubscriptionContext.Provider value={subscribe}>
        <WrappedComponent />
      </SubscriptionContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'subscribe'}));

    expect(subscribe).toHaveBeenCalledWith(
      'task.changed',
      expect.any(Function),
    );
  });

  test('should not throw when subscribe is undefined and the button is clicked', () => {
    const WrappedComponent = withSubscription<TestProps>(TestComponent);

    render(<WrappedComponent />);

    expect(() =>
      fireEvent.click(screen.getByRole('button', {name: 'subscribe'})),
    ).not.toThrow();
  });

  test('should pass through additional props to the wrapped component', () => {
    const subscribe = testing.fn();
    const WrappedComponent = withSubscription<TestProps>(TestComponent);

    render(
      <SubscriptionContext.Provider value={subscribe}>
        <WrappedComponent label="custom-label" />
      </SubscriptionContext.Provider>,
    );

    expect(screen.getByTestId('label')).toHaveTextContent('custom-label');
  });

  test('should set the display name based on the wrapped component', () => {
    const WrappedComponent = withSubscription<TestProps>(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      'withSubscription(TestComponent)',
    );
  });
});
