<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns="http://www.w3.org/1999/xhtml"
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

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

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
      <span class="icon-menu">
        <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
            title="{gsa:i18n ('Wizard')}"
            class="wizard-action-icon icon icon-sm" data-dialog-id="quick_first_scan"
            data-name="quick_first_scan" data-button="{gsa:i18n ('Start Scan', 'Action Verb')}">
          <img src="/img/wizard.svg"/>
        </a>
        <ul>
          <li>
            <a href="/omp?cmd=wizard&amp;name=quick_first_scan&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
                class="wizard-action-icon" data-dialog-id="quick_first_scan"
                data-name="quick_first_scan" data-button="{gsa:i18n ('Start Scan', 'Action Verb')}">
              <xsl:value-of select="gsa:i18n ('Task Wizard')"/>
            </a>
          </li>
          <li>
            <a href="/omp?cmd=wizard&amp;name=quick_task&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
              data-dialog-id="advanced_task_wizard"
               class="wizard-action-icon" data-name="quick_task" data-height="650">
              <xsl:value-of select="gsa:i18n ('Advanced Task Wizard')"/>
            </a>
          </li>
          <li>
            <a href="/omp?cmd=wizard&amp;name=modify_task&amp;filter={/envelope/params/filter}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
              data-dialog-id="modify_task_wizard" data-button="{gsa:i18n ('Save', 'Action Verb')}"
               class="wizard-action-icon" data-name="modify_task">
              <xsl:value-of select="gsa:i18n ('Modify Task Wizard')"/>
            </a>
          </li>
        </ul>
      </span>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="wizard">
  <xsl:param name="force-wizard" select="/envelope/params/force_wizard"/>
  <xsl:choose>
    <xsl:when test="(/envelope/role != 'Observer') and (name (..) = 'get_tasks') and (number (task_count/text ()) = 0) or ($force-wizard = 1)">
      <div class="info-dialog" data-timeout="10000" data-transfer-to=".wizard-action-icon[data-name=quick_first_scan]">
        <p class="wizard_hint">
          <img class="icon-lg valign-middle pull-left" style="margin-right:10px" src="/img/wizard.svg" />
          <xsl:value-of select="gsa:i18n('Welcome to the scan task management!')"/><br/>
          <xsl:value-of select="gsa:i18n('If you would like to start your first vulnerability scan, the scan wizard can help you to do so with just one click.')"/><br/>
          <xsl:value-of select="gsa:i18n('Simply select the wizard icon from the icon bar in the top-left of this page.')"/>
        </p>
      </div>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="quick-first-scan-wizard">
  <a name="wizard"></a>
  <div id="wizardess" class="pull-left">
    <img src="img/enchantress.svg" style="height:300px;"/>
  </div>
  <div class="clearfix">
    <p>
      <b><xsl:value-of select="gsa:i18n('Quick start: Immediately scan an IP address')"/> </b>
    </p>
    <div>
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
        <input type="text" name="event_data:hosts" value="{/envelope/client_address}" size="40" maxlength="2000"/>
        <input type="hidden" name="event_data:port_list_id" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default Port List']/value}"/>
        <input type="hidden" name="event_data:alert_id" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default Alert']/value}"/>
        <input type="hidden" name="event_data:config_id" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default OpenVAS Scan Config']/value}"/>
        <input type="hidden" name="event_data:ssh_credential" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default SSH Credential']/value}"/>
        <input type="hidden" name="event_data:smb_credential" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default SMB Credential']/value}"/>
        <input type="hidden" name="event_data:esxi_credential" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default ESXi Credential']/value}"/>
        <input type="hidden" name="event_data:scanner_id" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default OpenVAS Scanner']/value}"/>
        <input type="hidden" name="event_data:slave_id" value="{../run_wizard_response/response/get_settings_response/setting[name = 'Default Slave']/value}"/>
      </form>
    </div>
    <div>
        <xsl:value-of select="gsa:i18n('The default address is either your computer or your network gateway.')"/>
    </div>
    <div>
      <xsl:value-of select="gsa:i18n('As a short-cut I will do the following for you:')"/>
      <ol>
        <li><xsl:value-of select="gsa:i18n('Create a new Target')"/></li>
        <li><xsl:value-of select="gsa:i18n('Create a new Task')"/></li>
        <li><xsl:value-of select="gsa:i18n('Start this scan task right away')"/></li>
        <li><xsl:value-of select="gsa:i18n('Switch the view to reload every 30 seconds so you can lean back and watch the scan progress')"/></li>
      </ol>
    </div>
    <p>
      <xsl:value-of select="gsa:i18n('In fact, you must not lean back. As soon as the scan progress is beyond 1%, you can already jump into the scan report via the link in the Reports Total column and review the results collected so far.')"/>
    </p>
    <p>
      <xsl:value-of select="gsa:i18n('When creating the Target and Task I will use the defaults as configured in &quot;My Settings&quot;.')"/>
    </p>
    <p>
      <xsl:value-of select="gsa:i18n('By clicking the New Task icon')"/>
      <xsl:text> </xsl:text>
      <a href="/omp?cmd=new_task&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
         class="icon icon-sm"
         title="{gsa:i18n ('New Task')}">
        <img src="/img/new.svg" />
      </a>
      <xsl:text> </xsl:text>
      <xsl:value-of select="gsa:i18n('you can create a new Task yourself.')"/>
    </p>
  </div>
