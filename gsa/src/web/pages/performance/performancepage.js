/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import withClickHandler from 'web/components/form/withClickHandler';

import ManualIcon from 'web/components/icon/manualicon';
import PerformanceIcon from 'web/components/icon/performanceicon';
import WizardIcon from 'web/components/icon/wizardicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import LinkTarget from 'web/components/link/target';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import Section from 'web/components/section/section';

import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getTimezone} from 'web/store/usersettings/selectors';
import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import {renderSelectItems} from 'web/utils/render';

import StartEndTimeSelection from './startendtimeselection';

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

const ToolBar = ({onDurationChangeClick}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="performance"
        anchor="optimizing-the-appliance-performance"
        size="small"
        title={_('Help: Performance')}
      />
      <IconMenu icon={<WizardIcon />} size="small">
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

const ReportImage = withGmp(
  ({gmp, name, duration, scannerId, endDate, startDate}) => {
    const params = {
      slave_id: scannerId,
      token: gmp.settings.token,
    };

    if (isDefined(duration)) {
      params.duration = DURATIONS[duration];
    } else {
      params.start_time = startDate.toISOString();
      params.end_time = endDate.toISOString();
    }
    const url = gmp.buildUrl('system_report/' + name + '/report.', params);
    return <img alt="" src={url} />;
  },
);

ReportImage.propTypes = {
  duration: PropTypes.string,
  endDate: PropTypes.date,
  name: PropTypes.string.isRequired,
  scannerId: PropTypes.idOrZero.isRequired,
  startDate: PropTypes.date,
};

const Selector = withClickHandler()(styled.span`
  ${props => {
    if (props.value !== props.duration) {
      return {
        color: 'blue',
        textDecoration: 'underline',
        cursor: 'pointer',
      };
    }
    return {};
  }}
`);

class PerformancePage extends React.Component {
  constructor(...args) {
    super(...args);

    const end = date();
    const start = end.clone().subtract(1, 'day');

    this.state = {
      reports: [],
      duration: 'day',
      scannerId: 0,
      startDate: start,
      endDate: end,
      scanners: [],
    };

    this.handleDurationChange = this.handleDurationChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleStartEndChange = this.handleStartEndChange.bind(this);
  }

  componentDidMount() {
    const {start, end, scanner} = this.props.location.query;
    const {gmp, timezone} = this.props;

    gmp.performance.get().then(response => {
      this.setState({reports: response.data});
    });

    this.props.loadScanners();

    if (isDefined(start) && isDefined(end)) {
      let startDate = date(start);

      if (!startDate.isValid()) {
        startDate = date();
      }

      let endDate = date(end);
      if (!endDate.isValid()) {
        endDate = date();
      }

      endDate.tz(timezone);
      startDate.tz(timezone);

      this.setState({
        duration: undefined,
        endDate,
        startDate,
      });
    } else {
      const endDate = date().tz(timezone);
      const startDate = endDate.clone().subtract(1, 'day');
      this.setState({
        endDate,
        startDate,
      });
    }

    if (isDefined(scanner)) {
      this.setState({
        scannerId: scanner,
      });
    }
  }

  handleDurationChange(duration) {
    if (isDefined(duration)) {
      const {timezone} = this.props;
      const end = date().tz(timezone);
      const start = end.clone().subtract(DURATIONS[duration], 'seconds');

      this.setState({
        duration,
        startDate: start,
        endDate: end,
      });

      this.handleInteraction();
    }
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleStartEndChange({startDate, endDate}) {
    this.setState({
      endDate,
      startDate,
      duration: undefined,
    });

    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {scanners = [], gmp} = this.props;
    const {duration, reports, scannerId, startDate, endDate} = this.state;
    const sensorId = selectSaveId(scanners, scannerId, 0);
    return (
      <React.Fragment>
        <PageTitle title={_('Performance')} />
        <Layout flex="column">
          <ToolBar onDurationChangeClick={this.handleDurationChange} />
          <Section
            img={<PerformanceIcon size="large" />}
            title={_('Performance')}
          >
            <StartEndTimeSelection
              endDate={endDate}
              timezone={this.props.timezone}
              startDate={startDate}
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

            {gmp.settings.enableGreenboneSensor && (
              <FormGroup title={_('Report for Greenbone Sensor')}>
                <Select
                  name="scannerId"
                  value={sensorId}
                  items={renderSelectItems(scanners, 0)}
                  onChange={this.handleValueChange}
                />
              </FormGroup>
            )}

            {reports.map(report => (
              <div key={report.name}>
                <LinkTarget id={report.name} />
                <h2>{report.title}</h2>
                <ReportImage
                  name={report.name}
                  duration={duration}
                  scannerId={sensorId}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            ))}
          </Section>
        </Layout>
      </React.Fragment>
    );
  }
}

PerformancePage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  loadScanners: PropTypes.func.isRequired,
  scanners: PropTypes.arrayOf(PropTypes.model),
  timezone: PropTypes.string.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const SENSOR_SCANNER_FILTER = Filter.fromString(
  'type=' + GREENBONE_SENSOR_SCANNER_TYPE,
);

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
    loadScanners: () => dispatch(loadScanners(gmp)(SENSOR_SCANNER_FILTER)),
  };
};

const mapStateToProps = rootState => {
  const select = scannerSelector(rootState);
  return {
    scanners: select.getEntities(SENSOR_SCANNER_FILTER),
    timezone: getTimezone(rootState),
  };
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(PerformancePage);

// vim: set ts=2 sw=2 tw=80:
