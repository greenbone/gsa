/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import SeverityClassLabel from 'web/components/label/SeverityClass';
import Theme from 'web/utils/Theme';

describe('SeverityClassLabel tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toBeVisible();
  });

  test('should render HighLabel', () => {
    const {element} = render(<SeverityClassLabel.High />);

    expect(element).toHaveStyleRule(
      'background-color',
      Theme.severityClassHigh,
    );
    expect(element).toHaveStyleRule('border-color', Theme.severityClassHigh);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('High');
  });

  test('should render MediumLabel', () => {
    const {element} = render(<SeverityClassLabel.Medium />);

    expect(element).toHaveStyleRule(
      'background-color',
      Theme.severityClassMedium,
    );
    expect(element).toHaveStyleRule('border-color', Theme.severityClassMedium);
    expect(element).toHaveStyleRule('color', Theme.black);
    expect(element).toHaveTextContent('Medium');
  });

  test('should render LowLabel', () => {
    const {element} = render(<SeverityClassLabel.Low />);

    expect(element).toHaveStyleRule('background-color', Theme.severityClassLow);
    expect(element).toHaveStyleRule('border-color', Theme.severityClassLow);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('Low');
  });

  test('should render LogLabel', () => {
    const {element} = render(<SeverityClassLabel.Log />);

    expect(element).toHaveStyleRule('background-color', Theme.severityClassLog);
    expect(element).toHaveStyleRule('border-color', Theme.severityClassLog);
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

  test('should render CriticalLabel', () => {
    const {element} = render(<SeverityClassLabel.Critical />);

    expect(element).toHaveStyleRule(
      'background-color',
      Theme.severityClassCritical,
    );
    expect(element).toHaveStyleRule(
      'border-color',
      Theme.severityClassCritical,
    );
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveTextContent('Critical');
  });
});
