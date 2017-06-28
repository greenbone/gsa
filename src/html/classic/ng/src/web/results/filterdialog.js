/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import  _ from '../../locale.js';
import {parse_int} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import Checkbox from '../components/form/checkbox.js';
import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';

import SeverityClassLabel from '../components/label/severityclass.js';

import ApplyOverridesGroup from '../components/powerfilter/applyoverridesgroup.js'; // eslint-disable-line max-len
import FilterStringGroup from '../components/powerfilter/filterstringgroup.js';
import FirstResultGroup from '../components/powerfilter/firstresultgroup.js';
import MinQodGroup from '../components/powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../components/powerfilter/resultsperpagegroup.js'; // eslint-disable-line max-len
import SortByGroup from '../components/powerfilter/sortbygroup.js';
import {
  DefaultFilterDialogPropTypes,
  withFilterDialog,
} from '../components/powerfilter/dialog.js';

const SORT_FIELDS = [
  ['vulnerability', _('Vulnerability')],
  ['solution_type', _('Solution type')],
  ['severity', _('Severity')],
  ['qod', _('QoD')],
  ['host', _('Host')],
  ['location', _('Location')],
  ['created', _('Created')],
];

class ResultsFilterDialogComponent extends React.Component {

  constructor(props) {
    super(props);

    this.handleLevelChange = this.handleLevelChange.bind(this);
  }

  handleLevelChange(value, level) {
    let {filter, onFilterValueChange} = this.props;
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    if (value && !levels.includes(level)) {
      levels += level;
      onFilterValueChange(levels, 'levels');
    }
    else if (!value && level.includes(level)) {
      levels = levels.replace(level, '');
      onFilterValueChange(levels, 'levels');
    }
  }

  render() {
    const {
      filter,
      filterstring,
      onFilterStringChange,
      onFilterValueChange,
      onSortByChange,
      onSortOrderChange,
    } = this.props;

    if (!filter) {
      return null;
    }

    let autofp = filter.get('autofp');
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    return (
      <Layout flex="column">

        <FilterStringGroup name="filterstring"
          filter={filterstring}
          onChange={onFilterStringChange}/>

        <ApplyOverridesGroup
          filter={filter}
          onChange={onFilterValueChange}/>

        <FormGroup title={_('Auto-FP')} flex="column">
          <Checkbox
            name="autofp"
            checkedValue={1}
            unCheckedValue={0}
            checked={autofp >= 1}
            title={_('Trust vendor security updates')}
            onChange={onFilterValueChange}/>
          <Layout flex box>
            <Radio
              name="autofp"
              title={_('Full CVE match')}
              value={1}
              disabled={autofp === 0}
              checked={autofp === 1}
              convert={parse_int}
              onChange={onFilterValueChange}/>
            <Radio
              name="autofp"
              title={_('Partial CVE match')}
              value="2"
              disabled={autofp === 0}
              checked={autofp === 2}
              convert={parse_int}
              onChange={onFilterValueChange}/>
          </Layout>
        </FormGroup>

        <MinQodGroup name="min_qod"
          filter={filter}
          onChange={onFilterValueChange}/>

        <FormGroup title={_('Severity (Class)')}>
          <Checkbox
            checked={levels.includes('h')}
            name="h"
            onChange={this.handleLevelChange}>
            <SeverityClassLabel.High/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('m')}
            name="m"
            onChange={this.handleLevelChange}>
            <SeverityClassLabel.Medium/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('l')}
            name="l"
            onChange={this.handleLevelChange}>
            <SeverityClassLabel.Low/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('g')}
            name="g"
            onChange={this.handleLevelChange}>
            <SeverityClassLabel.Log/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('f')}
            name="f"
            onChange={this.handleLevelChange}>
            <SeverityClassLabel.FalsePositive/>
          </Checkbox>
        </FormGroup>

        <FirstResultGroup
          filter={filter}
          onChange={onFilterValueChange}/>

        <ResultsPerPageGroup
          filter={filter}
          onChange={onFilterValueChange}/>

        <SortByGroup
          filter={filter}
          fields={SORT_FIELDS}
          onSortOrderChange={onSortOrderChange}
          onSortByChange={onSortByChange}/>
      </Layout>
    );
  }
}

ResultsFilterDialogComponent.propTypes = DefaultFilterDialogPropTypes;

export default withFilterDialog(ResultsFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:
