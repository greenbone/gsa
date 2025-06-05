/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import SolutionTypesFilterGroup from 'web/components/powerfilter/SolutionTypeGroup';
import {screen, render, fireEvent} from 'web/testing';

describe('SolutionTypesFilterGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('solution_type=All');
    const handleChange = testing.fn();
    const {element} = render(
      <SolutionTypesFilterGroup filter={filter} onChange={handleChange} />,
    );

    expect(element).toBeVisible();
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('solution_type=Mitigation');
    const handleChange = testing.fn();

    render(
      <SolutionTypesFilterGroup filter={filter} onChange={handleChange} />,
    );

    const radio = screen.getRadioInputs();
    fireEvent.click(radio[1]);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].toFilterString()).toEqual(
      'solution_type=Workaround',
    );
  });

  test('should check radio', () => {
    const filter = Filter.fromString('solution_type=Workaround');
    const handleChange = testing.fn();

    render(
      <SolutionTypesFilterGroup filter={filter} onChange={handleChange} />,
    );

    const radio = screen.getRadioInputs();
    expect(radio[1].checked).toEqual(true);
  });

  test('should uncheck radio of previous choice', () => {
    const filter1 = Filter.fromString('solution_type=Workaround');
    const filter2 = Filter.fromString('solution_type=Mitigation');
    const handleChange = testing.fn();

    const {rerender} = render(
      <SolutionTypesFilterGroup filter={filter1} onChange={handleChange} />,
    );

    const radio = screen.getRadioInputs();

    expect(radio[1].checked).toEqual(true);
    expect(radio[2].checked).toEqual(false);

    rerender(
      <SolutionTypesFilterGroup filter={filter2} onChange={handleChange} />,
    );

    expect(radio[1].checked).toEqual(false);
    expect(radio[2].checked).toEqual(true);
  });

  test('should check "All" by default', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();

    render(
      <SolutionTypesFilterGroup filter={filter} onChange={handleChange} />,
    );

    const radio = screen.getRadioInputs();
    expect(radio[0].checked).toEqual(true);
  });
});
