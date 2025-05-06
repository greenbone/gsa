/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import GreenboneLoginLogo from 'web/components/img/GreenboneLoginLogo';
import {render} from 'web/utils/Testing';

describe('GreenboneLogo tests', () => {
  test('should render', () => {
    const {element} = render(<GreenboneLoginLogo />);

    expect(element).toMatchSnapshot();
  });
});
