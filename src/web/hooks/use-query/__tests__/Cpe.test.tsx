/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import Cpe from 'gmp/models/cpe';
import {createSession} from 'gmp/testing';
import useGetCpe from 'web/hooks/use-query/cpe';

const cpe = Cpe.fromElement({
  _id: 'cpe:/a:vendor:product:1.0',
  name: 'Product',
});
const gitlabCpes = [
  Cpe.fromElement({
    _id: 'cpe:/a:gitlab:gitlab:18.5.1::~~enterprise~~~',
    name: 'cpe:/a:gitlab:gitlab:18.5.1::~~enterprise~~~',
    cpe: {
      cpe_name_id: '769CB07F-4C66-4FAC-92B0-56E913685351',
      title: 'GitLab 18.5.1 Enterprise Edition',
    },
  }),
  Cpe.fromElement({
    _id: 'cpe:/a:gitlab:gitlab:18.5.1::~~community~~~',
    name: 'cpe:/a:gitlab:gitlab:18.5.1::~~community~~~',
    cpe: {
      cpe_name_id: '51AEE2B5-ACC3-4095-860E-3EF35402014D',
      title: 'GitLab 18.5.1 Community Edition',
    },
  }),
];

const createGmp = ({
  getCpe = testing.fn().mockResolvedValue({data: cpe}),
  getCpes = testing.fn().mockResolvedValue({data: []}),
} = {}) => ({
  cpe: {get: getCpe},
  cpes: {get: getCpes},
  session: createSession({token: 'test-token'}),
  settings: {},
});

const CpeResult = ({id}: {id: string}) => {
  const {data, error, isLoading} = useGetCpe({id});

  if (isLoading) {
    return <div data-testid="loading">Loading</div>;
  }

  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }

  if (data?.candidateFilter) {
    return <div data-testid="candidate-filter">{data.candidateFilter}</div>;
  }

  return <div data-testid="cpe">{data?.cpe?.id}</div>;
};

describe('useGetCpe', () => {
  test('should load an exact CPE directly', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:vendor:product:1.0" />);

    await waitFor(() => {
      expect(screen.getByTestId('cpe')).toHaveTextContent(
        'cpe:/a:vendor:product:1.0',
      );
    });
    expect(gmp.cpe.get).toHaveBeenCalledTimes(1);
    expect(gmp.cpes.get).not.toHaveBeenCalled();
  });

  test('should retry legacy patch versions in canonical form', async () => {
    const gmp = createGmp({
      getCpe: testing
        .fn()
        .mockRejectedValueOnce(
          Object.assign(new Error('CPE not found'), {status: 404}),
        )
        .mockResolvedValue({data: cpe}),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:openbsd:openssh:7.4p1" />);

    await waitFor(() => {
      expect(screen.getByTestId('cpe')).toBeInTheDocument();
    });
    expect(gmp.cpe.get).toHaveBeenNthCalledWith(1, {
      id: 'cpe:/a:openbsd:openssh:7.4p1',
    });
    expect(gmp.cpe.get).toHaveBeenNthCalledWith(2, {
      id: 'cpe:/a:openbsd:openssh:7.4:p1',
    });
    expect(gmp.cpes.get).not.toHaveBeenCalled();
  });

  test('should expose candidates found by the original URI filter', async () => {
    const gmp = createGmp({
      getCpe: testing
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('CPE not found'), {status: 404}),
        ),
      getCpes: testing.fn().mockResolvedValue({data: gitlabCpes}),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:gitlab:gitlab:18.5.1" />);

    await waitFor(() => {
      expect(screen.getByTestId('candidate-filter')).toHaveTextContent(
        'name:gitlab:gitlab:18.5.1 first=1 rows=20',
      );
    });
    expect(gmp.cpes.get).toHaveBeenCalledTimes(1);
    const filter = gmp.cpes.get.mock.calls[0][0].filter;
    expect(filter.get('name')).toBe('gitlab:gitlab:18.5.1');
    expect(filter.getTerms('name')[0].relation).toBe(':');
  });

  test('should search canonical candidates after legacy patch lookups fail', async () => {
    const detailError = Object.assign(new Error('CPE not found'), {
      status: 404,
    });
    const gmp = createGmp({
      getCpe: testing.fn().mockRejectedValue(detailError),
      getCpes: testing
        .fn()
        .mockResolvedValueOnce({data: []})
        .mockResolvedValueOnce({data: [cpe]}),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:openbsd:openssh:7.4p1" />);

    await waitFor(() => {
      expect(screen.getByTestId('candidate-filter')).toHaveTextContent(
        'name:openbsd:openssh:7.4:p1 first=1 rows=20',
      );
    });
    expect(gmp.cpes.get).toHaveBeenCalledTimes(2);
  });

  test('should keep already separated patch components unchanged', async () => {
    const id = 'cpe:/a:sudo_project:sudoers_policy_plugin:1.8.19:p1';
    const gmp = createGmp({
      getCpe: testing
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('CPE not found'), {status: 404}),
        ),
      getCpes: testing.fn().mockResolvedValue({data: [cpe]}),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id={id} />);

    await waitFor(() => {
      expect(screen.getByTestId('candidate-filter')).toHaveTextContent(
        'name:sudo_project:sudoers_policy_plugin:1.8.19:p1 first=1 rows=20',
      );
    });
    expect(gmp.cpe.get).toHaveBeenCalledTimes(1);
    expect(gmp.cpes.get).toHaveBeenCalledTimes(1);
  });

  test('should not retry or search candidates after a non-404 detail error', async () => {
    const detailError = Object.assign(new Error('Permission denied'), {
      status: 403,
    });
    const gmp = createGmp({
      getCpe: testing.fn().mockRejectedValue(detailError),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:openbsd:openssh:7.4p1" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Permission denied',
      );
    });
    expect(gmp.cpe.get).toHaveBeenCalledTimes(1);
    expect(gmp.cpes.get).not.toHaveBeenCalled();
  });

  test('should retain the detail not-found error when no candidates exist', async () => {
    const detailError = Object.assign(new Error('CPE not found'), {
      status: 404,
    });
    const gmp = createGmp({
      getCpe: testing.fn().mockRejectedValue(detailError),
      getCpes: testing.fn().mockResolvedValue({data: []}),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:univention:univention_management_console" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('CPE not found');
    });
    expect(gmp.cpes.get).toHaveBeenCalledTimes(1);
  });

  test('should retain the detail error when candidate lookup fails', async () => {
    const detailError = Object.assign(new Error('CPE not found'), {
      status: 404,
    });
    const gmp = createGmp({
      getCpe: testing.fn().mockRejectedValue(detailError),
      getCpes: testing.fn().mockRejectedValue(new Error('List unavailable')),
    });
    const {render} = rendererWith({gmp, router: true});

    render(<CpeResult id="cpe:/a:vendor:missing_product" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('CPE not found');
    });
    expect(gmp.cpes.get).toHaveBeenCalledTimes(1);
  });
});
