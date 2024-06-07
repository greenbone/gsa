/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import YesNoRadio from '../yesnoradio';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

describe('YesNoRadio tests', () => {
  test('should render', () => {
    const {element, getAllByTestId} = render(<YesNoRadio />);

    expect(element).toMatchSnapshot();

    const titleElements = getAllByTestId('radio-title');
    expect(titleElements.length).toEqual(2);
    expect(titleElements[0]).toHaveTextContent('Yes');
    expect(titleElements[1]).toHaveTextContent('No');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    const {getAllByTestId} = render(<YesNoRadio onChange={onChange} />);

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, undefined);

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should call change handler with name', () => {
    const onChange = testing.fn();
    const {getAllByTestId} = render(
      <YesNoRadio name="foo" onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'foo');
  });

  test('should allow to set values for yes and no state', () => {
    const onChange = testing.fn();
    const {getAllByTestId} = render(
      <YesNoRadio
        convert={v => v}
        name="ipsum"
        yesValue="foo"
        noValue="bar"
        onChange={onChange}
      />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith('foo', 'ipsum');

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith('bar', 'ipsum');
  });

  test('should call change handler only if checked state changes', () => {
    const onChange = testing.fn();
    const {getAllByTestId} = render(
      <YesNoRadio value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    const {getAllByTestId} = render(
      <YesNoRadio disabled={true} value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
