/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ProductImage from 'web/components/img/Product';
import {rendererWith} from 'web/utils/Testing';


describe('ProductImage tests', () => {
  test('should render', () => {
    const gmp = {settings: {}};
    const {render} = rendererWith({gmp});
    const {element} = render(<ProductImage />);

    expect(element).toMatchSnapshot();
  });
});
