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
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2012-2014 Greenbone Networks GmbH

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
         title="{gsa:i18n ('Wizard', 'Wizard')}">
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
      <td valign="top"><b><xsl:value-of select="gsa:i18n('Welcome dear new user!', 'Task Wizard')"/></b>
        <p>
          <xsl:value-of select="gsa:i18n('To explore this powerful application and to have a quick start for doing things the first time, I am here to assist you with some hints and short-cuts.', 'Task Wizard')"/>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('I will appear automatically in areas where you have created no or only a few objects. And disappear when you have more than', 'Task Wizard')"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="../get_settings_response/setting[@id='20f3034c-e709-11e1-87e7-406186ea4fc5']/value"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('objects. You can call me with this icon', 'Task Wizard')"/>
          <xsl:text> </xsl:text>
          <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;refresh_interval={/envelope/params/refresh_interval}&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
             title="{gsa:i18n ('Wizard', 'Wizard')}">
            <img src="img/wizard.png"/>
          </a>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('any time later on.', 'Task Wizard')"/>
        </p>
        <p><xsl:value-of select="gsa:i18n('If you want help creating new scan tasks but also more options, you can select &quot;Advanced Task Wizard&quot; from the wizard selection menu at the top of this window where it currently says &quot;Task Wizard&quot; marked with a small arrow.', 'Task Wizard')"/></p>
        <p>
          <xsl:value-of select="gsa:i18n('For more detailed information on functionality, please try the integrated help system. It is always available as a context sensitive link as icon', 'Task Wizard')"/>
          <xsl:text> </xsl:text>
          <a href="/help/contents.html?token={/envelope/token}"
             title="{concat(gsa:i18n('Help', 'Help'),': ',gsa:i18n('Contents', 'Help'))}">
            <img src="/img/help.png"/>
          </a>.
        </p>
      </td>
      <td valign="top"><img src="img/enchantress.png"/></td>
      <td valign="top"><b><xsl:value-of select="gsa:i18n('Quick start: Immediately scan an IP address', 'Task Wizard')"/> </b>
        <p>
          <xsl:value-of select="gsa:i18n('IP address or hostname:', 'Task Wizard')"/>
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
            <input type="submit" name="submit" value="{gsa:i18n ('Start Scan', 'Task Wizard')}"/>
          </form>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('For this short-cut I will do the following for you:', 'Task Wizard')"/>
          <ol>
            <li><xsl:value-of select="gsa:i18n('Create a new Target with default Port List', 'Task Wizard')"/></li>
            <li><xsl:value-of select="gsa:i18n('Create a new Task using this target with default Scan Configuration', 'Task Wizard')"/></li>
            <li><xsl:value-of select="gsa:i18n('Start this scan task right away', 'Task Wizard')"/></li>
            <li><xsl:value-of select="gsa:i18n('Switch the view to reload every 30 seconds so you can lean back and watch the scan progress', 'Task Wizard')"/></li>
          </ol>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('In fact, you must not lean back. As soon as the scan progress is beyond 1%, you can already jump into the scan report via the link in the Reports Total column and review the results collected so far.', 'Task Wizard')"/>
        </p>
        <p>
          <xsl:value-of select="gsa:i18n('By clicking the New Task icon', 'Task Wizard')"/>
          <xsl:text> </xsl:text>
          <a href="/omp?cmd=new_task&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
            title="{gsa:i18n ('New Task', 'Task')}">
            <img src="/img/new.png" border="0"/>
          </a>
          <xsl:text> </xsl:text>
          <xsl:value-of select="gsa:i18n('you can also create a new Task yourself. However, you will need a Target first, which you can create by going to the Targets page found in the Configuration menu using the New icon there.', 'Task Wizard')"/>
        </p>
      </td>
    </tr>
  </table>
</xsl:template>

<xsl:template match="wizard/quick_first_scan">
  <xsl:apply-templates select="gsad_msg"/>

  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">
    <xsl:call-template name="wizard_list">
      <xsl:with-param name="title" select="'Task Wizard'"/>
    </xsl:call-template>

    <a href="/help/tasks.html?token={/envelope/token}#wizard" title="{concat(gsa:i18n('Help', 'Help'),': ',gsa:i18n('Task Wizard', 'Task Wizard'))}">
      <img src="/img/help.png" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=new_task&amp;refresh_interval={/envelope/params/refresh_interval}&amp;overrides={/envelope/params/overrides}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="{gsa:i18n ('New Task', 'Task')}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=get_tasks&amp;refresh_interval={/envelope/params/refresh_interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="{gsa:i18n ('Tasks', 'Task')}" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="{gsa:i18n ('Tasks', 'Task')}"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <xsl:call-template name="quick-first-scan-wizard"/>
  </div>
