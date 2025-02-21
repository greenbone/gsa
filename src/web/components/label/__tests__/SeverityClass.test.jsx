/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';

import SeverityClassLabel from '../SeverityClass';

describe('SeverityClassLabel tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toBeVisible();
  });

  test('should render HighLabel', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toHaveStyleRule('background-color', Theme.errorRed);
    expect(element).toHaveStyleRule('border-color', Theme.errorRed);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('High');
  });

  test('should render MediumLabel', () => {
    const {element} = render(<SeverityClassLabel.Medium />);

    expect(element).toHaveStyleRule(
      'background-color',
      Theme.severityWarnYellow,
    );
    expect(element).toHaveStyleRule('border-color', Theme.severityWarnYellow);
    expect(element).toHaveStyleRule('color', Theme.black);
    expect(element).toHaveTextContent('Medium');
  });

  test('should render LowLabel', () => {
    const {element} = render(<SeverityClassLabel.Low />);

    expect(element).toHaveStyleRule('background-color', Theme.severityLowBlue);
    expect(element).toHaveStyleRule('border-color', Theme.severityLowBlue);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('Low');
  });

  test('should render LogLabel', () => {
    const {element} = render(<SeverityClassLabel.Log />);

    expect(element).toHaveStyleRule('background-color', Theme.mediumGray);
    expect(element).toHaveStyleRule('border-color', Theme.mediumGray);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('Log');
  });

  test('should render FalsePositiveLabel', () => {
    const {element} = render(<SeverityClassLabel.FalsePositive />);

    expect(element).toHaveStyleRule('background-color', Theme.mediumGray);
    expect(element).toHaveStyleRule('border-color', Theme.mediumGray);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('False Pos.');
  });
});
