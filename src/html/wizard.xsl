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
Copyright (C) 2012, 2013 Greenbone Networks GmbH

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

<xsl:template name="wizard-icon">
  <xsl:choose>
    <xsl:when test="name (..) = 'get_tasks'">
      <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;refresh_interval={/envelope/autorefresh/@interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
         title="Wizard">
        <img src="/img/wizard.png" border="0" style="margin-left:3px;"/>
      </a>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="wizard">
  <xsl:param name="force-wizard" select="/envelope/params/force_wizard"/>
  <xsl:param name="wizard-rows"
             select="../get_settings_response/setting[name='Wizard Rows']/value"/>
  <xsl:choose>
    <xsl:when test="(/envelope/role != 'Observer') and (name (..) = 'get_tasks') and (number (task_count/text ()) &lt;= number ($wizard-rows)) or ($force-wizard = 1)">
      <xsl:call-template name="quick-first-scan-wizard"/>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="quick-first-scan-wizard">
  <a name="wizard"></a>
  <table>
    <tr>
      <td valign="top"><b><xsl:value-of select="gsa:i18n('Welcome dear new user!')"/></b>
        <p>
          <xsl:value-of select="gsa:i18n('To explore this powerful application and to
          have a quick start for doing things the first time,
          I am here to assist you with some hints and short-cuts.')"/>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('I will appear automatically in areas where you have
          created no or only a few objects. And disappear when you
          have more than')"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="../get_settings_response/setting[@id='20f3034c-e709-11e1-87e7-406186ea4fc5']/value"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('objects. You can call me with this
          icon')"/>
          <xsl:text> </xsl:text>
          <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;refresh_interval={/envelope/params/refresh_interval}&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
             title="Wizard">
            <img src="img/wizard.png"/>
          </a>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('any time later on.')"/>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('For more detailed information
          on functionality, please try the integrated help system. It is
          always available as a context sensitive link as icon')"/>
          <xsl:text> </xsl:text>
          <a href="/help/contents.html?token={/envelope/token}"
             title="Help: Contents">
            <img src="/img/help.png"/>
          </a>.
        </p>
      </td>
      <td valign="top"><img src="img/enchantress.png"/></td>
      <td valign="top"><b><xsl:value-of select="gsa:i18n('Quick start: Immediately scan an IP address')"/> </b>
        <p>
          <xsl:value-of select="gsa:i18n('IP address or hostname:')"/>
          <form action="" method="post" enctype="multipart/form-data">
            <input type="hidden" name="token" value="{/envelope/token}"/>
            <input type="hidden" name="cmd" value="run_wizard"/>
            <input type="hidden" name="caller" value="{/envelope/caller}"/>
            <input type="hidden" name="name" value="quick_first_scan"/>
            <input type="hidden" name="refresh_interval" value="{30}"/>
            <input type="hidden" name="overrides" value="{/envelope/params/overrides}"/>
            <input type="hidden" name="filter" value="{/envelope/params/filter}"/>
            <input type="hidden" name="filt_id" value="{/envelope/params/filt_id}"/>
            <input type="hidden" name="next" value="get_tasks"/>
            <input type="text" name="event_data:hosts" value="" size="30" maxlength="80"/>
            <input type="submit" name="submit" value="Start Scan"/>
          </form>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('For this short-cut I will do the following for you:')"/>
          <ol>
            <li><xsl:value-of select="gsa:i18n('Create a new Target with default Port List')"/></li>
            <li><xsl:value-of select="gsa:i18n('Create a new Task using this target with default Scan Configuration')"/></li>
            <li><xsl:value-of select="gsa:i18n('Start this scan task right away')"/></li>
            <li><xsl:value-of select="gsa:i18n('Switch the view to reload every 30 seconds so you can lean back and watch the scan progress')"/></li>
          </ol>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('In fact, you must not lean back.
          As soon as the scan progress is beyond 1%,
          you can already jump into the scan report via the link in the Reports Total column')"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('and review the results collected so far.')"/>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('By clicking the New Task icon')"/>
          <xsl:text> </xsl:text>
          <a href="/omp?cmd=new_task&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
            title="New Task">
            <img src="/img/new.png" border="0"/>
          </a>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('you can also create a new Task yourself. However, you will need a Target first, which you can create by going to the Targets page found in the Configuration menu using the New icon there.')"/>
        </p>
      </td>
    </tr>
  </table>
</xsl:template>

<xsl:template match="wizard/quick_first_scan">
  <xsl:apply-templates select="gsad_msg"/>

  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center"><xsl:value-of select="gsa:i18n('Task Wizard')"/>
    <a href="/help/tasks.html?token={/envelope/token}#wizard" title="Help: Task Wizard">
      <img src="/img/help.png" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=new_task&amp;refresh_interval={/envelope/params/refresh_interval}&amp;overrides={/envelope/params/overrides}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="New Task">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=get_tasks&amp;refresh_interval={/envelope/params/refresh_interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="Tasks" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Tasks"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <xsl:call-template name="quick-first-scan-wizard"/>
  </div>
</xsl:template>

</xsl:stylesheet>
