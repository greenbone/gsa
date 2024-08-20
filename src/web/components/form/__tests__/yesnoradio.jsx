/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {render, fireEvent} from 'web/utils/testing';

import {getRadioInputs} from 'web/components/testing';

import YesNoRadio from '../yesnoradio';

const getLabels = element => element.querySelectorAll('label');

describe('YesNoRadio tests', () => {
  test('should render', () => {
    const {element} = render(<YesNoRadio />);

    const labels = getLabels(element);

    expect(labels[0]).toHaveTextContent('Yes');
    expect(labels[1]).toHaveTextContent('No');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    const {element} = render(<YesNoRadio onChange={onChange} />);

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, undefined);

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should call change handler with name', () => {
    const onChange = testing.fn();
    const {element} = render(<YesNoRadio name="foo" onChange={onChange} />);

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'foo');
  });

  test('should allow to set values for yes and no state', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio
        convert={v => v}
        name="ipsum"
        yesValue="foo"
        noValue="bar"
        onChange={onChange}
      />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith('foo', 'ipsum');

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith('bar', 'ipsum');
  });

  test('should call change handler only if checked state changes', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio disabled={true} value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).not.toHaveBeenCalled();
  });
});
