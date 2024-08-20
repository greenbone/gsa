/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  isTaskEvent,
} from 'gmp/models/alert';

import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';

import Row from 'web/components/layout/row';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import useTranslation from 'web/hooks/useTranslation';

const TaskEventPart = ({prefix, event, status, onChange, onEventChange}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        title={_('Task run status changed to')}
        name="event"
        value={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        checked={isTaskEvent(event)}
        onChange={onEventChange}
      />
      <Select
        grow="1"
        disabled={!isTaskEvent(event)}
        items={[
          {
            value: 'Done',
            label: _('Done'),
          },
          {
            value: 'New',
            label: _('New'),
          },
          {
            value: 'Requested',
            label: _('Requested'),
          },
          {
            value: 'Running',
            label: _('Running'),
          },
          {
            value: 'Stop Requested',
            label: _('Stop Requested'),
          },
          {
            value: 'Stopped',
            label: _('Stopped'),
          },
        ]}
        name={prefix + 'status'}
        value={status}
        onChange={onChange}
      />
    </Row>
  );
};

TaskEventPart.propTypes = {
  event: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  status: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onEventChange: PropTypes.func,
};

export default withPrefix(TaskEventPart);

// vim: set ts=2 sw=2 tw=80:
