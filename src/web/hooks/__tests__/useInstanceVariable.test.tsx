/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {useState} from 'react';
import useInstanceVariable from 'web/hooks/useInstanceVariable';
import {fireEvent, rendererWith, screen} from 'web/utils/Testing';

const TestComponent = () => {
  const [someVariable, setVariable] = useInstanceVariable(1);
  const [, setToggle] = useState(false);
  const forceUpdate = () => setToggle(toggle => !toggle);
  const changeValue = () => {
    setVariable(2);
    forceUpdate();
  };
  return (
    <div>
      <div data-testid="t1">{someVariable}</div>
      <button data-testid="changeValue" onClick={changeValue} />
    </div>
  );
};

describe('useInstanceVariable tests', () => {
  test('should render the value', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    const t1 = screen.getByTestId('t1');
    expect(t1).toHaveTextContent('1');
    const b1 = screen.getByTestId('changeValue');
    fireEvent.click(b1);
    expect(t1).toHaveTextContent('2');
  });
});
