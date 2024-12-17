/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import useTranslation from 'web/hooks/useTranslation';

export const COMPOSER_CONTENT_DEFAULTS = {
  includeNotes: YES_VALUE,
  includeOverrides: YES_VALUE,
};

const FilterField = styled.div`
  display: block;
  min-height: 22px;
  color: ${Theme.darkGray};
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 2px;
  padding: 3px 8px;
  cursor: not-allowed;
  background-color: ${Theme.dialogGray};
  width: 100%;
`;

const ComposerContent = ({
  filterFieldTitle,
  filterString,
  includeNotes,
  includeOverrides,
  onValueChange,
}) => {
  const [_] = useTranslation();
  filterFieldTitle =
    filterFieldTitle ||
    _(
      'To change the filter, please filter your results on the report page. This filter will not be stored as default.',
    );
  return (
    <>
      <FormGroup title={_('Results Filter')}>
        <FilterField title={filterFieldTitle}>{filterString}</FilterField>
      </FormGroup>
      <FormGroup title={_('Include')} direction="row">
        <CheckBox
          data-testid="includeNotes"
          name="includeNotes"
          checked={includeNotes}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          title={_('Notes')}
          onChange={onValueChange}
        />
        <CheckBox
          data-testid="include-overrides"
          name="includeOverrides"
          checked={includeOverrides}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          title={_('Overrides')}
          onChange={onValueChange}
        />
        <CheckBox
          data-testid="include-tls-cert"
          disabled={true}
          name="includeTlsCertificates"
          checked={true}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          title={_('TLS Certificates')}
          toolTipTitle={_('TLS Certificates are always included for now')}
          onChange={onValueChange}
        />
      </FormGroup>
    </>
  );
};

ComposerContent.propTypes = {
  filterFieldTitle: PropTypes.string,
  filterString: PropTypes.string.isRequired,
  includeNotes: PropTypes.number.isRequired,
  includeOverrides: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default ComposerContent;

// vim: set ts=2 sw=2 tw=80:
