/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import {render} from 'web/utils/testing';

import SeverityClassLabel from '../severityclass';

import {setLocale} from 'gmp/locale/lang';

setLocale('en');

describe('SeverityClassLabel tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toMatchSnapshot();
  });

  test('should render HighLabel', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toHaveStyleRule('background-color', '#C83814');
    expect(element).toHaveStyleRule('border-color', '#C83814');
    expect(element).toHaveTextContent('High');
  });

  test('should render MediumLabel', () => {
    const {element} = render(<SeverityClassLabel.Medium />);

    expect(element).toHaveStyleRule('background-color', '#F0A519');
    expect(element).toHaveStyleRule('border-color', '#F0A519');
    expect(element).toHaveTextContent('Medium');
  });

  test('should render LowLabel', () => {
    const {element} = render(<SeverityClassLabel.Low />);

    expect(element).toHaveStyleRule('background-color', '#4F91C7');
    expect(element).toHaveStyleRule('border-color', '#4F91C7');
    expect(element).toHaveTextContent('Low');
  });

  test('should render LogLabel', () => {
    const {element} = render(<SeverityClassLabel.Log />);

    expect(element).toHaveStyleRule('background-color', '#191919');
    expect(element).toHaveStyleRule('border-color', '#191919');
    expect(element).toHaveTextContent('Log');
  });

  test('should render FalsePositiveLabel', () => {
    const {element} = render(<SeverityClassLabel.FalsePositive />);

    expect(element).toHaveStyleRule('background-color', '#191919');
    expect(element).toHaveStyleRule('border-color', '#191919');
    expect(element).toHaveTextContent('False Pos.');
  });
});
