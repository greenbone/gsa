/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useSearchParams} from 'react-router';
import styled from 'styled-components';
import {
  DEFAULT_SENSOR_ID,
  type PerformanceReport as PerformanceReportModel,
} from 'gmp/commands/performance';
import date, {type Date} from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import {
  type default as Scanner,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import withClickHandler from 'web/components/form/withClickHandler';
import {PerformanceIcon, WizardIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Column from 'web/components/layout/Column';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import Section from 'web/components/section/Section';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import {
  type Duration,
  getDurationInSeconds,
} from 'web/pages/performance/durations';
import PerformanceReport from 'web/pages/performance/PerformanceReport';
import StartEndTimeSelection from 'web/pages/performance/StartEndTimeSelection';
import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';
import {getTimezone} from 'web/store/usersettings/selectors';
import {renderSelectItems} from 'web/utils/Render';

interface ToolBarProps {
  onDurationChangeClick: (duration: Duration) => void;
}

interface SelectorProps {
  $duration: Duration | undefined;
  value: Duration;
  name?: string;
}

const SENSOR_SCANNER_FILTER = Filter.fromString(
  `type=${GREENBONE_SENSOR_SCANNER_TYPE}`,
);

const ToolBar = ({onDurationChangeClick}: ToolBarProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="optimizing-the-appliance-performance"
        page="performance"
        size="small"
        title={_('Help: Performance')}
      />
      <IconMenu icon={<WizardIcon size="small" />}>
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

const Selector = withClickHandler<SelectorProps, Duration | undefined>({
  valueFunc: (_event, props) => props.value,
  nameFunc: (_event, props) => props.name,
})(styled.span<SelectorProps>`
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

const PerformancePage = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const [searchParams] = useSearchParams();
  const end = date();
  const start = end.clone().subtract(1, 'day');
  const scannerParam = searchParams.get('scanner');

  const [reports, setReports] = useState<PerformanceReportModel[]>([]);
  const [duration, setDuration] = useState<Duration | undefined>('day');
  const [sensorId, setSensorId] = useState(scannerParam ?? DEFAULT_SENSOR_ID);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const sensors = useShallowEqualSelector<unknown, Scanner[]>(state => {
    const scannerEntitiesSelector = scannerSelector(state);
    return scannerEntitiesSelector.getEntities(SENSOR_SCANNER_FILTER);
  });
  const timezone = useShallowEqualSelector<unknown, string>(getTimezone);
  const dispatch = useDispatch();

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
      const response = await gmp.performance.getAll({sensorId: saveSensorId});
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

  const handleDurationChange = (
    duration: Duration | undefined,
    _name?: string,
  ) => {
    if (isDefined(duration)) {
      const end = date().tz(timezone);
      const start = end
        .clone()
        .subtract(getDurationInSeconds(duration), 'seconds');
      setDuration(duration);
      setStartDate(start);
      setEndDate(end);
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
  };

  const handleScannerChange = (value: string) => {
    setSensorId(value);
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
                  items={renderSelectItems(
                    sensors as Array<{id: string; name: string}>,
                    DEFAULT_SENSOR_ID,
                  )}
                  name="sensorId"
                  value={saveSensorId}
                  onChange={handleScannerChange}
                />
              </FormGroup>
            )}

            {reports.map(report => (
              <PerformanceReport
                key={report.name}
                duration={duration}
                endDate={endDate}
                name={report.name}
                sensorId={saveSensorId}
                startDate={startDate}
              />
            ))}
          </Column>
        </Section>
      </Column>
    </>
  );
};

export default PerformancePage;
