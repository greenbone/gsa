/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import GreenboneLogo from 'web/components/img/Greenbone';

describe('GreenboneLogo tests', () => {
  test('should render', () => {
    const {element} = render(<GreenboneLogo />);

    expect(element).toMatchSnapshot();
  });
});
