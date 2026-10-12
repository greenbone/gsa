/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, describe, test, expect} from '@gsa/testing';
import {fireEvent, screen, rendererWith} from 'web/testing';
import useEntitiesRefetchInterval from 'web/entities/useEntitiesRefetchInterval';

const TestComponent = ({entities, useActive = false}) => {
  const timeoutFunc = useEntitiesRefetchInterval({useActive});
  return <span data-testid="timeout">{timeoutFunc(entities)}</span>;
};

const createGmp = ({
  reloadInterval = 60000,
  reloadIntervalActive = 30000,
  reloadIntervalInactive = 40000,
} = {}) => ({
  settings: {
    reloadInterval,
    reloadIntervalActive,
    reloadIntervalInactive,
  },
});

const documentHiddenDescriptor = Object.getOwnPropertyDescriptor(
  document,
  'hidden',
);

describe('useEntitiesRefetchInterval', () => {
  afterEach(() => {
    if (documentHiddenDescriptor) {
      Object.defineProperty(document, 'hidden', documentHiddenDescriptor);
    } else {
      Reflect.deleteProperty(document, 'hidden');
    }
  });

  test('should return the reload interval', () => {
    const entities = [{isActive: () => true}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the active reload interval', () => {
    const entities = [{isActive: () => true}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');
  });

  test('should return the reload interval when all entities are inactive', () => {
    const entities = [{isActive: () => false}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the active reload interval if at least one entity is active', () => {
    const entities = [{isActive: () => false}, {isActive: () => true}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');
  });

  test('should return the reload interval if not entity is available', () => {
    const entities = [];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('60000');
  });

  test('should return the inactive reload interval if not visible', () => {
    const entities = [{isActive: () => false}, {isActive: () => true}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    render(<TestComponent entities={entities} useActive={true} />);

    expect(screen.getByTestId('timeout')).toHaveTextContent('40000');
  });

  test('should rerender when document visibility changes', () => {
    const entities = [{isActive: () => true}];
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<TestComponent entities={entities} useActive={true} />);
    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByTestId('timeout')).toHaveTextContent('40000');

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByTestId('timeout')).toHaveTextContent('30000');
  });
});
