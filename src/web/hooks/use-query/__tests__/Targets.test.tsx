/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Target from 'gmp/models/target';
import {createSession} from 'gmp/testing';
import {useGetAllTargets, useGetTargets} from 'web/hooks/use-query/targets';

const filter = QueryFilter.fromString('name~target');
const targets = [new Target({id: 'target-1', name: 'Target 1'})];

const createGmp = () => {
  const response = {
    data: targets,
    meta: {
      filter,
      counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
    },
  };

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    targets: {
      get: testing.fn().mockResolvedValue(response),
      getAll: testing.fn().mockResolvedValue(response),
    },
  };
};

describe('useGetTargets', () => {
  test('should fetch targets with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetTargets({filter});
      return <div data-testid="target">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('target')).toHaveTextContent('Target 1');
    });

    expect(gmp.targets.get).toHaveBeenCalledWith({filter});
    expect(gmp.targets.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch targets when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetTargets({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.targets.get).not.toHaveBeenCalled();
  });

  test('should not fetch targets without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetTargets({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.targets.get).not.toHaveBeenCalled();
  });
});

describe('useGetAllTargets', () => {
  test('should fetch all targets with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAllTargets({filter});
      return <div data-testid="target">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('target')).toHaveTextContent('Target 1');
    });

    expect(gmp.targets.getAll).toHaveBeenCalledWith({filter});
    expect(gmp.targets.get).not.toHaveBeenCalled();
  });

  test('should not fetch targets when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllTargets({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.targets.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch targets without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllTargets({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.targets.getAll).not.toHaveBeenCalled();
  });
});
