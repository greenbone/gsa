/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {createMemoryRouter, RouterProvider} from 'react-router';
import OmpPage from 'web/pages/OmpPage';
import {LocationDisplay} from 'web/testing/Components';

const renderOmpPage = (search: string) => {
  const router = createMemoryRouter(
    [
      {path: '/omp', element: <OmpPage />},
      {path: '*', element: <LocationDisplay />},
    ],
    {initialEntries: [{pathname: '/omp', search}]},
  );
  const {render} = rendererWith({router: false});
  render(<RouterProvider router={router} />);
};

describe('OmpPage', () => {
  test('should redirect nvt info_type to /nvt/:id', async () => {
    renderOmpPage('?cmd=get_info&info_type=nvt&info_id=test-nvt-id');

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/nvt/test-nvt-id',
      );
    });
  });

  test('should redirect cve info_type to /cve/:id', async () => {
    renderOmpPage('?cmd=get_info&info_type=cve&info_id=CVE-2021-1234');

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/cve/CVE-2021-1234',
      );
    });
  });

  test('should redirect cpe info_type to /cpe/:id', async () => {
    renderOmpPage('?cmd=get_info&info_type=cpe&info_id=cpe:/a:example:app');

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/cpe/cpe%3A%2Fa%3Aexample%3Aapp',
      );
    });
  });

  test('should redirect cert_bund_adv info_type to /certbund/:id', async () => {
    renderOmpPage(
      '?cmd=get_info&info_type=cert_bund_adv&info_id=CB-K21%2F0001',
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/certbund/',
      );
    });
  });

  test('should redirect dfn_cert_adv info_type to /dfncert/:id', async () => {
    renderOmpPage(
      '?cmd=get_info&info_type=dfn_cert_adv&info_id=DFN-CERT-2021-0001',
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/dfncert/DFN-CERT-2021-0001',
      );
    });
  });

  test('should redirect to /notfound for an unknown info_type', async () => {
    renderOmpPage('?cmd=get_info&info_type=unknown&info_id=foo');

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/notfound',
      );
    });
  });

  test('should redirect to /notfound when cmd is not get_info', async () => {
    renderOmpPage('?cmd=other&info_type=nvt&info_id=foo');

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/notfound',
      );
    });
  });
});
