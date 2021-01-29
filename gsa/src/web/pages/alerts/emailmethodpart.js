/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {
  isTaskEvent,
  isSecinfoEvent,
  EMAIL_NOTICE_INCLUDE,
  EMAIL_NOTICE_SIMPLE,
  EMAIL_NOTICE_ATTACH,
} from 'gmp/models/alert';
import {
  EMAIL_CREDENTIAL_TYPES,
  email_credential_filter,
} from 'gmp/models/credential';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withPrefix from 'web/utils/withPrefix';

const EmailMethodPart = ({
  capabilities,
  credentials = [],
  fromAddress,
  event,
  message,
  messageAttach,
  notice,
  noticeAttachFormat,
  noticeReportFormat,
  prefix,
  recipientCredential,
  reportFormats = [],
  subject,
  toAddress,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const taskEvent = isTaskEvent(event);
  const secinfoEvent = isSecinfoEvent(event);
  const reportFormatItems = renderSelectItems(
    reportFormats.filter(
      format =>
        (taskEvent && format.content_type.startsWith('text/')) || !taskEvent,
    ),
  );
  credentials = credentials.filter(email_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('To Address')}>
        <TextField
          grow="1"
          name={prefix + 'to_address'}
          value={toAddress}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('From Address')}>
        <TextField
          grow="1"
          name={prefix + 'from_address'}
          value={fromAddress}
          onChange={onChange}
        />
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup title={_('Subject')}>
          <TextField
            grow="1"
            name={prefix + 'subject'}
            size="30"
            value={subject}
            onChange={onChange}
          />
        </FormGroup>
      )}

      <FormGroup title={_('Email Encryption')}>
        <IconDivider>
          <Select
            name={prefix + 'recipient_credential'}
            value={recipientCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onCredentialChange}
          />
          <NewIcon
            size="small"
            value={EMAIL_CREDENTIAL_TYPES}
            title={_('Create a credential')}
            onClick={onNewCredentialClick}
          />
        </IconDivider>
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup title={_('Content')} flex="column">
          <Divider flex="column" grow="1">
            <Radio
              title={_('Simple Notice')}
              name={prefix + 'notice'}
              checked={notice === EMAIL_NOTICE_SIMPLE}
              value="1"
              onChange={onChange}
            />

            {capabilities.mayOp('get_report_formats') && (
              <Layout flex="column">
                <Divider>
                  <Radio
                    name={prefix + 'notice'}
                    title={
                      taskEvent
                        ? _('Include report')
                        : _('Include list of resources with message:')
                    }
                    checked={notice === EMAIL_NOTICE_INCLUDE}
                    value="0"
                    onChange={onChange}
                  />
                  {taskEvent && (
                    <Select
                      disabled={notice !== EMAIL_NOTICE_INCLUDE}
                      name={prefix + 'notice_report_format'}
                      value={noticeReportFormat}
                      items={reportFormatItems}
                      onChange={onChange}
                    />
                  )}
                </Divider>
                <TextArea
                  disabled={notice !== EMAIL_NOTICE_INCLUDE}
                  name={prefix + 'message'}
                  rows="8"
                  cols="50"
                  title={
                    notice === EMAIL_NOTICE_INCLUDE
                      ? undefined
                      : _('Activate the "include" option to make changes here.')
                  }
                  value={message}
                  onChange={onChange}
                />
              </Layout>
            )}

            {capabilities.mayOp('get_report_formats') && (
              <Layout flex="column">
                <Layout>
                  <Divider>
                    <Radio
                      name={prefix + 'notice'}
                      title={
                        taskEvent
                          ? _('Attach report')
                          : _('Attach list of resources with message:')
                      }
                      checked={notice === EMAIL_NOTICE_ATTACH}
                      value="2"
                      onChange={onChange}
                    />
                    {taskEvent && (
                      <Select
                        disabled={notice !== EMAIL_NOTICE_ATTACH}
                        name={prefix + 'notice_attach_format'}
                        value={noticeAttachFormat}
                        items={renderSelectItems(reportFormats)}
                        onChange={onChange}
                      />
                    )}
                  </Divider>
                </Layout>
                <TextArea
                  disabled={notice !== EMAIL_NOTICE_ATTACH}
                  name={prefix + 'message_attach'}
                  rows="8"
                  cols="50"
                  title={
                    notice === EMAIL_NOTICE_ATTACH
                      ? undefined
                      : _('Activate the "attach" option to allow changes here.')
                  }
                  value={messageAttach}
                  onChange={onChange}
                />
              </Layout>
            )}
          </Divider>
        </FormGroup>
      )}
    </Layout>
  );
};

EmailMethodPart.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  credentials: PropTypes.array,
  event: PropTypes.string.isRequired,
  fromAddress: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  messageAttach: PropTypes.string.isRequired,
  notice: PropTypes.string.isRequired,
  noticeAttachFormat: PropTypes.id,
  noticeReportFormat: PropTypes.id,
  prefix: PropTypes.string.isRequired,
  recipientCredential: PropTypes.id,
  reportFormats: PropTypes.array,
  subject: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onCredentialChange: PropTypes.func,
  onNewCredentialClick: PropTypes.func,
};

export default compose(withCapabilities, withPrefix)(EmailMethodPart);

// vim: set ts=2 sw=2 tw=80:
