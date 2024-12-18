/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import React from 'react';
import styled from 'styled-components';
import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

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
      <FormGroup direction="row" title={_('Include')}>
        <CheckBox
          checked={includeNotes}
          checkedValue={YES_VALUE}
          data-testid="includeNotes"
          name="includeNotes"
          title={_('Notes')}
          unCheckedValue={NO_VALUE}
          onChange={onValueChange}
        />
        <CheckBox
          checked={includeOverrides}
          checkedValue={YES_VALUE}
          data-testid="include-overrides"
          name="includeOverrides"
          title={_('Overrides')}
          unCheckedValue={NO_VALUE}
          onChange={onValueChange}
        />
        <CheckBox
          checked={true}
          checkedValue={YES_VALUE}
          data-testid="include-tls-cert"
          disabled={true}
          name="includeTlsCertificates"
          title={_('TLS Certificates')}
          toolTipTitle={_('TLS Certificates are always included for now')}
          unCheckedValue={NO_VALUE}
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
