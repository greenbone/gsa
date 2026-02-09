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

    expect(element).toHaveBackgroundColor(Theme.severityClassHigh);
    expect(element).toHaveBorderColor(Theme.severityClassHigh);
    expect(element).toHaveColor(Theme.white);
    expect(element).toHaveTextContent('High');
  });

  test('should render MediumLabel', () => {
    const {element} = render(<SeverityClassLabel.Medium />);

    expect(element).toHaveBackgroundColor(Theme.severityClassMedium);
    expect(element).toHaveBorderColor(Theme.severityClassMedium);
    expect(element).toHaveColor(Theme.black);
    expect(element).toHaveTextContent('Medium');
  });

  test('should render LowLabel', () => {
    const {element} = render(<SeverityClassLabel.Low />);

    expect(element).toHaveBackgroundColor(Theme.severityClassLow);
    expect(element).toHaveBorderColor(Theme.severityClassLow);
    expect(element).toHaveColor(Theme.white);
    expect(element).toHaveTextContent('Low');
  });

  test('should render LogLabel', () => {
    const {element} = render(<SeverityClassLabel.Log />);

    expect(element).toHaveBackgroundColor(Theme.severityClassLog);
    expect(element).toHaveBorderColor(Theme.severityClassLog);
    expect(element).toHaveColor(Theme.white);
    expect(element).toHaveTextContent('Log');
  });

  test('should render FalsePositiveLabel', () => {
    const {element} = render(<SeverityClassLabel.FalsePositive />);

    expect(element).toHaveBackgroundColor(Theme.mediumGray);
    expect(element).toHaveBorderColor(Theme.mediumGray);
    expect(element).toHaveColor(Theme.white);
    expect(element).toHaveTextContent('False Pos.');
  });

  test('should render CriticalLabel', () => {
    const {element} = render(<SeverityClassLabel.Critical />);

    expect(element).toHaveBackgroundColor(Theme.severityClassCritical);
    expect(element).toHaveBorderColor(Theme.severityClassCritical);
    expect(element).toHaveColor(Theme.white);
    expect(element).toHaveTextContent('Critical');
  });
});
