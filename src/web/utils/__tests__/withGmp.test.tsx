/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import withGmp, {type WithGmpComponentProps} from 'web/utils/withGmp';

interface TestProps extends WithGmpComponentProps {
  label?: string;
}

const TestComponent = ({label = 'test', gmp}: TestProps) => (
  <div>
    <span>{label}</span>
    <span data-testid="has-gmp">{String(gmp !== undefined)}</span>
  </div>
);

const createGmp = () => ({settings: {}, login: () => Promise.resolve()});

describe('withGmp HOC', () => {
  test('should inject gmp from context into the wrapped component', () => {
    const gmp = createGmp();
    const WrappedComponent = withGmp<TestProps>(TestComponent);
    const {render} = rendererWith({gmp});

    render(<WrappedComponent />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('has-gmp')).toHaveTextContent('true');
  });

  test('should pass through additional props to the wrapped component', () => {
    const gmp = createGmp();
    const WrappedComponent = withGmp<TestProps>(TestComponent);
    const {render} = rendererWith({gmp});

    render(<WrappedComponent label="custom-label" />);

    expect(screen.getByText('custom-label')).toBeInTheDocument();
  });

  test('should set the display name based on the wrapped component', () => {
    const WrappedComponent = withGmp<TestProps>(TestComponent);

    expect(WrappedComponent.displayName).toBe('withGmp(TestComponent)');
  });
});
