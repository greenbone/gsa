/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import ErrorContainer from '../errorcontainer';

describe('ErrorContainer tests', () => {
  test('should render', () => {
    const {element} = render(
      <ErrorContainer>
        <span>An error</span>
      </ErrorContainer>,
    );

    expect(element).toBeVisible();
  });
});
