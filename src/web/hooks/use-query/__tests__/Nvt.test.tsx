/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import Nvt from 'gmp/models/nvt';
import {createSession} from 'gmp/testing';
import useGetNvt from 'web/hooks/use-query/nvt';

const nvt = new Nvt({
  id: '1.3.6.1.4.1.25623.1.12345',
  oid: '1.3.6.1.4.1.25623.1.12345',
  techInfo: 'Technical information',
});

const NvtComponent = ({id}: {id?: string}) => {
  const {data} = useGetNvt({id});

  return <div data-testid="nvt">{data?.techInfo}</div>;
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  nvt: {
    get: testing.fn().mockResolvedValue({data: nvt}),
  },
});

describe('useGetNvt', () => {
  test('should fetch an NVT by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<NvtComponent id={nvt.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('nvt')).toHaveTextContent(
        'Technical information',
      );
    });

    expect(gmp.nvt.get).toHaveBeenCalledWith({id: nvt.id});
  });

  test('should not fetch without an ID', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<NvtComponent />);

    expect(gmp.nvt.get).not.toHaveBeenCalled();
  });
});
