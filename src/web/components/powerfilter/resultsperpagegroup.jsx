/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import useTranslation from 'web/hooks/useTranslation';

const ResultsPerPageGroup = ({rows, filter, onChange, name = 'rows'}) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    rows = filter.get('rows');
  }

  return (
    <FormGroup title={_('Results per page')} data-testid="results-per-page"> 
      <Spinner type="int" name={name} value={rows} onChange={onChange} />
    </FormGroup>
  );
};

ResultsPerPageGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  rows: PropTypes.number,
  onChange: PropTypes.func,
};

export default ResultsPerPageGroup;

// vim: set ts=2 sw=2 tw=80:
