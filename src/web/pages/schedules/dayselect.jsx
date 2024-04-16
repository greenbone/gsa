/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

const DaySelect = ({value, ...props}) => {
  const [_] = useTranslation();

  const DAY_SELECT_ITEMS = [
    {
      label: _('Monday'),
      value: 'monday',
    },
    {
      label: _('Tuesday'),
      value: 'tuesday',
    },
    {
      label: _('Wednesday'),
      value: 'wednesday',
    },
    {
      label: _('Thursday'),
      value: 'thursday',
    },
    {
      label: _('Friday'),
      value: 'friday',
    },
    {
      label: _('Saturday'),
      value: 'saturday',
    },
    {
      label: _('Sunday'),
      value: 'sunday',
    },
  ];
  return <Select {...props} value={value} items={DAY_SELECT_ITEMS} />;
};

DaySelect.propTypes = {
  value: PropTypes.oneOf([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
};

export default DaySelect;

// vim: set ts=2 sw=2 tw=80:
