/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import DetailsBlock from 'web/entity/DetailsBlock';

describe('DetailsBlock component tests', () => {
  test('should render', () => {
    render(
      <DetailsBlock id="123" title="some title">
        child
      </DetailsBlock>,
    );

    expect(
      screen.getByRole('heading', {name: /^some title$/i}),
    ).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
