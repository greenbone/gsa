/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import useGetInstallInstructions from 'web/hooks/use-query/agent-install-instructions';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

const instructions: InstallInstructionsData = {
  _version: '1.0',
  lang: 'de',
  title: 'Agent Installation',
  sections: [],
};

const InstructionsComponent = ({
  enabled,
  scannerId,
}: {
  enabled?: boolean;
  scannerId?: string;
}) => {
  const {data} = useGetInstallInstructions({enabled, scannerId});

  return <div data-testid="title">{data?.title}</div>;
};

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  agentinstallersinstructions: {
    getInstructions: testing.fn().mockResolvedValue({data: instructions}),
  },
});

describe('useGetInstallInstructions', () => {
  test('should fetch installation instructions', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      language: 'de-DE',
      router: true,
    });

    render(<InstructionsComponent scannerId="scanner-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Agent Installation',
      );
    });

    expect(
      gmp.agentinstallersinstructions.getInstructions,
    ).toHaveBeenCalledWith({
      lang: 'de',
      scannerId: 'scanner-1',
      originUrl: globalThis.location.origin,
    });
  });

  test('should not fetch when there is no session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<InstructionsComponent />);

    expect(
      gmp.agentinstallersinstructions.getInstructions,
    ).not.toHaveBeenCalled();
  });

  test('should not fetch when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<InstructionsComponent enabled={false} />);

    expect(
      gmp.agentinstallersinstructions.getInstructions,
    ).not.toHaveBeenCalled();
  });
});
