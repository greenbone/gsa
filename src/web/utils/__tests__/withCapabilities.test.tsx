/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import withCapabilities, {
  type WithCapabilitiesComponentProps,
} from 'web/utils/withCapabilities';

interface TestProps extends WithCapabilitiesComponentProps {
  label?: string;
}

const TestComponent = ({label = 'test', capabilities}: TestProps) => (
  <div>
    <span>{label}</span>
    <span data-testid="has-everything">
      {String(capabilities?.mayOp('everything') ?? false)}
    </span>
  </div>
);

describe('withCapabilities HOC', () => {
  test('should inject capabilities from context into the wrapped component', () => {
    const capabilities = new Capabilities(['everything']);
    const WrappedComponent = withCapabilities<TestProps>(TestComponent);
    const {render} = rendererWith({capabilities});

    render(<WrappedComponent />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('has-everything')).toHaveTextContent('true');
  });

  test('should pass through additional props to the wrapped component', () => {
    const capabilities = new Capabilities([]);
    const WrappedComponent = withCapabilities<TestProps>(TestComponent);
    const {render} = rendererWith({capabilities});

    render(<WrappedComponent label="custom-label" />);

    expect(screen.getByText('custom-label')).toBeInTheDocument();
  });

  test('should set the display name based on the wrapped component', () => {
    const WrappedComponent = withCapabilities<TestProps>(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      'withCapabilities(TestComponent)',
    );
  });
});
