/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ScannerAgentControlConfigParams} from 'gmp/commands/scanner';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import type ActionResult from 'gmp/models/action-result';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseModifyScannerAgentControlConfigParams {
  onSuccess?: () => void;
  onError?: (error: Rejection) => void;
}

export const useModifyScannerAgentControlConfig = ({
  onError,
  onSuccess,
}: UseModifyScannerAgentControlConfigParams = {}) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  return useGmpMutation<
    ScannerAgentControlConfigParams,
    Response<ActionResult, XmlMeta>,
    Rejection
  >({
    gmpMethod: gmp.scanner.modifyAgentControlConfig.bind(gmp.scanner),
    invalidateQueryIds: ['get_scanners'],
    successMessage: _(
      'Scanner agent control configuration successfully updated',
    ),
    onSuccess,
    onError,
  });
};
