/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/string/starts-with';

import React from 'react';

import _ from 'gmp/locale.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select2 from '../../components/form/select2.js';
import FormGroup from '../../components/form/formgroup.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Radio from '../../components/form/radio.js';

const EmailMethodPart = ({
    fromAddress,
    isTaskEvent,
    message,
    messageAttach,
    notice,
    noticeAttachFormat,
    noticeReportFormat,
    prefix,
    reportFormats,
    subject,
    toAddress,
    onChange,
  }, {capabilities}) => {

  const report_format_opts = render_options(
    reportFormats.filter(format => {
      return (isTaskEvent && format.content_type.startsWith('text/')) ||
        !isTaskEvent;
    })
  );
  return (
    <Layout flex="column" grow="1">

      <FormGroup title={_('To Address')}>
        <TextField
          grow="1"
          name={prefix + 'to_address'}
          value={toAddress}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('From Address')}>
        <TextField
          grow="1"
          name={prefix + 'from_address'}
          value={fromAddress}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('Subject')}>
        <TextField
          grow="1"
          name={prefix + 'subject'}
          size="30"
          maxLength="80"
          value={subject}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('Content')} flex="column">
        <Divider flex="column" grow="1">
          <Radio
            title={_('Simple Notice')}
            name={prefix + 'notice'}
            checked={notice === '1'}
            value="1"
            onChange={onChange}/>

          {capabilities.mayOp('get_report_formats') &&
            <Layout flex="column" box>
              <Divider>
                <Radio
                  name={prefix + 'notice'}
                  title={isTaskEvent ? _('Include report') :
                    _('Include list of resources with message:')}
                  checked={notice === '0'}
                  value="0"
                  onChange={onChange}>
                </Radio>
                {isTaskEvent &&
                  <Select2
                    name={prefix + 'notice_report_format'}
                    value={noticeReportFormat}
                    onChange={onChange}>
                    {report_format_opts}
                  </Select2>
                }
              </Divider>
              <TextArea
                name={prefix + 'message'}
                rows="8"
                cols="50"
                value={message}
                onChange={onChange}/>
            </Layout>
          }

          {capabilities.mayOp('get_report_formats') &&
            <Layout flex="column" box>
              <Layout flex box>
                <Radio
                  name={prefix + 'notice'}
                  title={isTaskEvent ? _('Attach report') :
                    _('Attach list of resources with message:')}
                  checked={notice === '2'}
                  value="2"
                  onChange={onChange}>
                </Radio>
                {isTaskEvent &&
                  <Select2
                    name={prefix + 'notice_attach_format'}
                    value={noticeAttachFormat}
                    onChange={onChange}>
                    {render_options(reportFormats)}
                  </Select2>
                }
              </Layout>
              <TextArea
                name={prefix + 'message_attach'}
                rows="8"
                cols="50"
                value={messageAttach}
                onChange={onChange}/>
            </Layout>
          }
        </Divider>
      </FormGroup>

    </Layout>
  );
};

EmailMethodPart.propTypes = {
  fromAddress: PropTypes.string.isRequired,
  isTaskEvent: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  messageAttach: PropTypes.string.isRequired,
  notice: PropTypes.string.isRequired,
  noticeAttachFormat: PropTypes.id,
  noticeReportFormat: PropTypes.id,
  prefix: PropTypes.string.isRequired,
  reportFormats: PropTypes.array,
  subject: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

EmailMethodPart.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withPrefix(EmailMethodPart);

// vim: set ts=2 sw=2 tw=80:
