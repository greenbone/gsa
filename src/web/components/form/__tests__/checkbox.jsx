/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import CheckBox from '../checkbox';

describe('CheckBox component tests', () => {
  test('should call change handler', () => {
    const change = testing.fn();
    const {element} = render(
      <CheckBox name="foo" checked={false} onChange={change} />,
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith(true, 'foo');
  });

  test('should use checkedValue', () => {
    const change = testing.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        checked={false}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith('ipsum', 'foo');
  });

  test('should use unCheckedValue', () => {
    const change = testing.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        checked={true}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith('lorem', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const change = testing.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        disabled={true}
        checked={true}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    const {getByTestId} = render(<CheckBox name="foo" title="bar" />);

    const titleElement = getByTestId('checkbox-title');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should render with children', () => {
    const {element} = render(
      <CheckBox>
        <span>child1</span>
        <span>child2</span>
      </CheckBox>,
    );
    expect(element).toMatchSnapshot();
  });
});

// vim: set ts=2 sw=2 tw=80:
