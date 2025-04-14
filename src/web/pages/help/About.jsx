/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import GSA_VERSION from 'version';
import {HelpIcon} from 'web/components/icon';
import Img from 'web/components/img/Img';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import ExternalLink from 'web/components/link/ExternalLink';
import ProtocolDocLink from 'web/components/link/ProtocolDocLink';
import Section from 'web/components/section/Section';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
const StyledLayout = styled(Layout)`
  margin: 0 auto;
  max-width: 680px;
`;

const DivP = styled.div`
  margin-bottom: 10px;
`;

const About = ({gmp}) => (
  <React.Fragment>
    <PageTitle title={_('About GSA')} />
    <Layout flex="column">
      <Section img={<HelpIcon size="large" />} title={_('About GSA')}>
        <StyledLayout align="center" flex="column">
          <Img alt="GSA" src="greenbone_banner.png" width="100%" />
          <h1>Greenbone Security Assistant</h1>
          <h3>
            {isDefined(gmp.settings.vendorVersion)
              ? gmp.settings.vendorVersion
              : _('Version {{version}}', {version: GSA_VERSION})}
          </h3>
          <DivP>
            {_(
              'The Greenbone Security Assistant (GSA) is the web-based ' +
                'user interface of the Greenbone Community Edition.',
            )}
          </DivP>
          <DivP>
            {_(
              'GSA uses the Greenbone Management Protocol (GMP) to connect to' +
                'the database backend gvmd which makes an extensive feature ' +
                'set available, covering vulnerability scanning, vulnerability ' +
                'management, and related activities.',
            )}
          </DivP>
          <DivP>
            {_(
              'GSA adds various smart features and forms a powerful tool ' +
                'to manage and maintain a high resilience level of the IT ' +
                'infrastructures.',
            )}
          </DivP>
          <DivP>
            Copyright (C) 2017-2024 by&nbsp;
            <a
              href="https://www.greenbone.net"
              rel="noopener noreferrer"
              target="_blank"
            >
              Greenbone AG
            </a>
          </DivP>
          <DivP>
            {_(
              'License: GNU Affero General Public License version 3 or any later' +
                ' version',
            )}
            &nbsp;
            <ExternalLink to="https://www.gnu.org/licenses/agpl-3.0.en.html">
              {_('(full license text)')}
            </ExternalLink>
          </DivP>
          <DivP>
            {_(
              'This web application uses cookies to store session information' +
                '. The cookies are not stored on the server side hard disk ' +
                'and not submitted anywhere. They are lost when the session ' +
                'is closed or expired. The cookies are stored temporarily in ' +
                'your browser as well where you can examine the content.',
            )}
          </DivP>
          <DivP>
            {_('The GMP documentation is available ')}
            <ProtocolDocLink title={_('here')} />.
          </DivP>
        </StyledLayout>
      </Section>
    </Layout>
  </React.Fragment>
);

About.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(About);