</xsl:template>

<xsl:template name="quick-task-wizard">
  <a name="wizard"></a>
  <form action="" method="post" enctype="multipart/form-data">
    <input type="hidden" name="token" value="{/envelope/token}"/>
    <input type="hidden" name="cmd" value="run_wizard"/>
    <input type="hidden" name="caller" value="{/envelope/caller}"/>
    <input type="hidden" name="name" value="quick_task"/>
    <input type="hidden" name="refresh_interval" value="{30}"/>
    <input type="hidden" name="overrides" value="{/envelope/params/overrides}"/>
    <input type="hidden" name="filter" value="{/envelope/params/filter}"/>
    <input type="hidden" name="filt_id" value="{/envelope/params/filt_id}"/>
    <input type="hidden" name="next" value="get_tasks"/>

    <table>
      <tr>
        <td valign="top" rowspan="15" width="250px">
          <p><xsl:value-of select="gsa:i18n ('I can help you by creating a new scan task and automatically starting it.', 'Advanced Task Wizard')"/></p>
          <p><xsl:value-of select="gsa:i18n ('All you need to do is enter a name for the new task and the IP address or host name of the target, and select a scan configuration.', 'Advanced Task Wizard')"/></p>
          <p><xsl:value-of select="gsa:i18n ('You can choose if you want me to run the scan immediately, schedule the task for a later date and time, or just create the task so you can run it manually later.', 'Advanced Task Wizard')"/></p>
          <p><xsl:value-of select="gsa:i18n ('In order to run an authenticated scan, you have to select SSH and/or SMB credentials, but you can also run an unauthenticated scan by not selecting any credentials.', 'Advanced Task Wizard')"/>
          <xsl:if test="gsa:may-op ('get_alerts') and gsa:may-op ('create_alert')">
            <br/>
            <xsl:value-of select="gsa:i18n ('If you enter an email address in the &quot;Email report to&quot; field, a report of the scan will be sent to this address once it is finished.', 'Advanced Task Wizard')"/>
          </xsl:if>
          <xsl:if test="gsa:may-op ('get_slaves')">
            <br/>
            <xsl:value-of select="gsa:i18n ('Finally, you can select a slave which will run the scan.', 'Advanced Task Wizard')"/>
          </xsl:if></p>
        </td>
        <td valign="center" rowspan="15">
          <img src="img/enchantress.png"/>
        </td>
        <td valign="top" colspan="2">
          <b><xsl:value-of select="gsa:i18n ('Quick start: Create a new task', 'Advanced Task Wizard')"/></b>
        </td>
      </tr>
      <tr>
        <td width="125px">
          <xsl:value-of select="gsa:i18n ('Task Name', 'Advanced Task Wizard')"/>:
        </td>
        <td>
          <input type="text" name="event_data:task_name" value="New Quick Task" size="30" maxlength="80"/>
        </td>
      </tr>
      <tr>
        <td>
          <xsl:value-of select="gsa:i18n ('Scan Config', 'Scan Config')"/>:
        </td>
        <td>
          <select name="event_data:config_id">
            <xsl:for-each select="../run_wizard_response/response/commands_response/get_configs_response/config">
              <xsl:choose>
                <xsl:when test="@id = 'daba56c8-73ec-11df-a475-002264764cea'">
                  <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                </xsl:when>
                <xsl:otherwise>
                  <option value="{@id}"><xsl:value-of select="name"/></option>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:for-each>
          </select>
        </td>
      </tr>
      <tr>
        <td>
          <xsl:value-of select="gsa:i18n ('Target Host(s)', 'Advanced Task Wizard')"/>:
        </td>
        <td>
          <input type="text" name="event_data:target_hosts" value="" size="30" maxlength="80"/>
        </td>
      </tr>
      <tr>
        <td>
          <xsl:value-of select="gsa:i18n ('Start time', 'Advanced Task Wizard')"/>:
        </td>
        <td>
          <label>
            <input type="radio" name="event_data:auto_start" value="2" checked="1"/>
            <xsl:value-of select="gsa:i18n ('Start immediately', 'Advanced Task Wizard')"/>
          </label>
          <br/>
          <label>
            <input type="radio" name="event_data:auto_start" value="1"/>
            <select name="event_data:start_hour">
              <xsl:variable name="hour"
                            select="format-number (date:hour-in-day (date:time ()), '00')"/>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'00'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'01'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'02'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'03'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'04'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'05'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'06'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'07'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'08'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'09'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'10'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'11'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'12'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'13'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'14'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'15'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'16'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'17'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'18'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'19'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'20'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'21'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'22'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'23'"/>
                <xsl:with-param name="select-value" select="$hour"/>
              </xsl:call-template>
            </select>
            h
            <select name="event_data:start_minute">
              <xsl:variable name="minute"
                            select="format-number (date:minute-in-hour (date:time ()), '00')"/>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'00'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'05'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'10'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'15'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'20'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'25'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'30'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'35'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'40'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'45'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'50'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'55'"/>
                <xsl:with-param name="select-value" select="$minute - ($minute mod 5)"/>
              </xsl:call-template>
            </select>
            ,
            <select name="event_data:start_day">
              <xsl:variable name="day"
                            select="format-number (date:day-in-month (date:date ()), '00')"/>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'01'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'02'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'03'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'04'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'05'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'06'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'07'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'08'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'09'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'10'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'11'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'12'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'13'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'14'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'15'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'16'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'17'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'18'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'19'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'20'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'21'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'22'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'23'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'24'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'25'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'26'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'27'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'28'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'29'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'30'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'31'"/>
                <xsl:with-param name="select-value" select="$day"/>
              </xsl:call-template>
            </select>
            <select name="event_data:start_month">
              <xsl:variable name="month"
                            select="format-number (date:month-in-year (date:date ()), '00')"/>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'01'"/>
                <xsl:with-param name="content" select="'Jan'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'02'"/>
                <xsl:with-param name="content" select="'Feb'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'03'"/>
                <xsl:with-param name="content" select="'Mar'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'04'"/>
                <xsl:with-param name="content" select="'Apr'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'05'"/>
                <xsl:with-param name="content" select="'May'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'06'"/>
                <xsl:with-param name="content" select="'Jun'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'07'"/>
                <xsl:with-param name="content" select="'Jul'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'08'"/>
                <xsl:with-param name="content" select="'Aug'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'09'"/>
                <xsl:with-param name="content" select="'Sep'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'10'"/>
                <xsl:with-param name="content" select="'Oct'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'11'"/>
                <xsl:with-param name="content" select="'Nov'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
              <xsl:call-template name="opt">
                <xsl:with-param name="value" select="'12'"/>
                <xsl:with-param name="content" select="'Dec'"/>
                <xsl:with-param name="select-value" select="$month"/>
              </xsl:call-template>
            </select>

            <select name="event_data:start_year">
              <option value="{date:year()}"><xsl:value-of select="date:year()"/></option>
              <option value="{date:year() + 1}"><xsl:value-of select="date:year() + 1"/></option>
              <option value="{date:year() + 2}"><xsl:value-of select="date:year() + 2"/></option>
              <option value="{date:year() + 3}"><xsl:value-of select="date:year() + 3"/></option>
              <option value="{date:year() + 4}"><xsl:value-of select="date:year() + 4"/></option>
              <option value="{date:year() + 5}"><xsl:value-of select="date:year() + 5"/></option>
            </select>
          </label>
          <br/>
          <label>
            <input type="radio" name="event_data:auto_start" value="0"/>
            <xsl:value-of select="gsa:i18n ('Do not start automatically', 'Advanced Task Wizard')"/>
          </label>
        </td>
      </tr>
      <xsl:if test="../run_wizard_response/response/commands_response/get_lsc_credentials_response">
        <tr>
          <td>
            <xsl:value-of select="gsa:i18n ('SSH Credential', 'Target Window')"/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="gsa:i18n('optional', 'Window')"/>
            <xsl:text>):</xsl:text>
          </td>
          <td>
            <select name="event_data:ssh_credential">
              <option value="" selected="1">--</option>
              <xsl:for-each select="../run_wizard_response/response/commands_response/get_lsc_credentials_response/lsc_credential">
                <option value="{@id}"><xsl:value-of select="name"/></option>
              </xsl:for-each>
            </select>
            <xsl:value-of select="' on port '"/>
            <input type="text" name="event_data:ssh_port" value="22" size="5"/>
          </td>
        </tr>
        <tr>
          <td>
            <xsl:value-of select="gsa:i18n ('SMB Credential', 'Target Window')"/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="gsa:i18n('optional', 'Window')"/>
            <xsl:text>)</xsl:text>
          </td>
          <td>
            <select name="event_data:smb_credential">
              <option value="" selected="1">--</option>
              <xsl:for-each select="../run_wizard_response/response/commands_response/get_lsc_credentials_response/lsc_credential">
                <option value="{@id}"><xsl:value-of select="name"/></option>
              </xsl:for-each>
            </select>
          </td>
        </tr>
      </xsl:if>
      <xsl:if test="gsa:may-op ('create_alert') and gsa:may-op ('get_alerts')">
        <tr>
          <td>
            <xsl:value-of select="gsa:i18n ('Email report to', 'Advanced Task Wizard')"/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="gsa:i18n('optional', 'Window')"/>
            <xsl:text>):</xsl:text>
          </td>
          <td>
            <input type="text" name="event_data:alert_email" value="" size="30" maxlength="80"/>
          </td>
        </tr>
      </xsl:if>
      <xsl:if test="gsa:may-op ('get_slaves')">
        <tr>
          <td>
            <xsl:value-of select="gsa:i18n ('Slave', 'Slave')"/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="gsa:i18n('optional', 'Window')"/>
            <xsl:text>):</xsl:text>
          </td>
          <td>
            <select name="event_data:slave_id">
              <option value="" selected="1">--</option>
              <xsl:for-each select="../run_wizard_response/response/commands_response/get_slaves_response/slave">
                <option value="{@id}"><xsl:value-of select="name"/></option>
              </xsl:for-each>
            </select>
          </td>
        </tr>
      </xsl:if>
      <tr>
        <td colspan="2" align="right">
          <input type="submit" name="submit" value="{gsa:i18n ('Create Task', 'Task')}"/>
        </td>
      </tr>
    </table>
  </form>
