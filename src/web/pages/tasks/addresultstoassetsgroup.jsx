/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

export const AddResultsToAssetsGroup = ({inAssets, onChange}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Add results to Assets')}>
      <YesNoRadio name="in_assets" value={inAssets} onChange={onChange} />
    </FormGroup>
  );
};

AddResultsToAssetsGroup.propTypes = {
  inAssets: PropTypes.yesno,
  onChange: PropTypes.func,
};

export default AddResultsToAssetsGroup;
