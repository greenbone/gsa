/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import BooleanFilterGroup from 'web/components/powerfilter/BooleanFilterGroup';

describe('BooleanFilterGroup tests', () => {
  test('should render', () => {
    render(<BooleanFilterGroup name="test" />);
    expect(screen.getByName('test')).toBeVisible();
    expect(screen.getByTestId('radio-yes')).not.toBeChecked();
    expect(screen.getByTestId('radio-no')).not.toBeChecked();
  });

  test('should call change handler', () => {
    const handleChange = testing.fn();
    render(<BooleanFilterGroup name="test" onChange={handleChange} />);

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(handleChange).toHaveBeenCalledWith(YES_VALUE, 'test');

    fireEvent.click(screen.getByTestId('radio-no'));
    expect(handleChange).toHaveBeenCalledWith(NO_VALUE, 'test');
  });

  test("should check radio based on filter's value", () => {
    const filter = Filter.fromString('test=1');
    const {rerender} = render(
      <BooleanFilterGroup filter={filter} name="test" />,
    );

    expect(screen.getByTestId('radio-yes')).toBeChecked();
    expect(screen.getByTestId('radio-no')).not.toBeChecked();

    const filter2 = filter.set('test', String(NO_VALUE));
    rerender(<BooleanFilterGroup filter={filter2} name="test" />);
    expect(screen.getByTestId('radio-yes')).not.toBeChecked();
    expect(screen.getByTestId('radio-no')).toBeChecked();
  });

  test('should render title', () => {
    const title = 'Test Title';
    render(<BooleanFilterGroup name="test" title={title} />);
    expect(screen.getByText(title)).toBeVisible();
  });
});
