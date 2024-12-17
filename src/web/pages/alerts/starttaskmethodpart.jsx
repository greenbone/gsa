/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const StartTaskMethodPart = ({prefix, tasks, startTaskTask, onChange}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Start Task')}>
      <Select
        items={renderSelectItems(tasks)}
        name={prefix + 'start_task_task'}
        value={startTaskTask}
        onChange={onChange}
      />
    </FormGroup>
  );
};

StartTaskMethodPart.propTypes = {
  prefix: PropTypes.string,
  startTaskTask: PropTypes.id,
  tasks: PropTypes.array,
  onChange: PropTypes.func,
};

export default withPrefix(StartTaskMethodPart);

// vim: set ts=2 sw=2 tw=80:
