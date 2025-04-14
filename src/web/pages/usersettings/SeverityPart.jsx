/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import React from 'react';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const SeverityPart = ({defaultSeverity, dynamicSeverity, onChange}) => {
  const [_] = useTranslation();
  return (
    <React.Fragment>
      <Checkbox
        checked={dynamicSeverity === YES_VALUE}
        checkedValue={YES_VALUE}
        name="dynamicSeverity"
        title={_('Dynamic Severity')}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
      <FormGroup title={_('Default Severity')}>
        <Spinner
          max="10"
          min="0"
          name="defaultSeverity"
          precision={1}
          step="0.1"
          type="float"
          value={defaultSeverity}
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
