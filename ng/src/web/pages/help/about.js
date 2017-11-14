/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 Greenbone Networks GmbH
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
import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import ExternalLink from '../../components/link/externallink.js';
import Img from '../../components/img/img.js';

import Layout from '../../components/layout/layout.js';
import Section from '../../components/section/section.js';

const StyledLayout = glamorous(Layout) ({
  margin: '0 auto',
  maxWidth: '1100px',
});

const TextBlock = glamorous.p({
  maxWidth: '600px',
  minWidth: '400px',
  marginRight: '30px',
  '@media screen and (max-width: 800px)': {
    marginRight: "0px",
  }
});

const ImageBlock = glamorous.div({
  maxWidth: '400px',
});

const About = () => (
  <Layout flex="column">
    <Section
      img="help.svg"
      title={_('About GSA')}
    >
      <StyledLayout
        wrap
        align="center"
      >
        <TextBlock>
          <h1>Greenbone Security Assistant</h1>
          <h3>Version 7.1+beta1</h3>
          <p>The Greenbone Security Assistant (GSA) is the web-based graphical
            user interface of the Open Vulnerability Assessment System
            (OpenVAS). GSA connects to OpenVAS Manager via the OpenVAS
            Management Protocol (OMP). By implementing the full feature set
            of OMP, GSA offers a straight-forward, yet powerful method to
            manage network vulnerability scans.
          </p>
          <p>
            Copyright 2009-2017 by&nbsp;
            <ExternalLink
              to="https://www.greenbone.net"
            >
              Greenbone Networks GmbH
            </ExternalLink>
          </p>
          <p>
            License: GNU General Public License version 2 or any later version
            &nbsp;
            <ExternalLink
              to="http://www.gnu.org/licenses/old-licenses/gpl-2.0.html"
            >
              (full license text)
            </ExternalLink>
          </p>
          <p>Contact: For updates, feature proposals and bug reports contact
            the&nbsp;
            <ExternalLink
              to="http://www.greenbone.net/en/contact/"
            >
              Greenbone team
            </ExternalLink> or visit the&nbsp;
            <ExternalLink
              to="http://www.openvas.org/"
            >
              OpenVAS homepage.
            </ExternalLink>
          </p>
          <p>
            Cookies: This web application uses cookies to store session
            information. The cookie is not stored on the server-side hard disk
            and not submitted anywhere. It is lost when the session is closed
            or expired. The cookie is also temporarily stored in your browser
            where you can examine the content.
          </p>
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
