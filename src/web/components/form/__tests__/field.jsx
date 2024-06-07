/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Theme from 'web/utils/theme';
import {render, fireEvent} from 'web/utils/testing';

import Field, {DISABLED_OPACITY} from '../field';

describe('Field tests', () => {
  test('should render', () => {
    const {element} = render(<Field />);

    expect(element).not.toHaveStyleRule('cursor');
    expect(element).not.toHaveStyleRule('opacity');
    expect(element).toHaveStyleRule('background-color', Theme.white);

    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<Field disabled={true} />);

    expect(element).toHaveStyleRule('cursor', 'not-allowed');
    expect(element).toHaveStyleRule('opacity', `${DISABLED_OPACITY}`);
    expect(element).toHaveStyleRule('background-color', Theme.dialogGray);

    expect(element).toMatchSnapshot();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    const {element} = render(<Field value="foo" onChange={onChange} />);

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    const {element} = render(
      <Field name="foo" value="ipsum" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    const {element} = render(
      <Field disabled={true} value="foo" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
