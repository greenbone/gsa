/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  TaskAutoDelete,
} from 'gmp/models/task';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Spinner from 'web/components/form/Spinner';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface AutoDeleteReportsGroupProps {
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  onChange?: (value: string | number, name: string) => void;
}

const AutoDeleteReportsGroup = ({
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData,
  onChange,
}: AutoDeleteReportsGroupProps) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Auto Delete Reports')}>
      <Radio
        checked={autoDelete !== AUTO_DELETE_KEEP}
        name="auto_delete"
        title={_('Do not automatically delete reports')}
        value={AUTO_DELETE_NO}
        onChange={
          onChange as ((value: string, name?: string) => void) | undefined
        }
      />
      <Row>
        <Radio
          checked={autoDelete === AUTO_DELETE_KEEP}
          name="auto_delete"
          title={_(
            'Automatically delete oldest reports but always keep newest',
          )}
          value="keep"
          onChange={
            onChange as ((value: string, name?: string) => void) | undefined
          }
        />
        <Spinner
          disabled={autoDelete !== AUTO_DELETE_KEEP}
          max={1200}
          min={2}
          name="auto_delete_data"
          type="int"
          value={autoDeleteData}
          onChange={
            onChange as ((value: number, name?: string) => void) | undefined
          }
        />
        <span>{_('reports')}</span>
      </Row>
    </FormGroup>
  );
};

export default AutoDeleteReportsGroup;
