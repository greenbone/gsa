/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import SeverityClassLabel from '../severityclass';

describe('SeverityClassLabel tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toBeVisible();
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
