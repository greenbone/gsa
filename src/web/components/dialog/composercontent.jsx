/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
