/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';

import useTranslation from 'web/hooks/useTranslation';

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

// vim: set ts=2 sw=2 tw=80:
