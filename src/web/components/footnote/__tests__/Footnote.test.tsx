/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import FootNote from 'web/components/footnote/Footnote';
import Theme from 'web/utils/theme';

describe('Footnote tests', () => {
  test('should apply mediumGray text color', () => {
    render(<FootNote data-testid="footnote" />);

    expect(screen.getByTestId('footnote')).toHaveColor(Theme.mediumGray);
  });

  test('should render children', () => {
    render(<FootNote>Hello World</FootNote>);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
