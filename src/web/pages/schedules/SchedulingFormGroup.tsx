/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TimePicker} from '@greenbone/ui-lib';
import type {Date} from 'gmp/models/date';
import Button from 'web/components/form/Button';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import {ComponentWithHoverCard} from 'web/components/hover-card';
import Row from 'web/components/layout/Row';
import ManualLink from 'web/components/link/ManualLink';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';

interface SchedulingFormGroupProps {
  startDate: Date;
  startTime: string;
  handleStartDateChange: (newDate: Date, name: string) => void;
  handleTimeChange: (selectedTime: string, type: string) => void;
  handleNowButtonClick: () => void;
}

const SchedulingFormGroup = ({
  startDate,
  startTime,
  handleStartDateChange,
  handleTimeChange,
  handleNowButtonClick,
}: SchedulingFormGroupProps) => {
  const [_] = useTranslation();
  const features = useFeatures();

  const formGroup = (
    <FormGroup title={_('Scheduling')}>
      <Row align={'end'} flex="row" gap={'lg'}>
        <DatePicker
          label={_('Start Date')}
          name="startDate"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <TimePicker
          label={_('Start Time')}
          name="startDate"
          value={startTime}
          onChange={newStartTime => handleTimeChange(newStartTime, 'startTime')}
        />
        <Button title={_('Now')} onClick={handleNowButtonClick} />
      </Row>
    </FormGroup>
  );

  if (!features.featureEnabled('ENABLE_CONTAINER_SCANNING')) {
    return formGroup;
  }

  return (
    <ComponentWithHoverCard
      dataTestId="scheduling-options-info"
      helpAriaLabel={_('More information about scheduling options')}
      helpContent={
        <>
          {_(
            'Please consider enabling "Time synchronization" if the scans are not starting at the expected time.',
          )}
          <div>
            <ManualLink
              anchor="configuring-the-time-synchronization"
              page="managing-gos"
            >
              {_('Learn more')}
            </ManualLink>
          </div>
        </>
      }
      slot={formGroup}
    />
  );
};

export default SchedulingFormGroup;
