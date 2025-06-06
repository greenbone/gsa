/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {ReccurenceFrequency} from 'gmp/models/event';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';

const TimeUnitSelect = props => {
  const [_] = useTranslation();
  const TIME_UNIT_ITEMS = [
    {value: ReccurenceFrequency.HOURLY, label: _('hour(s)')},
    {value: ReccurenceFrequency.DAILY, label: _('day(s)')},
    {value: ReccurenceFrequency.WEEKLY, label: _('week(s)')},
    {value: ReccurenceFrequency.MONTHLY, label: _('month(s)')},
    {value: ReccurenceFrequency.YEARLY, label: _('year(s)')},
  ];

  return <Select {...props} items={TIME_UNIT_ITEMS} />;
};

export default TimeUnitSelect;
