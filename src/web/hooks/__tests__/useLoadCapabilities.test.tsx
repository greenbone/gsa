/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import useLoadCapabilities from 'web/hooks/useLoadCapabilities';

const TestComponent = () => {
  const capabilities = useLoadCapabilities();
  return (
    <>
      {capabilities &&
        capabilities.map(capability => {
          return (
            <div key={capability} data-testid="capability">
              {capability}
            </div>
          );
        })}
    </>
  );
};

describe('useLoadCapabilities tests', () => {
  test('should load capabilities', async () => {
    const capabilities = new Capabilities(['cap_1', 'cap_2']);
    const response = {data: capabilities};
    const gmp = {
      user: {
        currentCapabilities: testing.fn().mockResolvedValue(response),
      },
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent />);

    await wait();

    expect(gmp.user.currentCapabilities).toHaveBeenCalled();
    expect(screen.getAllByTestId('capability').length).toEqual(2);
  });
});
