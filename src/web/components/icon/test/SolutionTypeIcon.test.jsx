/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import SolutionType from 'web/components/icon/SolutionTypeIcon';
import {render} from 'web/testing';

describe('SolutionType component tests', () => {
  test('should render correct icons', () => {
    const {element: element1} = render(<SolutionType type="Workaround" />);
    const {element: element2} = render(<SolutionType type="Mitigation" />);
    const {element: element3} = render(<SolutionType type="NoneAvailable" />);
    const {element: element4} = render(<SolutionType type="VendorFix" />);
    const {element: element5} = render(<SolutionType type="WillNotFix" />);
    const {element: element6} = render(<SolutionType type="" />);
    const {element: element7} = render(<SolutionType />);

    expect(element1).toBeVisible();
    expect(element2).toBeVisible();
    expect(element3).toBeVisible();
    expect(element4).toBeVisible();
    expect(element5).toBeVisible();
    expect(element6).toBeVisible();
    expect(element7).toBeVisible();
  });

  test('should render with title text when displayTitleText is true', () => {
    const {element} = render(
      <SolutionType displayTitleText={true} type="Workaround" />,
    );
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Workaround');
  });

  test('should not display title text by default', () => {
    const {element} = render(<SolutionType type="Workaround" />);
    expect(element).toBeVisible();
    expect(element).not.toHaveTextContent('Workaround');
  });

  test('should render empty span for unknown types', () => {
    const {element} = render(<SolutionType type="Unknown" />);
    expect(element).toBeVisible();
    expect(element.tagName.toLowerCase()).toBe('span');
  });
});
