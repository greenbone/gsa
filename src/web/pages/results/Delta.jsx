/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {Delta} from 'gmp/models/result';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ResultDelta = ({delta}) => {
  const [_] = useTranslation();
  switch (delta.delta_type) {
    case Delta.TYPE_NEW:
      return <span title={_('New')}>[ + ]</span>;
    case Delta.TYPE_CHANGED:
      return <span title={_('Changed')}>[ ~ ]</span>;
    case Delta.TYPE_GONE:
      return <span title={_('Gone')}>[ &#8722; ]</span>;
    case Delta.TYPE_SAME:
      return <span title={_('Same')}>[ = ]</span>;
    default:
      return null;
  }
};

ResultDelta.propTypes = {
  delta: PropTypes.object.isRequired,
};

export default ResultDelta;
