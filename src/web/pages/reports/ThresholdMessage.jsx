/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import ErrorContainer from 'web/components/error/ErrorContainer';
import PropTypes from 'web/utils/PropTypes';

const ThresholdMessage = ({threshold}) => {
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

ThresholdMessage.propTypes = {
  threshold: PropTypes.number.isRequired,
};

export default ThresholdMessage;
