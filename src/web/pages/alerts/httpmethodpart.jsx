/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import withPrefix from 'web/utils/withPrefix';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

const HttpMethodPart = ({prefix, URL, onChange}) => {
  return (
    <FormGroup title={_('HTTP Get URL')}>
      <TextField
        grow="1"
        name={prefix + 'URL'}
        value={URL}
        onChange={onChange}
      />
    </FormGroup>
  );
};

HttpMethodPart.propTypes = {
  URL: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(HttpMethodPart);

// vim: set ts=2 sw=2 tw=80:
