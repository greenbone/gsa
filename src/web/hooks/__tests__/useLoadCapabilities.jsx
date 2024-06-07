/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {rendererWith, screen, wait} from 'web/utils/testing';

import useLoadCapabilities from '../useLoadCapabilities';

const TestComponent = () => {
  const capabilities = useLoadCapabilities();
  return (
    <>
      {capabilities &&
        capabilities.map(capability => {
          return (
            <div data-testid="capability" key={capability.name}>
              {capability.name}
            </div>
          );
        })}
    </>
  );
};

describe('useLoadCapabilities tests', () => {
  test('should load capabilities', async () => {
    const capabilities = [{name: 'cap_1'}, {name: 'cap_2'}];
    const response = {data: capabilities};
    const gmp = {
      user: {
        currentCapabilities: testing.fn(() => Promise.resolve(response)),
      },
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent />);

    await wait();

    expect(gmp.user.currentCapabilities).toHaveBeenCalled();
    expect(screen.getAllByTestId('capability').length).toEqual(2);
  });
});
