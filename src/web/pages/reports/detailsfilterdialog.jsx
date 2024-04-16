/* Copyright (C) 2017-2022 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';

import FilterDialog from 'web/components/powerfilter/filterdialog';
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/utils/useCapabilities';

import DeltaResultsFilterGroup from './deltaresultsfiltergroup';

const ReportDetailsFilterDialog = ({
  delta = false,
  filter: initialFilter,
  onCloseClick,
  onClose = onCloseClick,
  onFilterChanged,
  onFilterCreated,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'result',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );
  const {
    filter,
    filterName,
    filterString,
    saveNamedFilter,
    onFilterChange,
    onFilterValueChange,
    onFilterStringChange,
    onSearchTermChange,
    onValueChange,
  } = filterDialogProps;
  const resultHostsOnly = filter.get('result_hosts_only');
  const handleRemoveLevels = () =>
    onFilterChange(filter.copy().delete('levels'));
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        name="filterstring"
        filter={filterString}
        onChange={onFilterStringChange}
      />

      {delta && (
        <DeltaResultsFilterGroup
          filter={filter}
          onChange={onFilterValueChange}
        />
      )}

      <BooleanFilterGroup
        name="apply_overrides"
        title={_('Apply Overrides')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <Checkbox
        title={_('Only show hosts that have results')}
        name="result_hosts_only"
        checkedValue={1}
        unCheckedValue={0}
        checked={resultHostsOnly === 1}
        onChange={onFilterValueChange}
      />

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      <SeverityLevelsGroup
        filter={filter}
        onChange={onFilterValueChange}
        onRemove={handleRemoveLevels}
      />

      <SeverityValuesGroup
        name="severity"
        title={_('Severity')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <SolutionTypeGroup filter={filter} onChange={onFilterValueChange} />

      <FilterSearchGroup
        name="vulnerability"
        filter={filter}
        title={_('Vulnerability')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="host"
        filter={filter}
        title={_('Host (IP)')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="location"
        filter={filter}
        title={_('Location (eg. port/protocol)')}
        onChange={onSearchTermChange}
      />

      <FirstResultGroup filter={filter} onChange={onFilterValueChange} />

      <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />

      {capabilities.mayCreate('filter') && (
        <CreateNamedFilterGroup
          filter={filter}
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </FilterDialog>
  );
};

ReportDetailsFilterDialog.propTypes = {
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ReportDetailsFilterDialog;

// vim: set ts=2 sw=2 tw=80:
