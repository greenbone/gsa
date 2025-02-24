/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Img from 'web/components/img/Img';
import {render} from 'web/utils/Testing';


describe('Img tests', () => {
  test('should render', () => {
    const {element} = render(
      <Img alt="Greenbone Security Assistant" src="greenbone.svg" />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render img with attributes', () => {
    const {element} = render(
      <Img alt="Greenbone Security Assistant" src="greenbone.svg" />,
    );

    expect(element).toHaveAttribute('alt', 'Greenbone Security Assistant');
    expect(element).toHaveAttribute('src', '/img/greenbone.svg');
  });
});
