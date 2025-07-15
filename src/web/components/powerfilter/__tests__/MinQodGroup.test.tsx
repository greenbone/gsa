/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue} from 'web/testing';
import Filter from 'gmp/models/filter';
import MinQodGroup from 'web/components/powerfilter/MinQodGroup';

describe('MinQodGroup tests', () => {
  test('should render with default values', () => {
    render(<MinQodGroup qod={0} />);
    expect(screen.getByName('min_qod')).toHaveValue('0');
  });

  test('should allow to set a custom name', () => {
    render(<MinQodGroup name="customName" qod={0} />);
    expect(screen.getByName('customName')).toHaveValue('0');
  });

  test('should render filter min_qod value', () => {
    const filter = Filter.fromString('min_qod=20');
    render(<MinQodGroup filter={filter} />);
    expect(screen.getByName('min_qod')).toHaveValue('20');
  });

  test('should call onChange handler', () => {
    const handleChange = testing.fn();
    const {rerender} = render(<MinQodGroup qod={10} onChange={handleChange} />);
    changeInputValue(screen.getByName('min_qod'), '30');
    expect(handleChange).toHaveBeenCalledWith(30, 'min_qod');

    const filter = Filter.fromString('min_qod=40');
    rerender(<MinQodGroup filter={filter} onChange={handleChange} />);
    changeInputValue(screen.getByName('min_qod'), '50');
    expect(handleChange).toHaveBeenCalledWith(50, 'min_qod');
  });

  test('should render title', () => {
    const title = 'QoD';
    render(<MinQodGroup />);
    expect(screen.getByText(title)).toBeVisible();
  });
});
