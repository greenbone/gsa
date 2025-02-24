/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {useCallback} from 'react';
import useInstanceVariable from 'web/hooks/useInstanceVariable';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';


const TestComponent = ({callback}) => {
  const someVariable = useInstanceVariable({value: 1});
  const changeValue = useCallback(() => {
    someVariable.value = 2;
    callback(someVariable.value);
  }, [someVariable, callback]);
  return (
    <div>
      <div data-testid="t1">{someVariable.value}</div>
      <button data-testid="changeValue" onClick={changeValue} />
    </div>
  );
};

describe('useInstanceVariable tests', () => {
  test('should render the value', () => {
    const callback = testing.fn();
    const {render} = rendererWith();

    render(<TestComponent callback={callback} />);

    const t1 = screen.getByTestId('t1');
    expect(t1).toHaveTextContent('1');
    const b1 = screen.getByTestId('changeValue');
    fireEvent.click(b1);
    expect(t1).toHaveTextContent('1');

    expect(callback).toHaveBeenCalledWith(2);
  });
});
