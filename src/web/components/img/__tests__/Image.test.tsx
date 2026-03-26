/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import Image from 'web/components/img/Image';

describe('Image tests', () => {
  test('should render image with attributes', () => {
    const {element} = render(<Image alt="OPENVAS SCAN" src="greenbone.svg" />);

    expect(element).toHaveAttribute('alt', 'OPENVAS SCAN');
    expect(element).toHaveAttribute('src', '/img/greenbone.svg');
  });
});
