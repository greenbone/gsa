/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import Layout from '../layout.js';
import FilterDialog from '../filterdialog.js';
import {LabelHigh, LabelMedium, LabelLow, LabelLog, LabelFalsePositive
} from '../severityclasslabels.js';

import FormGroup from '../form/formgroup.js';
import Checkbox from '../form/checkbox.js';
import Radio from '../form/radio.js';

const SORT_FIELDS = [
  ['vulnerability', _('Vulnerability')],
  ['solution_type', _('Solution type')],
  ['severity', _('Severity')],
  ['qod', _('QoD')],
  ['host', _('Host')],
  ['location', _('Location')],
  ['created', _('Created')],
];


export class ResultsFilterDialog extends FilterDialog {

  constructor(props) {
    super(props);

    this.handleLevelChange = this.handleLevelChange.bind(this);
  }

  getSortFields() {
    return SORT_FIELDS;
  }

  handleLevelChange(value, level) {
    let {filter} = this.state;
    let levels = filter.get('levels');
    if (!levels) {
      levels = '';
    }

    if (value && !levels.includes(level)) {
      levels += level;
      this.onFilterValueChange(levels, 'levels');
    }
    else if (!value && level.includes(level)) {
      levels = levels.replace(level, '');
      this.onFilterValueChange(levels, 'levels');
    }
  }

  renderContent() {
    let {filter} = this.state;
    let autofp = filter.get('autofp');
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    return (
      <Layout flex="column">
        {this.renderFilter()}
        {this.renderApplyOverrides()}
        <FormGroup title={_('Auto-FP')} flex>
          <Checkbox name="autofp"
            checkedValue="1" uncheckedValue="0"
            checked={autofp >= 1}
            title={_('Trust vendor security updates')}
            onChange={this.onFilterIntValueChange}/>
          <Layout flex>
            <Radio
              className="inline"
              name="autofp"
              value="1"
              disabled={autofp === 0}
              checked={autofp === 1}
              title={_('Full CVE match')}
              onChange={this.handleIntValueChange}/>
            <Radio
              className="inline"
              name="autofp"
              value="2"
              disabled={autofp === 0}
              checked={autofp === 2}
              title={_('Partial CVE match')}
              onChange={this.handleIntValueChange}/>
          </Layout>
        </FormGroup>
        {this.renderQoD()}
        <FormGroup title={_('Severity (Class)')} flex>
          <Layout flex>
            <Checkbox
              checked={levels.includes('h')}
              className="inline"
              name="h"
              onChange={this.handleLevelChange}>
              <LabelHigh/>
            </Checkbox>
            <Checkbox
              checked={levels.includes('m')}
              className="inline"
              name="m"
              onChange={this.handleLevelChange}>
              <LabelMedium/>
            </Checkbox>
            <Checkbox
              checked={levels.includes('l')}
              className="inline"
              name="l"
              onChange={this.handleLevelChange}>
              <LabelLow/>
            </Checkbox>
            <Checkbox
              checked={levels.includes('g')}
              className="inline"
              name="g"
              onChange={this.handleLevelChange}>
              <LabelLog/>
            </Checkbox>
            <Checkbox
              checked={levels.includes('f')}
              className="inline"
              name="f"
              onChange={this.handleLevelChange}>
              <LabelFalsePositive/>
            </Checkbox>
          </Layout>
        </FormGroup>
        {this.renderFirstResult()}
        {this.renderResultsPerPage()}
        {this.renderSortBy()}
      </Layout>
    );
  }
}

export default ResultsFilterDialog;

// vim: set ts=2 sw=2 tw=80:
