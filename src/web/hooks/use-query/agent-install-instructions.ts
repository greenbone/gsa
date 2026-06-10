/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useSession from 'web/hooks/useSessionToken';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

type UseGetInstallInstructionsParams = {
  scannerId?: string;
  enabled?: boolean;
};

const useGetInstallInstructions = ({
  scannerId,
  enabled = true,
}: UseGetInstallInstructionsParams = {}) => {
  const gmp = useGmp();
  const token = useSession();
  const [language] = useLanguage();
  const langCode = language.split(/[-_]/)[0] || 'en';

  return useQuery<InstallInstructionsData>({
    queryKey: ['install-instructions', token, scannerId, langCode],
    queryFn: async () => {
      const response = await gmp.agentinstallersinstructions.getInstructions({
        lang: langCode,
        scannerId,
      });
      return response.data;
    },
    enabled: enabled && Boolean(token),
  });
};

export default useGetInstallInstructions;
