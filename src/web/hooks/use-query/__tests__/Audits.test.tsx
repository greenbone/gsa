/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import {useGetAudit, useGetAudits} from 'web/hooks/use-query/audits';

const audit = Audit.fromElement({
  _id: 'audit-1',
  name: 'Test Audit',
  status: AUDIT_STATUS.done,
  usage_type: 'audit',
  permissions: {permission: [{name: 'everything'}]},
});

const audit2 = Audit.fromElement({
  _id: 'audit-2',
  name: 'Test Audit 2',
  status: AUDIT_STATUS.new,
  usage_type: 'audit',
  permissions: {permission: [{name: 'everything'}]},
});

const SingleAuditComponent = ({id}: {id: string}) => {
  const {data, isLoading, isError} = useGetAudit({id});

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="audit">
      <span data-testid="audit-name">{data.name}</span>
      <span data-testid="audit-id">{data.id}</span>
    </div>
  );
};

const AuditListComponent = ({filter}: {filter?: Filter}) => {
  const {data, isLoading, isError} = useGetAudits({filter});

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="audits">
      {data.entities.map(a => (
        <div key={a.id} data-testid="audit-item">
          {a.name}
        </div>
      ))}
    </div>
  );
};

describe('useGetAudit', () => {
  test('should fetch a single audit', async () => {
    const mockGet = testing.fn().mockResolvedValue({data: audit});

    const gmp = {
      audit: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('audit-name')).toHaveTextContent('Test Audit');
    });

    expect(mockGet).toHaveBeenCalledWith({id: 'audit-1'});
    expect(screen.getByTestId('audit-id')).toHaveTextContent('audit-1');
  });

  test('should show loading state initially', () => {
    const mockGet = testing.fn().mockReturnValue(new Promise(() => {}));

    const gmp = {
      audit: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('useGetAudits', () => {
  test('should fetch a list of audits', async () => {
    const filter = Filter.fromString('name~test');
    const mockGet = testing.fn().mockResolvedValue({
      data: [audit, audit2],
      meta: {
        filter: Filter.fromString('name~test'),
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    });

    const gmp = {
      audits: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<AuditListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('audit-item')).toHaveLength(2);
    });

    expect(mockGet).toHaveBeenCalled();
    expect(screen.getByText('Test Audit')).toBeInTheDocument();
    expect(screen.getByText('Test Audit 2')).toBeInTheDocument();
  });
});
