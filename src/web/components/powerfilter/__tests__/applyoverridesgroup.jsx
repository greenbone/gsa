/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {getRadioInputs} from 'web/components/testing';
import {render, fireEvent} from 'web/utils/testing';

import ApplyOverridesGroup from '../applyoverridesgroup';

describe('ApplyOverridesGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const {element} = render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    expect(element).toBeVisible();
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = testing.fn();

    render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getRadioInputs();
    fireEvent.click(radio[1]);

    expect(handleChange).toHaveBeenCalledWith(0, 'applyOverrides');
  });

  test('should check radio', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = testing.fn();

    render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getRadioInputs();

    expect(radio[0].checked).toEqual(true);
  });

  test('should uncheck radio of previous choice', () => {
    const filter1 = Filter.fromString('apply_overrides=1');
    const filter2 = Filter.fromString('apply_overrides=0');
    const handleChange = testing.fn();

    const {rerender} = render(
      <ApplyOverridesGroup
        filter={filter1}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getRadioInputs();

    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    rerender(
      <ApplyOverridesGroup
        filter={filter2}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);
  });

  test('should use filter value by default', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = testing.fn();

    render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={0}
        onChange={handleChange}
      />,
    );

    const radio = getRadioInputs();
    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);
  });

  test('should use overrides', () => {
    const handleChange = testing.fn();

    render(
      <ApplyOverridesGroup
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getRadioInputs();
    expect(radio[0].checked).toEqual(true);
  });
});