</xsl:template>


<xsl:template match="wizard/quick_task">
  <xsl:apply-templates select="gsad_msg"/>

  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">
    <xsl:call-template name="wizard_list">
      <xsl:with-param name="title" select="'Advanced Task Wizard'"/>
    </xsl:call-template>

    <a href="/help/tasks.html?token={/envelope/token}#wizard" title="{concat(gsa:i18n('Help', 'Help'),': ',gsa:i18n('Task Wizard', 'Task Wizard'))}">
      <img src="/img/help.png" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=new_task&amp;refresh_interval={/envelope/params/refresh_interval}&amp;overrides={/envelope/params/overrides}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="{gsa:i18n ('New Task', 'Task')}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
    <a href="/omp?cmd=get_tasks&amp;refresh_interval={/envelope/params/refresh_interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
       title="{gsa:i18n ('Tasks', 'Task')}" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="{gsa:i18n ('Tasks', 'Task')}"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <xsl:call-template name="quick-task-wizard"/>
  </div>
</xsl:template>

<xsl:template name="wizard_list">
  <xsl:param name="title" select="'(Missing Title)'"/>

  <div id="wizard_list">
    <ul>
      <li>
        <a id="section_list_first"><xsl:value-of select="gsa:i18n($title, $title)"/></a>
        <ul>
          <li>
            <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;refresh_interval={/envelope/autorefresh/@interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"><xsl:value-of select="gsa:i18n ('Task Wizard', 'Task Wizard')"/></a>
          </li>
          <li class="last">
            <a href="/omp?cmd=wizard&amp;name=quick_task&amp;refresh_interval={/envelope/autorefresh/@interval}&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"><xsl:value-of select="gsa:i18n ('Advanced Task Wizard', 'Advanced Task Wizard')"/></a>
          </li>
        </ul>
      </li>
    </ul>
  </div>

</xsl:template>


</xsl:stylesheet>
