/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Field from './field';
import {Marker} from './useFormValidation';

const TextField = ({hasError = false, errorContent, title, ...props}) => {
  return (
    <React.Fragment>
      <Field
        {...props}
        hasError={hasError}
        title={hasError ? `${errorContent}` : title}
        type="text"
      />
      <Marker isVisible={hasError}>×</Marker>
    </React.Fragment>
  );
};

TextField.propTypes = {
  errorContent: PropTypes.toString,
  hasError: PropTypes.bool,
  title: PropTypes.string,
};

export default TextField;

// vim: set ts=2 sw=2 tw=80:
