/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import date from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import withClickHandler from 'web/components/form/withClickHandler';
import ManualIcon from 'web/components/icon/ManualIcon';
import PerformanceIcon from 'web/components/icon/PerformanceIcon';
import WizardIcon from 'web/components/icon/WizardIcon';
import Column from 'web/components/layout/Column';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import LinkTarget from 'web/components/link/Target';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import Section from 'web/components/section/Section';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import StartEndTimeSelection from 'web/pages/performance/StartEndTimeSelection';
import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getTimezone} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import {withRouter} from 'web/utils/withRouter';


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
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="optimizing-the-appliance-performance"
        page="performance"
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
    if (props.value !== props.$duration) {
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
    const {gmp, timezone, searchParams} = this.props;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const scanner = searchParams.get('scanner');

    gmp.performance.get().then(response => {
      this.setState({reports: response.data});
    });

    this.props.loadScanners();

    if (isDefined(start) && isDefined(end)) {
      let startDate = date(start);

      if (!startDate.isValid()) {
        startDate = date().subtract(1, 'day');
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
        <Column>
          <ToolBar onDurationChangeClick={this.handleDurationChange} />
          <Section
            img={<PerformanceIcon size="large" />}
            title={_('Performance')}
          >
            <Column>
              <StartEndTimeSelection
                endDate={endDate}
                startDate={startDate}
                timezone={this.props.timezone}
                onChanged={this.handleStartEndChange}
              />

              <FormGroup direction="row" title={_('Report for Last')}>
                <Selector
                  $duration={duration}
                  value="hour"
                  onClick={this.handleDurationChange}
                >
                  {_('Hour')}
                </Selector>
                <Selector
                  $duration={duration}
                  value="day"
                  onClick={this.handleDurationChange}
                >
                  {_('Day')}
                </Selector>
                <Selector
                  $duration={duration}
                  value="week"
                  onClick={this.handleDurationChange}
                >
                  {_('Week')}
                </Selector>
                <Selector
                  $duration={duration}
                  value="month"
                  onClick={this.handleDurationChange}
                >
                  {_('Month')}
                </Selector>
                <Selector
                  $duration={duration}
                  value="year"
                  onClick={this.handleDurationChange}
                >
                  {_('Year')}
                </Selector>
              </FormGroup>

              {gmp.settings.enableGreenboneSensor && (
                <FormGroup title={_('Report for Greenbone Sensor')}>
                  <Select
                    items={renderSelectItems(scanners, 0)}
                    name="scannerId"
                    value={sensorId}
                    onChange={this.handleValueChange}
                  />
                </FormGroup>
              )}

              {reports.map(report => (
                <div key={report.name}>
                  <LinkTarget id={report.name} />
                  <h2>{report.title}</h2>
                  <ReportImage
                    duration={duration}
                    endDate={endDate}
                    name={report.name}
                    scannerId={sensorId}
                    startDate={startDate}
                  />
                </div>
              ))}
            </Column>
          </Section>
        </Column>
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
  searchParams: PropTypes.object,
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
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(PerformancePage);
