/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useGetAllCredentials,
  useGetCredentials,
} from 'web/hooks/use-query/credentials';

const filter = QueryFilter.fromString('name~credential');
const credentials = [
  new Credential({
    id: 'credential-1',
    name: 'Credential 1',
    credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
  }),
];

const createGmp = () => {
  const response = {
    data: credentials,
    meta: {
      filter,
      counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
    },
  };

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    credentials: {
      get: testing.fn().mockResolvedValue(response),
      getAll: testing.fn().mockResolvedValue(response),
    },
  };
};

describe('useGetCredentials', () => {
  test('should fetch credentials with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetCredentials({filter});
      return <div data-testid="credential">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('credential')).toHaveTextContent(
        'Credential 1',
      );
    });

    expect(gmp.credentials.get).toHaveBeenCalledWith({filter});
    expect(gmp.credentials.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch credentials when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetCredentials({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.credentials.get).not.toHaveBeenCalled();
  });

  test('should not fetch credentials without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetCredentials({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.credentials.get).not.toHaveBeenCalled();
  });
});

describe('useGetAllCredentials', () => {
  test('should fetch all credentials with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAllCredentials({filter});
      return <div data-testid="credential">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('credential')).toHaveTextContent(
        'Credential 1',
      );
    });

    expect(gmp.credentials.getAll).toHaveBeenCalledWith({filter});
    expect(gmp.credentials.get).not.toHaveBeenCalled();
  });

  test('should not fetch credentials when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllCredentials({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.credentials.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch credentials without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllCredentials({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.credentials.getAll).not.toHaveBeenCalled();
  });
});
