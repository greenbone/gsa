/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {YesNo} from 'gmp/parser';
import FormGroup from 'web/components/form/FormGroup';
import YesNoRadio from 'web/components/form/YesNoRadio';
import useTranslation from 'web/hooks/useTranslation';

interface AddResultsToAssetsGroupProps {
  inAssets?: YesNo;
  onChange?: (value: YesNo, name: string) => void;
}

export const AddResultsToAssetsGroup = ({
  inAssets,
  onChange,
}: AddResultsToAssetsGroupProps) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Add results to Assets')}>
      <YesNoRadio
        name="in_assets"
        value={inAssets}
        onChange={
          onChange as ((value: YesNo, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default AddResultsToAssetsGroup;
