/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ErrorContainer from 'web/components/error/ErrorContainer';
import useTranslation from 'web/hooks/useTranslation';

interface ThresholdMessageProps {
  threshold: number;
}

const ThresholdMessage = ({threshold}: ThresholdMessageProps) => {
  const [_] = useTranslation();

  return (
    <ErrorContainer>
      {_(
        'WARNING: Please be aware that the report has more results than ' +
          'the threshold of {{threshold}}. Therefore, this action can take ' +
          'a really long time to finish. It might even exceed the session ' +
          'timeout!',
        {threshold},
      )}
    </ErrorContainer>
  );
};

export default ThresholdMessage;
