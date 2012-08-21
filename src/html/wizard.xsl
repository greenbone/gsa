<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:str="http://exslt.org/strings"
    xmlns:func="http://exslt.org/functions"
    xmlns:gsa="http://openvas.org"
    xmlns:date="http://exslt.org/dates-and-times"
    extension-element-prefixes="str func date">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Wizard stylesheet

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>

Copyright:
Copyright (C) 2012 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template name="quick-first-scan-wizard" match="wizard/quick_first_scan">
  <xsl:param name="apply-overrides" select="1"/>
  <a name="wizard"></a>
  <table>
    <tr>
      <td valign="top"><b>Welcome dear new user!</b>
        <p>
          To explore this powerful application and to
          have a quick start for doing things the first time,
          I am here to assist you with some hints and short-cuts.
        </p>
        <p>
          I will appear automatically in areas where you have
          created no or only a few objects. And disappear after you
          have at least
          <xsl:value-of select="../get_settings_response/setting/value"/>
          objects. You can call me with this
          icon <img src="img/wizard.png"/> any time later on.
        </p>
        <p>
          For more detailed information on functionality,
          please try the integrated help system. It is always available
          as a context sensitive link as icon <img src="img/help.png"/>.
        </p>
      </td>
      <td valign="top"><img src="img/enchantress.png"/></td>
      <td valign="top"><b>Quick start: Immediately scan an IP address</b>
        <p>
          IP address or hostname:
          <form action="" method="post" enctype="multipart/form-data">
            <input type="hidden" name="token" value="{/envelope/token}"/>
            <input type="hidden" name="cmd" value="run_wizard"/>
            <input type="hidden" name="caller" value="{/envelope/caller}"/>
            <input type="hidden" name="name" value="quick_first_scan"/>
            <input type="hidden" name="overrides" value="{$apply-overrides}"/>
            <input type="text" name="event_data:hosts" value="" size="30" maxlength="80"/>
            <input type="submit" name="submit" value="Start Scan"/>
          </form>
        </p>
        <p>
          For this short-cut I will do the following for you:
          <ol>
            <li>Create a new Target with default Port List</li>
            <li>Create a new Task using this target with default Scan Configuration</li>
            <li>Start this scan task right away</li>
            <li>Switch the view to reload every 30 seconds so you can lean back and watch the scan progress</li>
          </ol>
        </p>
        <p>
          In fact, you must not lean back. As soon as the scan progress is beyond 1%,
          you can already jump into the scan report via the details icon (<img src="img/details.png"/>)
          and review the results collected so far.
        </p>
      </td>
    </tr>
  </table>
</xsl:template>

</xsl:stylesheet>
