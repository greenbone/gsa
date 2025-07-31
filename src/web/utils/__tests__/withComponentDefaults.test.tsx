/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {withComponentDefaults} from 'web/utils/withComponentDefaults';

interface TestProps {
  title?: string;
  count?: number;
}
const TestComponent = ({title, count = 0}: TestProps) => (
  <div>
    <h1>{title}</h1>
    <p>Count: {count}</p>
  </div>
);

describe('withComponentDefaults tests', () => {
  test('should render the wrapped component with default props', () => {
    const TestComponentWithDefaults = withComponentDefaults<TestProps>({
      title: 'Default Title',
    })(TestComponent);

    render(<TestComponentWithDefaults count={5} />);

    expect(screen.getByText('Default Title')).toBeInTheDocument();
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  test('should allow overriding default props with passed props', () => {
    const TestComponentWithDefaults = withComponentDefaults<TestProps>({
      title: 'Default Title',
    })(TestComponent);

    render(<TestComponentWithDefaults count={10} title="Overridden Title" />);

    expect(screen.getByText('Overridden Title')).toBeInTheDocument();
    expect(screen.getByText('Count: 10')).toBeInTheDocument();
  });
});
