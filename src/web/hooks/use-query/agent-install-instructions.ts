/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import useLanguage from 'web/hooks/useLanguage';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

type UseGetInstallInstructionsParams = {
  enabled?: boolean;
};

const getInstructionsUrl = (langCode: string): string => {
  const encodedLang = encodeURIComponent(langCode);
  return `http://dev.agent-control.greenbone.io:8080/api/v1/install-instructions?lang=${encodedLang}`;
};

const useGetInstallInstructions = ({
  enabled = true,
}: UseGetInstallInstructionsParams = {}) => {
  const [language] = useLanguage();
  const langCode = language.split(/[-_]/)[0] || 'en';
  const url = getInstructionsUrl(langCode);

  return useQuery<InstallInstructionsData>({
    queryKey: ['install-instructions', url],
    queryFn: async () => {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<InstallInstructionsData>;
    },
    enabled,
  });
};

export default useGetInstallInstructions;
