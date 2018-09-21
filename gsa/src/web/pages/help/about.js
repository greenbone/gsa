/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import ExternalLink from 'web/components/link/externallink';
import ProtocolDocLink from 'web/components/link/protocoldoclink';
import Img from 'web/components/img/img';

import Layout from 'web/components/layout/layout';
import Section from 'web/components/section/section';

const StyledLayout = styled(Layout)`
  margin: 0 auto;
  max-width: 1100px;
`;

const DivP = styled.div`
  margin-bottom: 10px;
`;

const TextBlock = styled.div`
  max-width: 600px;
  min-width: 400px;
  margin-right: 30px;
  @media screen and (max-width: 800px) {
    margin-right: 0px;
  };
`;

const ImageBlock = styled.div`
  max-width: 400px;
`;

const About = () => (
  <Layout flex="column">
    <Section
      img="help.svg"
      title={_('About GSA')}
    >
      <StyledLayout
        wrap="wrap"
        align="center"
      >
        <TextBlock>
          <h1>Greenbone Security Assistant</h1>
          <h3>Version 7.1+beta1</h3>
          <DivP>The Greenbone Security Assistant (GSA) is the web-based
            user interface of the Greenbone Vulnerability Manager (GVM).
          </DivP>
          <DivP>
            GSA connects to GVM via the Greenbone Management Protocol (GMP)
            making the rich feature set of the GVM backend available, covering
            vulnerability scanning, vulnerability management, and related
            activities.
          </DivP>
          <DivP>
            GSA adds various smart features and forms a powerful tool to manage
            and maintain a high resilience level of the IT infrastructures.
          </DivP>
          <DivP>
            Copyright 2009-2018 by&nbsp;
            <a
              href="https://www.greenbone.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              Greenbone Networks GmbH
            </a>
          </DivP>
          <DivP>
            License: GNU General Public License version 2 or any later version
            &nbsp;
            <ExternalLink
              to="http://www.gnu.org/licenses/old-licenses/gpl-2.0.html"
            >
              (full license text)
            </ExternalLink>
          </DivP>
          <DivP>
            Cookies: This web application uses cookies to store session
            information. The cookie is not stored on the server-side hard disk
            and not submitted anywhere. It is lost when the session is closed or
            expired. The cookie is also temporarily stored in your browser where
            you can examine the content.
          </DivP>
          <DivP>
            The GMP documentation is available <ProtocolDocLink title="here"/>.
          </DivP>
        </TextBlock>
        <ImageBlock>
          <Img
            src="gsa_splash.svg"
            alt="GSA"
            width="100%"
          />
        </ImageBlock>
      </StyledLayout>
    </Section>
  </Layout>
);

export default About;

// vim: set ts=2 sw=2 tw=80:
