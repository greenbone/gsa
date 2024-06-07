/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import withLayout from 'web/components/layout/withLayout';

import PropTypes from 'web/utils/proptypes';

const FileFieldComponent = props => {
  const handleChange = event => {
    const {onChange, disabled, name} = props;

    event.preventDefault();

    if (!disabled && isDefined(onChange)) {
      onChange(event.target.files[0], name);
    }
  };

  const {onChange, ...args} = props;
  return <input {...args} type="file" onChange={handleChange} />;
};

FileFieldComponent.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout()(FileFieldComponent);

// vim: set ts=2 sw=2 tw=80:
