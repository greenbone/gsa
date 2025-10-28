/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';

interface ResultsPerPageGroupProps {
  rows?: number;
  filter?: Filter;
  name?: string;
  onChange?: (value: number, name: string) => void;
}

const ResultsPerPageGroup = ({
  rows,
  filter,
  onChange,
  name = 'rows',
}: ResultsPerPageGroupProps) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    rows = filter.get('rows') as number | undefined;
  }

  return (
    <FormGroup data-testid="results-per-page" title={_('Results per page')}>
      <Spinner
        name={name}
        type="int"
        value={rows}
        onChange={
          onChange as ((value: number, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default ResultsPerPageGroup;
