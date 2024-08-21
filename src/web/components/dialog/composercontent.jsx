/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

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
  filterFieldTitle = _(
    'To change the filter, please filter your results on the report page. This filter will not be stored as default.',
  ),
  filterString,
  includeNotes,
  includeOverrides,
  onValueChange,
}) => (
  <Layout flex="column">
    <FormGroup title={_('Results Filter')} titleSize="3">
      <FilterField title={filterFieldTitle}>{filterString}</FilterField>
    </FormGroup>
    <FormGroup title={_('Include')} titleSize="3">
      <Divider>
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
          name="includeOverrides"
          checked={includeOverrides}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          title={_('Overrides')}
          onChange={onValueChange}
        />
        <CheckBox
          disabled={true}
          name="includeTlsCertificates"
          checked={true}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          title={_('TLS Certificates')}
          toolTipTitle={_('TLS Certificates are always included for now')}
          onChange={onValueChange}
        />
      </Divider>
    </FormGroup>
  </Layout>
);

ComposerContent.propTypes = {
  filterFieldTitle: PropTypes.string,
  filterString: PropTypes.string.isRequired,
  includeNotes: PropTypes.number.isRequired,
  includeOverrides: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default ComposerContent;

// vim: set ts=2 sw=2 tw=80:
