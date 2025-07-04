/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useGmp from 'web/hooks/useGmp';

const TestUseGmp = () => {
  const gmp = useGmp();
  // @ts-expect-error
  return <span>{gmp.foo()}</span>;
};

describe('useGmp tests', () => {
  test('should return the current gmp object', () => {
    const foo = testing.fn().mockReturnValue('foo');
    const gmp = {foo};

    const {render} = rendererWith({gmp});

    const {element} = render(<TestUseGmp />);

    expect(foo).toHaveBeenCalled();
    expect(element).toHaveTextContent(/^foo$/);
  });
});
