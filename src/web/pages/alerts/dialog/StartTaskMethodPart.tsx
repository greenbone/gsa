/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface StartTaskMethodPartProps {
  prefix?: string;
  tasks?: Task[];
  startTaskTask?: string;
  onChange: (value: string, name?: string) => void;
}

const StartTaskMethodPart = ({
  prefix: initialPrefix,
  tasks,
  startTaskTask,
  onChange,
}: StartTaskMethodPartProps) => {
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  return (
    <FormGroup>
      <Select
        items={renderSelectItems(tasks as RenderSelectItemProps[])}
        label={_('Start Task')}
        name={prefix('start_task_task')}
        value={startTaskTask}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default StartTaskMethodPart;
