/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import {createSession} from 'gmp/testing';
import {useGetAudit} from 'web/hooks/use-query/audit';

const audit = Audit.fromElement({
  _id: 'audit-1',
  name: 'Test Audit',
  status: AUDIT_STATUS.done,
  usage_type: 'audit',
  permissions: {permission: [{name: 'everything'}]},
});

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  audit: {
    get: testing.fn().mockResolvedValue({data: audit}),
  },
  session: createSession({token}),
  settings: {},
});

const SingleAuditComponent = ({id}: {id: string}) => {
  const {data, isLoading, isError} = useGetAudit({id});

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (isError) return <div data-testid="error">Error</div>;
  if (!data) return <div data-testid="no-data">No data</div>;

  return (
    <div data-testid="audit">
      <span data-testid="audit-name">{data.name}</span>
      <span data-testid="audit-id">{data.id}</span>
    </div>
  );
};

describe('useGetAudit', () => {
  test('should fetch a single audit', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('audit-name')).toHaveTextContent('Test Audit');
    });
    expect(gmp.audit.get).toHaveBeenCalledWith({id: 'audit-1'});
    expect(screen.getByTestId('audit-id')).toHaveTextContent('audit-1');
  });

  test('should show loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should not fetch an audit when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="" />);
    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.audit.get).not.toHaveBeenCalled();
  });

  test('should not fetch an audit without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);
    expect(gmp.audit.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching an audit fails', async () => {
    const gmp = createGmp();
    gmp.audit.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});
    render(<SingleAuditComponent id="audit-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});
