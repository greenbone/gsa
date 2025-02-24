/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import {screen, rendererWith} from 'web/utils/Testing';


const TestComponent = ({entities, useActive, isVisible = true}) => {
  const timeoutFunc = useEntitiesReloadInterval(entities, {useActive});
  return <span data-testid="timeout">{timeoutFunc({isVisible})}</span>;
};

describe('useEntitiesReloadInterval', () => {
  test('should return the reload interval', () => {
    const entities = [{isActive: () => true}];
    const gmp = {settings: {reloadInterval: 60000}};
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the active reload interval', () => {
    const entities = [{isActive: () => true}];
    const gmp = {
      settings: {reloadInterval: 60000, reloadIntervalActive: 30000},
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');
  });

  test('should return the reload interval when all entities are inactive', () => {
    const entities = [{isActive: () => false}];
    const gmp = {
      settings: {reloadInterval: 60000, reloadIntervalActive: 30000},
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the active reload interval if at least one entity is active', () => {
    const entities = [{isActive: () => false}, {isActive: () => true}];
    const gmp = {
      settings: {reloadInterval: 60000, reloadIntervalActive: 30000},
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');
  });

  test('should return the reload interval if not entity is available', () => {
    const entities = [];
    const gmp = {
      settings: {
        reloadInterval: 60000,
        reloadIntervalActive: 30000,
      },
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the inactive reload interval if not visible', () => {
    const entities = [{isActive: () => false}, {isActive: () => true}];
    const gmp = {
      settings: {
        reloadInterval: 60000,
        reloadIntervalActive: 30000,
        reloadIntervalInactive: 40000,
      },
    };
    const {render} = rendererWith({gmp});

    render(
      <TestComponent entities={entities} isVisible={false} useActive={true} />,
    );

    expect(screen.getByTestId('timeout')).toHaveTextContent('40000');
  });
});