</xsl:template>

<xsl:template match="wizard/quick_first_scan">
  <xsl:apply-templates select="gsad_msg"/>

 <div class="edit-dialog">
  <div class="title">
    <xsl:value-of select="gsa:i18n('Task Wizard')"/>
  </div>
  <div class="content">
    <xsl:call-template name="quick-first-scan-wizard"/>
  </div>
 </div>
</xsl:template>

<xsl:template name="quick-task-wizard">
  <a name="wizard"></a>
  <form action="" method="post" enctype="multipart/form-data" class="form-horizontal quick-task-wizard">
    <input type="hidden" name="token" value="{/envelope/token}"/>
    <input type="hidden" name="cmd" value="run_wizard"/>
    <input type="hidden" name="caller" value="{/envelope/caller}"/>
    <input type="hidden" name="name" value="quick_task"/>
    <input type="hidden" name="overrides" value="{/envelope/params/overrides}"/>
    <input type="hidden" name="filter" value="{/envelope/params/filter}"/>
    <input type="hidden" name="filt_id" value="{/envelope/params/filt_id}"/>
    <input type="hidden" name="next" value="get_tasks"/>

    <input type="hidden" name="event_data:port_list_id" value="{../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default Port List']/value}"/>
    <input type="hidden" name="event_data:scanner_id" value="{../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default OpenVAS Scanner']/value}"/>
    <div class="container">
      <div class="col-5">
        <div class="col-12">
          <div class="pull-right" id="wizardess">
            <img src="img/enchantress.svg" style="height:300px"/>
          </div>
          <p><xsl:value-of select="gsa:i18n ('I can help you by creating a new scan task and automatically starting it.')"/></p>
          <p><xsl:value-of select="gsa:i18n ('All you need to do is enter a name for the new task and the IP address or host name of the target, and select a scan configuration.')"/></p>
          <p><xsl:value-of select="gsa:i18n ('You can choose if you want me to run the scan immediately, schedule the task for a later date and time, or just create the task so you can run it manually later.')"/></p>
          <p><xsl:value-of select="gsa:i18n ('In order to run an authenticated scan, you have to select SSH and/or SMB credentials, but you can also run an unauthenticated scan by not selecting any credentials.')"/>
            <xsl:if test="gsa:may-op ('get_alerts') and gsa:may-op ('create_alert')">
              <br/>
              <xsl:value-of select="gsa:i18n ('If you enter an email address in the &quot;Email report to&quot; field, a report of the scan will be sent to this address once it is finished.')"/>
            </xsl:if>
            <xsl:if test="gsa:may-op ('get_slaves')">
              <br/>
              <xsl:value-of select="gsa:i18n ('Finally, you can select a slave which will run the scan.')"/>
          </xsl:if></p>
          <p>
            <xsl:value-of select="gsa:i18n('For any other setting I will apply the defaults from &quot;My Settings&quot;.')"/>
          </p>
        </div>
      </div>
      <div class="col-7">
        <div class="form-group">
          <h3><xsl:value-of select="gsa:i18n ('Quick start: Create a new task')"/></h3>
        </div>
        <div class="form-group">
          <label class="col-3 control-label">
            <xsl:value-of select="gsa:i18n ('Task Name')"/>:
          </label>
          <div class="col-9">
            <input type="text" name="event_data:task_name" value="New Quick Task" size="30"
              class="form-control" maxlength="80"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-3 control-label">
            <xsl:value-of select="gsa:i18n ('Scan Config')"/>:
          </label>
          <div class="col-9">
            <xsl:variable name="config_id" select="../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default OpenVAS Scan Config']/value"/>

            <select name="event_data:config_id">
              <xsl:for-each select="../run_wizard_response/response/commands_response/get_configs_response/config">
                <xsl:choose>
                  <xsl:when test="@id = $config_id or (string-length ($config_id) = 0 and @id = 'daba56c8-73ec-11df-a475-002264764cea')">
                    <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="{@id}"><xsl:value-of select="name"/></option>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-3 control-label">
            <xsl:value-of select="gsa:i18n ('Target Host(s)')"/>:
          </label>
          <div class="col-9">
            <input type="text" name="event_data:target_hosts" value="{/envelope/client_address}" size="40"
              class="form-control" maxlength="2000"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-3 control-label">
            <xsl:value-of select="gsa:i18n ('Start time')"/>:
          </label>
          <div class="col-9">
            <div class="radio">
              <label>
                <input type="radio" name="event_data:auto_start" value="2" checked="1"/>
                <xsl:value-of select="gsa:i18n ('Start immediately')"/>
              </label>
            </div>
            <xsl:if test="gsa:may-op ('get_schedules') and gsa:may-op ('create_schedule')">
              <div class="radio">
                <label>
                  <input type="radio" name="event_data:auto_start" value="1"/>
                  <xsl:value-of select="gsa:i18n ('Create Schedule')"/>
                </label>
              </div>
              <div class="offset-1">
                <div class="datepicker form-group">
                  <xsl:variable name="day"
                    select="format-number (date:day-in-month (date:date ()), '00')"/>
                  <xsl:variable name="month"
                    select="format-number (date:month-in-year (date:date ()), '00')"/>
                  <xsl:variable name="year" select="date:year()"/>

                  <input class="datepicker-button" size="26"/>
                  <input class="datepicker-day" name="event_data:start_day" value="{$day}" type="hidden"/>
                  <input class="datepicker-month" name="event_data:start_month" value="{$month}" type="hidden"/>
                  <input class="datepicker-year" name="event_data:start_year" value="{$year}" type="hidden"/>
                </div>

                <div class="form-group">
                  <xsl:variable name="hour"
                    select="format-number (date:hour-in-day (date:time ()), '00')"/>
                  <xsl:variable name="minute"
                    select="format-number (date:minute-in-hour (date:time ()), '00')"/>

                  <div class="form-item">
                    at
                  </div>

                  <div class="form-item">
                    <input type="text"
                      name="event_data:start_hour"
                      value="{$hour}"
                      size="2"
                      class="spinner"
                      data-type="int"
                      min="0"
                      max="23"
                      maxlength="2"/>
                    h
                  </div>

                  <div class="form-item">
                    <input type="text"
                      name="event_data:start_minute"
                      value="{$minute - ($minute mod 5)}"
                      size="2"
                      class="spinner"
                      data-type="int"
                      min="0"
                      max="59"
                      maxlength="2"/>
                    m
                  </div>
                </div>

                <div class="form-group">
                  <xsl:call-template name="timezone-select">
                    <xsl:with-param name="timezone" select="/envelope/timezone"/>
                    <xsl:with-param name="input-name" select="'event_data:start_timezone'"/>
                  </xsl:call-template>
                </div>
              </div>
            </xsl:if>
            <div class="radio">
              <label>
                <input type="radio" name="event_data:auto_start" value="0"/>
                <xsl:value-of select="gsa:i18n ('Do not start automatically')"/>
              </label>
            </div>
          </div>
        </div>
        <xsl:if test="../run_wizard_response/response/commands_response/get_credentials_response">
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('SSH Credential')"/>
            </label>
            <div class="col-9">
              <xsl:variable name="ssh_credential_id" select="../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default SSH Credential']/value"/>
              <select name="event_data:ssh_credential">
                <option value="" selected="1">--</option>
                <xsl:for-each select="../run_wizard_response/response/commands_response/get_credentials_response/credential[type='up' or type='usk']">
                  <xsl:choose>
                    <xsl:when test="@id = $ssh_credential_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
              <xsl:value-of select="' on port '"/>
              <input type="text" name="event_data:ssh_port" class="spinner" min="0" max="65535" value="22" size="5"/>
            </div>
          </div>
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('SMB Credential')"/>
            </label>
            <div class="col-9">
              <xsl:variable name="smb_credential_id" select="../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default SMB Credential']/value"/>
              <select name="event_data:smb_credential">
                <option value="" selected="1">--</option>
                <xsl:for-each select="../run_wizard_response/response/commands_response/get_credentials_response/credential[type='up']">
                  <xsl:choose>
                    <xsl:when test="@id = $smb_credential_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('ESXi Credential')"/>
            </label>
            <div class="col-9">
              <xsl:variable name="esxi_credential_id" select="../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default ESXi Credential']/value"/>
              <select name="event_data:esxi_credential">
                <option value="" selected="1">--</option>
                <xsl:for-each select="../run_wizard_response/response/commands_response/get_credentials_response/credential[type='up']">
                  <xsl:choose>
                    <xsl:when test="@id = $esxi_credential_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </div>
          </div>
        </xsl:if>
        <xsl:if test="gsa:may-op ('create_alert') and gsa:may-op ('get_alerts')">
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('Email report to')"/>
            </label>
            <div class="col-9">
              <input type="text" name="event_data:alert_email" value="" size="30" maxlength="80"
                class="form-control" />
            </div>
          </div>
        </xsl:if>
        <xsl:if test="gsa:may-op ('get_slaves')">
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('Slave')"/>
            </label>
            <div class="col-9">
              <xsl:variable name="slave_id" select="../run_wizard_response/response/commands_response/get_settings_response/setting[name = 'Default Slave']/value"/>
              <select name="event_data:slave_id">
                <option value="" selected="1">--</option>
                <xsl:for-each select="../run_wizard_response/response/commands_response/get_slaves_response/slave">
                  <xsl:choose>
                    <xsl:when test="@id = $slave_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </div>
          </div>
        </xsl:if>
      </div>
    </div>
  </form>
