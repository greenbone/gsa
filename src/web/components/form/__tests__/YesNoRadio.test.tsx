/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {render, fireEvent, screen} from 'web/testing';

const getLabels = (element: HTMLElement) => element.querySelectorAll('label');

describe('YesNoRadio tests', () => {
  test('should render', () => {
    const {container} = render(<YesNoRadio />);

    const labels = getLabels(container);

    expect(labels[0]).toHaveTextContent('Yes');
    expect(labels[1]).toHaveTextContent('No');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    render(<YesNoRadio onChange={onChange} />);

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(onChange).toHaveBeenCalledWith(YES_VALUE, undefined);

    fireEvent.click(screen.getByTestId('radio-no'));
    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should call change handler with name', () => {
    const onChange = testing.fn();
    render(<YesNoRadio name="foo" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'foo');
  });

  test('should allow to set values for yes and no state', () => {
    const onChange = testing.fn();
    render(
      <YesNoRadio<string>
        convert={v => v as string}
        name="ipsum"
        noValue="bar"
        yesValue="foo"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(onChange).toHaveBeenCalledWith('foo', 'ipsum');

    fireEvent.click(screen.getByTestId('radio-no'));
    expect(onChange).toHaveBeenCalledWith('bar', 'ipsum');
  });

  test('should call change handler only if checked state changes', () => {
    const onChange = testing.fn();
    render(<YesNoRadio value={YES_VALUE} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('radio-no'));
    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    render(
      <YesNoRadio disabled={true} value={YES_VALUE} onChange={onChange} />,
    );

    fireEvent.click(screen.getByTestId('radio-yes'));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('radio-no'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
