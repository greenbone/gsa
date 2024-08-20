/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

const SeverityPart = ({defaultSeverity, dynamicSeverity, onChange}) => {
  const [_] = useTranslation();
  return (
    <React.Fragment>
      <Checkbox
        title={_('Dynamic Severity')}
        name="dynamicSeverity"
        checked={dynamicSeverity === YES_VALUE}
        checkedValue={YES_VALUE}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
      <FormGroup title={_('Default Severity')}>
        <Spinner
          name="defaultSeverity"
          value={defaultSeverity}
          min="0"
          max="10"
          step="0.1"
          type="float"
          onChange={onChange}
        />
      </FormGroup>
    </React.Fragment>
  );
};

SeverityPart.propTypes = {
  defaultSeverity: PropTypes.number,
  dynamicSeverity: PropTypes.yesno,
  onChange: PropTypes.func.isRequired,
};

export default SeverityPart;

// vim: set ts=2 sw=2 tw=80:
