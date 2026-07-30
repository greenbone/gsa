/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import withRouter, {type WithRouterComponentProps} from 'web/utils/withRouter';

interface TestProps extends WithRouterComponentProps {
  label?: string;
}

const TestComponent = ({label = 'test', location, params}: TestProps) => (
  <div>
    <span data-testid="label">{label}</span>
    <span data-testid="pathname">{location.pathname}</span>
    <span data-testid="params">{JSON.stringify(params)}</span>
  </div>
);

describe('withRouter HOC', () => {
  test('should inject router props from context into the wrapped component', () => {
    const WrappedComponent = withRouter<TestProps>(TestComponent);
    const {render} = rendererWith({route: '/tasks'});

    render(<WrappedComponent />);

    expect(screen.getByTestId('pathname')).toHaveTextContent('/tasks');
  });

  test('should inject route params into the wrapped component', () => {
    const WrappedComponent = withRouter<TestProps>(TestComponent);
    const {render} = rendererWith({route: '/tasks/42'});

    render(<WrappedComponent />);

    expect(screen.getByTestId('params')).toBeInTheDocument();
  });

  test('should pass through additional props to the wrapped component', () => {
    const WrappedComponent = withRouter<TestProps>(TestComponent);
    const {render} = rendererWith({route: '/'});

    render(<WrappedComponent label="custom-label" />);

    expect(screen.getByTestId('label')).toHaveTextContent('custom-label');
  });

  test('should set the display name based on the wrapped component', () => {
    const WrappedComponent = withRouter<TestProps>(TestComponent);

    expect(WrappedComponent.displayName).toBe('withRouter(TestComponent)');
  });
});