</xsl:template>


<xsl:template match="wizard/quick_task">
  <xsl:apply-templates select="gsad_msg"/>
 <div class="edit-dialog">
  <div class="title">
    <xsl:value-of select="gsa:i18n('Advanced Task Wizard')"/>
  </div>

  <div class="content">
    <xsl:call-template name="quick-task-wizard"/>
  </div>
 </div>
</xsl:template>


<xsl:template name="modify-task-wizard">
  <a name="wizard"></a>
  <form action="" method="post" enctype="multipart/form-data" class="form-horizontal">
    <input type="hidden" name="token" value="{/envelope/token}"/>
    <input type="hidden" name="cmd" value="run_wizard"/>
    <input type="hidden" name="caller" value="{/envelope/caller}"/>
    <input type="hidden" name="name" value="modify_task"/>
    <input type="hidden" name="overrides" value="{/envelope/params/overrides}"/>
    <input type="hidden" name="filter" value="{/envelope/params/filter}"/>
    <input type="hidden" name="filt_id" value="{/envelope/params/filt_id}"/>
    <input type="hidden" name="next" value="get_tasks"/>

    <div class="container">
      <div class="col-6">
        <div class="col-6">
          <p>
            <xsl:value-of
              select="gsa:i18n ('I will modify an existing task for you. The difference to the Edit Task dialog is that here you can enter values for associated objects directly. I will then create them for you automatically and assign them to the selected task.')"/>
          </p>

          <p>
            <xsl:value-of select="gsa:i18n ('Please be aware that')"/>
            <ul>
              <li>
                <xsl:value-of select="gsa:i18n ('setting a start time overwrites a possibly already existing one,')"/>
              </li>
              <li>
                <xsl:value-of select="gsa:i18n ('setting an Email Address means adding an additional Alert, not replacing an existing one.')"/>
              </li>
            </ul>
          </p>
        </div>
        <div class="col-6">
          <img src="img/enchantress.svg" style="height:300px"/>
        </div>
      </div>

      <div class="col-6">
        <h1><xsl:value-of select="gsa:i18n ('Quick edit: Modify a task')"/></h1>
        <div class="form-group">
          <label class="col-3 control-label">
            <xsl:value-of select="gsa:i18n ('Task')"/>:
          </label>
          <div class="col-9">
            <xsl:variable name="task_id" select="/envelope/params/_param [name = 'event_data:task_id']"/>
            <select name="event_data:task_id">
              <xsl:for-each select="../run_wizard_response/response/commands_response/get_tasks_response/task">
                <xsl:choose>
                  <xsl:when test="@id = $task_id">
                    <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="{@id}"><xsl:value-of select="name"/></option>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
            </select>
          </div>
        </div>
        <xsl:if test="gsa:may ('get_schedules') and gsa:may ('create_schedule')">
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('Start time')"/>:
            </label>
            <div class="col-9">
              <div class="radio">
                <label>
                  <input type="radio" name="event_data:reschedule" value="0" checked="1"/>
                  <xsl:value-of select="gsa:i18n ('Do not change')"/>
                </label>
              </div>
              <div class="radio">
                <label>
                  <input type="radio" name="event_data:reschedule" value="1"/>
                  <xsl:value-of select="gsa:i18n ('Create Schedule')"/>
                </label>
              </div>
              <div class="offset-1">
                <xsl:variable name="day"
                  select="format-number (date:day-in-month (date:date ()), '00')"/>
                <xsl:variable name="month"
                  select="format-number (date:month-in-year (date:date ()), '00')"/>
                <xsl:variable name="year" select="date:year()"/>
                <xsl:variable name="hour"
                  select="format-number (date:hour-in-day (date:time ()), '00')"/>
                <xsl:variable name="minute"
                  select="format-number (date:minute-in-hour (date:time ()), '00')"/>

                <div class="datepicker form-group">
                  <input class="datepicker-button" size="26"/>
                  <input class="datepicker-day" name="event_data:start_day" value="{$day}" type="hidden"/>
                  <input class="datepicker-month" name="event_data:start_month" value="{$month}" type="hidden"/>
                  <input class="datepicker-year" name="event_data:start_year" value="{$year}" type="hidden"/>
                </div>

                <div class="form-group">
                  <div class="form-item">
                    at
                  </div>

                  <div class="form-item">
                    <input type="text"
                      name="event_data:start_hour"
                      value="{$hour}"
                      size="2"
                      class="spinner"
                      data-type="int"
                      min="0"
                      max="23"
                      maxlength="2"/>
                    h
                  </div>

                  <div class="form-item">
                    <input type="text"
                      name="event_data:start_minute"
                      value="{$minute - ($minute mod 5)}"
                      size="2"
                      class="spinner"
                      data-type="int"
                      min="0"
                      max="59"
                      maxlength="2"/>
                    m
                  </div>
                </div>

                <div class="form-group">
                  <xsl:call-template name="timezone-select">
                    <xsl:with-param name="timezone" select="/envelope/timezone"/>
                    <xsl:with-param name="input-name" select="'event_data:start_timezone'"/>
                  </xsl:call-template>
                </div>
              </div>
            </div>
          </div>
        </xsl:if>

        <xsl:if test="gsa:may-op ('create_alert') and gsa:may-op ('get_alerts')">
          <div class="form-group">
            <label class="col-3 control-label">
              <xsl:value-of select="gsa:i18n ('Email report to')"/>
            </label>
            <div class="col-9">
              <input type="text" name="event_data:alert_email" value="" size="30" maxlength="80"
                class="form-control"/>
            </div>
          </div>
        </xsl:if>
      </div>
    </div>
  </form>
</xsl:template>

<xsl:template match="wizard/modify_task">
  <xsl:apply-templates select="gsad_msg"/>
 <div class="edit-dialog">
  <div class="title">
    <xsl:value-of select="gsa:i18n('Modify Task Wizard')"/>
  </div>
  <div class="content">
    <xsl:call-template name="modify-task-wizard"/>
  </div>
 </div>
</xsl:template>

</xsl:stylesheet>
