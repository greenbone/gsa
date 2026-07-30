/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Loading from 'web/components/loading/Loading';

describe('Loading component tests', () => {
  test('should render the loading indicator', () => {
    render(<Loading />);

    expect(screen.getByTestId('loading')).toBeVisible();
  });

  test('should contain a spinner', () => {
    render(<Loading />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
