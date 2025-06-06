/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';

export const withPrefix = Component => {
  const ComponentPrefixWrapper = ({prefix, ...props}) => {
    if (isDefined(prefix)) {
      prefix += '_';
    } else {
      prefix = '';
    }
    return <Component {...props} prefix={prefix} />;
  };

  ComponentPrefixWrapper.propTypes = {
    prefix: PropTypes.string,
  };

  return ComponentPrefixWrapper;
};

export default withPrefix;
