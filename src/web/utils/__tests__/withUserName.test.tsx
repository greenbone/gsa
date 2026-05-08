/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {createSession} from 'gmp/testing';
import withUserName from 'web/utils/withUserName';

interface TestProps {
  title?: string;
  username?: string;
}

const TestComponent = ({title = 'Default Title', username}: TestProps) => (
  <div>
    <h1>{title}</h1>
    <p>{username}</p>
  </div>
);

const createGmp = ({username = 'test-user'} = {}) => ({
  session: createSession({username}),
});

describe('withUserName tests', () => {
  test('should render the wrapped component with username', () => {
    const TestComponentWithUserName = withUserName<TestProps>(TestComponent);

    const {render} = rendererWith({gmp: createGmp()});

    render(<TestComponentWithUserName />);

    expect(screen.getByText('Default Title')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
  });
});
