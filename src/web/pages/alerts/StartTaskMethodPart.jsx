/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
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
