/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import ErrorContainer from 'web/components/error/ErrorContainer';
import Theme from 'web/utils/theme';

describe('ErrorContainer tests', () => {
  test('should render children', () => {
    render(
      <ErrorContainer>
        <span>An error</span>
      </ErrorContainer>,
    );

    expect(screen.getByText('An error')).toBeInTheDocument();
  });

  test('should apply error border color', () => {
    render(<ErrorContainer data-testid="error-container" />);

    expect(screen.getByTestId('error-container')).toHaveBorderColor(
      Theme.mediumLightRed,
    );
  });

  test('should apply error background color', () => {
    render(<ErrorContainer data-testid="error-container" />);

    expect(screen.getByTestId('error-container')).toHaveBackgroundColor(
      Theme.lightRed,
    );
  });
});
