/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DEFAULT_SENSOR_ID, PerformanceReport} from 'gmp/commands/performance';
import {UrlParams} from 'gmp/http/utils';
import date, {Date} from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useSearchParams} from 'react-router';
import styled from 'styled-components';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import withClickHandler from 'web/components/form/withClickHandler';
import {PerformanceIcon, WizardIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Column from 'web/components/layout/Column';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import LinkTarget from 'web/components/link/Target';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import Section from 'web/components/section/Section';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import StartEndTimeSelection from 'web/pages/performance/StartEndTimeSelection';
import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getTimezone} from 'web/store/usersettings/selectors';
import {renderSelectItems} from 'web/utils/Render';

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
} as const;

const SENSOR_SCANNER_FILTER = Filter.fromString(
  `type=${GREENBONE_SENSOR_SCANNER_TYPE}`,
);

type Duration = keyof typeof DURATIONS;

interface ToolBarProps {
  onDurationChangeClick: (duration: Duration) => void;
}

const ToolBar = ({onDurationChangeClick}: ToolBarProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      {/* @ts-expect-error*/}
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

interface ReportImageProps {
  name: string;
  duration?: Duration;
  sensorId?: string;
  endDate: Date;
  startDate: Date;
}

interface ReportUrlParams extends UrlParams {
  slave_id?: string;
  token?: string;
  duration?: string;
  start_time?: string;
  end_time?: string;
}

const ReportImage = ({
  name,
  duration,
  sensorId,
  endDate,
  startDate,
}: ReportImageProps) => {
  const gmp = useGmp();
  const params: ReportUrlParams = {
    slave_id: sensorId,
    token: gmp.settings.token,
  };

  if (isDefined(duration)) {
    params.duration = String(DURATIONS[duration]);
  } else {
    params.start_time = startDate.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    params.end_time = endDate.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  }
  const url = gmp.buildUrl(`system_report/${name}/report.`, params);
  return <img alt="" src={url} />;
};

const Selector = withClickHandler()(styled.span`
  ${props => {
    // @ts-expect-error
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

const PerformancePage = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const [searchParams] = useSearchParams();
  const end = date();
  const start = end.clone().subtract(1, 'day');
  const scannerParam = searchParams.get('scanner');

  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [duration, setDuration] = useState<Duration | undefined>('day');
  const [sensorId, setSensorId] = useState(scannerParam ?? DEFAULT_SENSOR_ID);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const scannerEntitiesSelector = useShallowEqualSelector(scannerSelector);
  const timezone = useShallowEqualSelector(getTimezone);
  const sensors = scannerEntitiesSelector.getEntities(SENSOR_SCANNER_FILTER);
  const dispatch = useDispatch();
  // @ts-expect-error
  const handleInteraction = () => dispatch(renewSessionTimeout(gmp)());
  const fetchScanners = useCallback(
    // @ts-expect-error
    () => dispatch(loadScanners(gmp)(SENSOR_SCANNER_FILTER)),
    [dispatch, gmp],
  );

  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');
  const saveSensorId = selectSaveId(sensors, sensorId, DEFAULT_SENSOR_ID);

  useEffect(() => {
    fetchScanners();
  }, [fetchScanners]);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await gmp.performance.get({sensorId: saveSensorId});
      setReports(response.data);
    };
    void fetchReports();
  }, [gmp, saveSensorId]);

  useEffect(() => {
    if (isDefined(startParam) && isDefined(endParam)) {
      let startDate = date(startParam);

      if (!startDate.isValid()) {
        startDate = date().subtract(1, 'day');
      }

      let endDate = date(endParam);
      if (!endDate.isValid()) {
        endDate = date();
      }

      endDate.tz(timezone);
      startDate.tz(timezone);

      setDuration(undefined);
      setStartDate(startDate);
      setEndDate(endDate);
    } else {
      const endDate = date().tz(timezone);
      const startDate = endDate.clone().subtract(1, 'day');

      setEndDate(endDate);
      setStartDate(startDate);
    }
  }, [startParam, endParam, timezone]);

  const handleDurationChange = (duration: Duration | undefined) => {
    if (isDefined(duration)) {
      const end = date().tz(timezone);
      const start = end.clone().subtract(DURATIONS[duration], 'seconds');
      setDuration(duration);
      setStartDate(start);
      setEndDate(end);

      handleInteraction();
    }
  };

  const handleStartEndChange = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {
    setEndDate(endDate);
    setStartDate(startDate);
    setDuration(undefined);

    handleInteraction();
  };

  const handleScannerChange = (value: string) => {
    setSensorId(value);
    handleInteraction();
  };

  return (
    <>
      <PageTitle title={_('Performance')} />
      <Column>
        <ToolBar onDurationChangeClick={handleDurationChange} />
        <Section
          img={<PerformanceIcon size="large" />}
          title={_('Performance')}
        >
          <Column>
            <StartEndTimeSelection
              endDate={endDate}
              startDate={startDate}
              timezone={timezone}
              onChanged={handleStartEndChange}
            />

            <FormGroup direction="row" title={_('Report for Last')}>
              <Selector
                $duration={duration}
                value="hour"
                onClick={handleDurationChange}
              >
                {_('Hour')}
              </Selector>
              <Selector
                $duration={duration}
                value="day"
                onClick={handleDurationChange}
              >
                {_('Day')}
              </Selector>
              <Selector
                $duration={duration}
                value="week"
                onClick={handleDurationChange}
              >
                {_('Week')}
              </Selector>
              <Selector
                $duration={duration}
                value="month"
                onClick={handleDurationChange}
              >
                {_('Month')}
              </Selector>
              <Selector
                $duration={duration}
                value="year"
                onClick={handleDurationChange}
              >
                {_('Year')}
              </Selector>
            </FormGroup>

            {gmp.settings.enableGreenboneSensor && (
              <FormGroup title={_('Report for Greenbone Sensor')}>
                <Select
                  // @ts-expect-error
                  items={renderSelectItems(sensors, DEFAULT_SENSOR_ID)}
                  name="sensorId"
                  value={saveSensorId}
                  onChange={handleScannerChange}
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
                  sensorId={saveSensorId}
                  startDate={startDate}
                />
              </div>
            ))}
          </Column>
        </Section>
      </Column>
    </>
  );
};

export default PerformancePage;
