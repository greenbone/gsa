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
import React, {useCallback, useState, useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {useLocation} from 'react-router-dom';

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

import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';
import useGmp from 'web/utils/useGmp';

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

const SENSOR_SCANNER_FILTER = Filter.fromString(
  'type=' + GREENBONE_SENSOR_SCANNER_TYPE,
);

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

const ReportImage = ({name, duration, scannerId, endDate, startDate}) => {
  const gmp = useGmp();
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
};

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

const PerformancePage = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const location = useLocation();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [timezone] = useUserTimezone();
  const sensorSelector = useSelector(scannerSelector);

  const end = date();

  const [endDate, setEndDate] = useState(end);
  const [startDate, setStartDate] = useState(() =>
    end.clone().subtract(1, 'day'),
  );
  const [reports, setReports] = useState([]);
  const [duration, setDuration] = useState('day');
  const [scannerId, setScannerId] = useState(0);

  const scanners = sensorSelector.getEntities(SENSOR_SCANNER_FILTER) ?? [];

  const loadSensorScanners = useCallback(() => {
    dispatch(loadScanners(gmp)(SENSOR_SCANNER_FILTER));
  }, [dispatch, gmp]);

  const handleStartEndChange = useCallback(
    ({startDate: newStartDate, endDate: newEndDate}) => {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDuration(undefined);

      renewSessionTimeout();
    },
    [renewSessionTimeout],
  );

  const handleDurationChange = useCallback(
    newDuration => {
      if (isDefined(newDuration)) {
        const newEnd = date().tz(timezone);
        const newStart = newEnd
          .clone()
          .subtract(DURATIONS[newDuration], 'seconds');

        setDuration(newDuration);
        setStartDate(newStart);
        setEndDate(newEnd);

        renewSessionTimeout();
      }
    },
    [renewSessionTimeout, timezone],
  );

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const {start, end, scanner} = location.query;

    gmp.performance.get().then(response => {
      setReports(response.data);
    });

    loadSensorScanners();

    if (isDefined(start) && isDefined(end)) {
      let newStartDate = date(start);

      if (!newStartDate.isValid()) {
        newStartDate = date();
      }

      let newEndDate = date(end);
      if (!newEndDate.isValid()) {
        newEndDate = date();
      }

      newEndDate.tz(timezone);
      newStartDate.tz(timezone);

      setDuration(undefined);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else {
      const newEndDate = date().tz(timezone);
      const newStartDate = newEndDate.clone().subtract(1, 'day');

      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }

    if (isDefined(scanner)) {
      setScannerId(scanner);
    }
  }, [gmp.performance, location.query, timezone, loadSensorScanners]);

  const handleSensorIdChange = useCallback(sensorId => {
    setScannerId(sensorId);
  }, []);

  const sensorId = selectSaveId(scanners, scannerId, 0);
  return (
    <React.Fragment>
      <PageTitle title={_('Performance')} />
      <Layout flex="column">
        <ToolBar onDurationChangeClick={handleDurationChange} />
        <Section
          img={<PerformanceIcon size="large" />}
          title={_('Performance')}
        >
          <StartEndTimeSelection
            endDate={endDate}
            timezone={timezone}
            startDate={startDate}
            onChanged={handleStartEndChange}
          />

          <FormGroup title={_('Report for Last')}>
            <Divider>
              <Selector
                value="hour"
                duration={duration}
                onClick={handleDurationChange}
              >
                {_('Hour')}
              </Selector>
              <Selector
                value="day"
                duration={duration}
                onClick={handleDurationChange}
              >
                {_('Day')}
              </Selector>
              <Selector
                value="week"
                duration={duration}
                onClick={handleDurationChange}
              >
                {_('Week')}
              </Selector>
              <Selector
                value="month"
                duration={duration}
                onClick={handleDurationChange}
              >
                {_('Month')}
              </Selector>
              <Selector
                value="year"
                duration={duration}
                onClick={handleDurationChange}
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
                onChange={handleSensorIdChange}
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
};

export default PerformancePage;

// vim: set ts=2 sw=2 tw=80:
