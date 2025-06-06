/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ResultsPerPageGroup = ({rows, filter, onChange, name = 'rows'}) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    rows = filter.get('rows');
  }

  return (
    <FormGroup data-testid="results-per-page" title={_('Results per page')}>
      <Spinner name={name} type="int" value={rows} onChange={onChange} />
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
