/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {useModifyScannerAgentControlConfig} from 'web/hooks/use-query/scanner';

describe('useModifyScannerAgentControlConfig', () => {
  test('should forward scanner agent control configuration', async () => {
    const modifyAgentControlConfig = testing.fn().mockResolvedValue({data: {}});
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      scanner: {modifyAgentControlConfig},
    };
    const {render} = rendererWith({gmp, router: true});
    const input = {
      id: 'scanner-1',
      retryAttempts: 3,
      retryDelayInSeconds: 10,
    };

    const TestComponent = () => {
      const mutation = useModifyScannerAgentControlConfig();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(modifyAgentControlConfig.mock.calls[0][0]).toEqual(input);
    });
  });
});
