/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  isTaskEvent,
} from 'gmp/models/alert';
import React from 'react';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import Row from 'web/components/layout/row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

const TaskEventPart = ({prefix, event, status, onChange, onEventChange}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        checked={isTaskEvent(event)}
        name="event"
        title={_('Task run status changed to')}
        value={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        onChange={onEventChange}
      />
      <Select
        disabled={!isTaskEvent(event)}
        grow="1"
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
