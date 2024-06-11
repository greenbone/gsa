/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/utils/testing';

import ComplianceLevelsFilterGroup from 'web/components/powerfilter/compliancelevelsgroup';

import Filter from 'gmp/models/filter';

describe('ComplianceLevelsFilterGroup audit reports tests', () => {
  test('should call change handler', () => {
    const filter = Filter.fromString('report_compliance_levels=');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    fireEvent.click(checkbox[0]);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('y', 'report_compliance_levels');
  });

  test('should check checkbox', () => {
    const filter = Filter.fromString('report_compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
  });

  test('should uncheck checkbox', () => {
    const filter1 = Filter.fromString('report_compliance_levels=yni');
    const filter2 = Filter.fromString('report_compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element, rerender} = render(
      <ComplianceLevelsFilterGroup
        filter={filter1}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);

    rerender(
      <ComplianceLevelsFilterGroup
        filter={filter2}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
    expect(checkbox[2].checked).toEqual(false);
  });

  test('should be unchecked by default', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(false);
    expect(checkbox[1].checked).toEqual(false);
    expect(checkbox[2].checked).toEqual(false);
    expect(checkbox[3].checked).toEqual(false);
  });

  test('should call remove handler', () => {
    const filter = Filter.fromString('report_compliance_levels=y');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    expect(checkbox[0].checked).toEqual(true);

    fireEvent.click(checkbox[0]);

    expect(handleRemove).toHaveBeenCalled();
  });
});

describe('ComplianceLevelsFilterGroup audit results tests', () => {
  test('should call change handler', () => {
    const filter = Filter.fromString('compliance_levels=');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    fireEvent.click(checkbox[0]);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('y', 'compliance_levels');
  });

  test('should check checkbox', () => {
    const filter = Filter.fromString('compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
  });

  test('should uncheck checkbox', () => {
    const filter1 = Filter.fromString('compliance_levels=yni');
    const filter2 = Filter.fromString('compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element, rerender} = render(
      <ComplianceLevelsFilterGroup
        filter={filter1}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);

    rerender(
      <ComplianceLevelsFilterGroup
        filter={filter2}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
    expect(checkbox[2].checked).toEqual(false);
  });

  test('should be unchecked by default', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(false);
    expect(checkbox[1].checked).toEqual(false);
    expect(checkbox[2].checked).toEqual(false);
    expect(checkbox[3].checked).toEqual(false);
  });

  test('should call remove handler', () => {
    const filter = Filter.fromString('compliance_levels=y');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    expect(checkbox[0].checked).toEqual(true);

    fireEvent.click(checkbox[0]);

    expect(handleRemove).toHaveBeenCalled();
  });
});
