/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import ComplianceLevelsFilterGroup from 'web/components/powerfilter/ComplianceLevelsGroup';
import {render, fireEvent, screen} from 'web/utils/Testing';

describe('ComplianceLevelsFilterGroup audit reports tests', () => {
  test('should call change handler', () => {
    const filter = Filter.fromString('report_compliance_levels=');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(false);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);

    fireEvent.click(checkboxYes);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('y', 'report_compliance_levels');
  });

  test('should check checkbox', () => {
    const filter = Filter.fromString('report_compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should uncheck checkbox', () => {
    const filter1 = Filter.fromString('report_compliance_levels=yni');
    const filter2 = Filter.fromString('report_compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {rerender} = render(
      <ComplianceLevelsFilterGroup
        filter={filter1}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(true);
    expect(checkboxUndefined.checked).toEqual(false);

    rerender(
      <ComplianceLevelsFilterGroup
        filter={filter2}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should be unchecked by default', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(false);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should call remove handler', () => {
    const filter = Filter.fromString('report_compliance_levels=y');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);

    fireEvent.click(checkboxYes);

    expect(handleChange).not.toHaveBeenCalled();
    expect(handleRemove).toHaveBeenCalled();
  });
});

describe('ComplianceLevelsFilterGroup audit results tests', () => {
  test('should call change handler', () => {
    const filter = Filter.fromString('compliance_levels=');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(false);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);

    fireEvent.click(checkboxYes);
    expect(handleChange).toHaveBeenCalledWith('y', 'compliance_levels');
  });

  test('should check checkbox', () => {
    const filter = Filter.fromString('compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should uncheck checkbox', () => {
    const filter1 = Filter.fromString('compliance_levels=yni');
    const filter2 = Filter.fromString('compliance_levels=yn');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {rerender} = render(
      <ComplianceLevelsFilterGroup
        filter={filter1}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(true);
    expect(checkboxUndefined.checked).toEqual(false);

    rerender(
      <ComplianceLevelsFilterGroup
        filter={filter2}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(true);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should be unchecked by default', () => {
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(false);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);
  });

  test('should call remove handler', () => {
    const filter = Filter.fromString('compliance_levels=y');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <ComplianceLevelsFilterGroup
        filter={filter}
        isResult={true}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkboxYes = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-yes',
    );
    const checkboxNo = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-no',
    );
    const checkboxIncomplete = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-incomplete',
    );
    const checkboxUndefined = screen.getByTestId<HTMLInputElement>(
      'compliance-checkbox-undefined',
    );

    expect(checkboxYes.checked).toEqual(true);
    expect(checkboxNo.checked).toEqual(false);
    expect(checkboxIncomplete.checked).toEqual(false);
    expect(checkboxUndefined.checked).toEqual(false);

    fireEvent.click(checkboxYes);
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleRemove).toHaveBeenCalled();
  });
});
