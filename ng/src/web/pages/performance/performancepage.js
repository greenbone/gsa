/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import moment from 'moment';

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import {SLAVE_SCANNER_TYPE} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';
import {render_options} from '../../utils/render.js';

import FormGroup from '../../components/form/formgroup.js';
import Select from '../../components/form/select.js';
import withClickHandler from '../../components/form/withClickHandler.js';

import ManualIcon from '../../components/icon/manualicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import LinkTarget from '../../components/link/target.js';

import IconMenu from '../../components/menu/iconmenu.js';
import MenuEntry from '../../components/menu/menuentry.js';

import Section from '../../components/section/section.js';

import StartEndTimeSelection from './startendtimeselection.js';

const DURATION_HOUR = 60 * 60;
const DURATION_DAY = DURATION_HOUR * 24;
const DURATION_WEEK = DURATION_DAY * 7;
const DURATION_MONTH = DURATION_DAY * 31;
const DURATION_YEAR = DURATION_DAY * 365;

const DURATIONS = {
  hour: DURATION_HOUR,
  day: DURATION_DAY,
  week: DURATION_WEEK,
  month: DURATION_MONTH,
  year: DURATION_YEAR,
};

const ToolBar = ({
  onDurationChangeClick,
}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="performance"
        anchor="appliance-performance"
        size="medium"
        title={_('Help: Performance')}
      />
      <IconMenu
        img="wizard.svg"
        size="medium"
      >
        <MenuEntry
          title={_('Report for Last Hour')}
          value="hour"
          onClick={onDurationChangeClick}
        />
        <MenuEntry
          title={_('Report for Last Day')}
          value="day"
          onClick={onDurationChangeClick}
        />
        <MenuEntry
          title={_('Report for Last Week')}
          value="week"
          onClick={onDurationChangeClick}
        />
        <MenuEntry
          title={_('Report for Last Month')}
          value="month"
          onClick={onDurationChangeClick}
        />
        <MenuEntry
          title={_('Report for Last Year')}
          value="year"
          onClick={onDurationChangeClick}
        />
      </IconMenu>
    </IconDivider>
  );
};

ToolBar.propTypes = {
  onDurationChangeClick: PropTypes.func.isRequired,
};

const ReportImage = ({
  gmp,
  name,
  duration,
  slaveId,
  endDate,
  endHour,
  endMinute,
  startDate,
  startHour,
  startMinute,
}) => {
  const params = {
    slaveId,
    token: gmp.token,
  };

  if (is_defined(duration)) {
    params.duration = DURATIONS[duration];
  }
  else {
    params.start_year = startDate.year();
    params.start_month = startDate.month() + 1; // month is zero indexed
    params.start_day = startDate.date();
    params.start_hour = startHour;
    params.start_minute = startMinute;
    params.end_year = endDate.year();
    params.end_month = endDate.month() + 1;
    params.end_day = endDate.date();
    params.end_hour = endHour;
    params.end_minute = endMinute;
  }
  const url = gmp.buildUrl('system_report/' + name + '/report.', params);
  return (
    <img
      alt=""
      src={url}
    />
  );
};

ReportImage.propTypes = {
  duration: PropTypes.string,
  endDate: PropTypes.momentDate,
  endHour: PropTypes.number,
  endMinute: PropTypes.number,
  gmp: PropTypes.gmp.isRequired,
  name: PropTypes.string.isRequired,
  slaveId: PropTypes.idOrZero.isRequired,
  startDate: PropTypes.momentDate,
  startHour: PropTypes.number,
  startMinute: PropTypes.number,
};

const Selector = withClickHandler()(glamorous.span(
({value, duration}) => {
  if (value !== duration) {
    return {
      color: 'blue',
      textDecoration: 'underline',
      cursor: 'pointer',
    };
  }
  return {};
}));


class PerformancePage extends React.Component {

  constructor(...args) {
    super(...args);

    const end = moment();
    const start = end.clone().subtract(1, 'day');

    this.state = {
      reports: [],
      duration: 'day',
      slave_id: 0,
      start_date: start,
      start_hour: start.hour(),
      start_minute: start.minute(),
      end_date: end,
      end_hour: end.hour(),
      end_minute: end.minute(),
      scanners: [],
    };

    this.handleDurationChange = this.handleDurationChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleStartEndChange = this.handleStartEndChange.bind(this);
  }

  componentDidMount() {
    const {gmp} = this.props;

    gmp.performance.get().then(response => {
      this.setState({reports: response.data});
    });

    gmp.scanners.getAll({filter: 'type=' + SLAVE_SCANNER_TYPE})
      .then(response => {
        this.setState({scanners: response.data});
      });
  }

  handleDurationChange(duration) {
    if (is_defined(duration)) {
      const end = moment();
      const start = end.clone().subtract(DURATIONS[duration], 'seconds');

      this.setState({
        duration,
        start_date: start,
        start_hour: start.hour(),
        start_minute: start.minute(),
        end_date: end,
        end_hour: end.hour(),
        end_minute: end.minute(),
      });
    }
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleStartEndChange(data) {
    this.setState({
      ...data,
      duration: undefined,
    });
  }

  render() {
    const {
      duration,
      reports,
      slave_id,
      start_date,
      start_hour,
      start_minute,
      end_date,
      end_hour,
      end_minute,
      scanners,
    } = this.state;
    const {gmp} = this.props;
    return (
      <Layout
        flex="column"
      >
        <ToolBar onDurationChangeClick={this.handleDurationChange} />
        <Section
          img="performance.svg"
          title={_('Performance')}
        >
          <StartEndTimeSelection
            startDate={start_date}
            startHour={start_hour}
            startMinute={start_minute}
            endDate={end_date}
            endMinute={end_minute}
            endHour={end_hour}
            onChanged={this.handleStartEndChange}
          />

          <FormGroup title={_('Report for Last')}>
            <Divider>
              <Selector
                value="hour"
                duration={duration}
                onClick={this.handleDurationChange}
              >
                {_('Hour')}
              </Selector>
              <Selector
                value="day"
                duration={duration}
                onClick={this.handleDurationChange}
              >
                {_('Day')}
              </Selector>
              <Selector
                value="week"
                duration={duration}
                onClick={this.handleDurationChange}
              >
                {_('Week')}
              </Selector>
              <Selector
                value="month"
                duration={duration}
                onClick={this.handleDurationChange}
              >
                {_('Month')}
              </Selector>
              <Selector
                value="year"
                duration={duration}
                onClick={this.handleDurationChange}
              >
                {_('Year')}
              </Selector>
            </Divider>
          </FormGroup>

          <FormGroup title={_('Report for GMP Scanner')}>
            <Select
              name="slave_id"
              value={slave_id}
              onChange={this.handleValueChange}
            >
              {render_options(scanners, 0)}
            </Select>
          </FormGroup>

          {reports.map(report => (
            <div key={report.name}>
              <LinkTarget id={report.name}/>
              <h2>{report.title}</h2>
              <ReportImage
                name={report.name}
                duration={duration}
                slaveId={slave_id}
                startDate={start_date}
                startHour={start_hour}
                startMinute={start_minute}
                endDate={end_date}
                endHour={end_hour}
                endMinute={end_minute}
                gmp={gmp}
              />
            </div>
          ))}
        </Section>
      </Layout>
    );
  }
}

PerformancePage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(PerformancePage);

// vim: set ts=2 sw=2 tw=80:
