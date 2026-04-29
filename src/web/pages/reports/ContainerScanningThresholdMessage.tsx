/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CONTAINER_SCANNING_RESULTS_THRESHOLD} from 'gmp/settings';
import ErrorContainer from 'web/components/error/ErrorContainer';
import useTranslation from 'web/hooks/useTranslation';

const ContainerScanningThresholdMessage = () => {
  const [_] = useTranslation();

  return (
    <ErrorContainer>
      {_(
        'WARNING: Please be aware that the report has more results than ' +
          'the threshold of {{threshold}}. Therefore, this action can take ' +
          'a really long time to finish. It might even exceed the session ' +
          'timeout!',
        {threshold: CONTAINER_SCANNING_RESULTS_THRESHOLD},
      )}
    </ErrorContainer>
  );
};

export default ContainerScanningThresholdMessage;
