/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {NO_VALUE, YES_VALUE, type YesNo} from 'gmp/parser';
import CheckBox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface ComposerContentProps {
  audit: boolean;
  filterFieldTitle?: string;
  filterString: string;
  includeNotes: YesNo;
  includeOverrides: YesNo;
  onValueChange?: (value: YesNo, name?: string) => void;
}

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
  audit = false,
  filterFieldTitle,
  filterString,
  includeNotes,
  includeOverrides,
  onValueChange,
}: ComposerContentProps) => {
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
          checked={includeNotes === YES_VALUE}
          checkedValue={YES_VALUE}
          data-testid="includeNotes"
          name="includeNotes"
          title={_('Notes')}
          unCheckedValue={NO_VALUE}
          onChange={onValueChange}
        />
        {!audit && (
          <CheckBox
            checked={includeOverrides === YES_VALUE}
            checkedValue={YES_VALUE}
            data-testid="include-overrides"
            name="includeOverrides"
            title={_('Overrides')}
            unCheckedValue={NO_VALUE}
            onChange={onValueChange}
          />
        )}
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

export default ComposerContent;
