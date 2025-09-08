/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import GreenboneLoginLogo from 'web/components/img/LoginLogo';

describe('GreenboneLogo tests', () => {
  test('should render', () => {
    const {render} = rendererWith({
      gmp: {settings: {}},
    });
    const {element} = render(<GreenboneLoginLogo />);

    expect(element).toMatchSnapshot();
  });
});
