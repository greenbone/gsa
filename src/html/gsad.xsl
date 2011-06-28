<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Main stylesheet

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>
Hartmut Goebel <h.goebel@goebel-consult.de>

Copyright:
Copyright (C) 2009, 2010 Greenbone Networks GmbH

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

<!-- HEADERS, FOOTER, SIDEBARS -->

<xsl:template name="html-head">
  <head>
    <link rel="stylesheet" type="text/css" href="/gsa-style.css"/>
    <!-- Internet Explorer CSS Fixes -->
    <xsl:comment>[if IE 6]&gt;
      <!-- HACK: Since this will become a comment for the webserver,
           URLS are not rewritten within here. Try some locations so
           one should match. This is ugly, but IE6 is too.
      -->
        &lt;link rel="stylesheet" type="text/css" href="IE6fixes.css"/&gt;
        &lt;link rel="stylesheet" type="text/css" href="../IE6fixes.css"/&gt;
    &lt;![endif]</xsl:comment>
    <link rel="icon" href="/favicon.gif" type="image/x-icon"/>
    <title>Greenbone Security Assistant</title>
    <xsl:apply-templates select="envelope/autorefresh" mode="html-header-meta" />
  </head>
</xsl:template>

<!-- Add meta refresh info if autorefresh element present -->
<xsl:template match="autorefresh" mode="html-header-meta">
  <xsl:if test="@interval &gt; 0">
    <meta http-equiv="refresh" content="{@interval};/omp?cmd=get_tasks&amp;refresh_interval={@interval}&amp;overrides={../get_tasks/apply_overrides}&amp;token={/envelope/token}" />
  </xsl:if>
</xsl:template>

<xsl:template name="indicator">
  <xsl:param name="status"/>
  <xsl:param name="status_text"/>
  <xsl:param name="command"/>
  <xsl:choose>
    <xsl:when test="substring($status, 1, 1) = '2'">
      <img src="/img/indicator_operation_ok.png"
           alt="Result of {$command}: {$status_text}"
           title="Result of {$command}: {$status_text}"
           style="margin-right:3px;"/>
    </xsl:when>
    <xsl:otherwise>
      <img src="/img/indicator_operation_failed.png"
           alt="Result of {$command}: {$status_text}"
           title="Result of {$command}: {$status_text}"
           style="margin-right:3px;"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- Manager indicators. -->

<xsl:template match="create_agent_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Agent'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_config_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Config'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_escalator_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Escalator'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_lsc_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_note_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Note'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_override_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Override'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Report Format'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_report_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Container Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_schedule_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Schedule'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_slave_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Slave'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_target_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Target'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_agent_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Agent'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_config_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Config'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_escalator_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Escalator'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_lsc_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_note_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Note'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_override_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Override'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Report Format'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_report_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Report'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_schedule_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Schedule'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_slave_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Slave'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_target_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Target'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="empty_trashcan_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Empty Trashcan'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_overrides_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Get Overrides'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_reports_escalate_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Escalate'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_reports_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Get Report'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_results_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Get Result'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_system_reports_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Get System Reports'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="gsad_msg" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="@operation"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_lsc_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_note_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Modify Note'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_override_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Modify Override'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Modify Report Format'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="restore_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Restore'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="start_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Start Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="stop_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Stop Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="pause_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Pause Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="resume_paused_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Resume Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="resume_stopped_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Resume Stopped Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="test_escalator_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Test Escalator'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="verify_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Verify Report Format'"/>
  </xsl:call-template>
</xsl:template>

<!-- Administrator indicators. -->

<xsl:template match="create_user_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create User'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_user_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete User'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_settings_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Edit Settings'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_auth_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Modify Auth'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_settings_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Settings'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_user_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save User'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="sync_feed_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Synchronization with NVT Feed'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="html-gsa-logo">
  <xsl:param name="username"/>
  <xsl:param name="time"/>
  <div class="gsa-logo-header">
    <div class="logo_l">
      <a href="/omp?cmd=get_tasks&amp;overrides=1&amp;token={/envelope/token}" title="Greenbone Security Assistant">
        <img src="/img/style/logo_l.png" alt="Greenbone Security Assistant"/>
      </a>
    </div>
    <div class="logo_r"></div>
    <div class="logo_m">
      <div class="logout_panel">
        <xsl:choose>
          <xsl:when test="$username = ''">
          </xsl:when>
          <xsl:otherwise>
            Logged in as <b><xsl:value-of select="$username"/></b> |
          </xsl:otherwise>
        </xsl:choose>
        <a href="/logout?token={/envelope/token}" title="Logout" style="margin-left:3px;">Logout</a>
        <br/>
        <br/>
        <xsl:value-of select="$time"/> (UTC)
      </div>
      <div class="status_panel">
        <xsl:apply-templates select="gsad_msg"
                             mode="response-indicator"/>

        <!-- Manager -->
        <xsl:apply-templates select="commands_response/create_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_lsc_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_lsc_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_lsc_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_task/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_lsc_credential/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalator/commands_response/delete_escalator_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalator/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalators/create_escalator_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalators/commands_response/delete_escalator_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalators/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_escalators/test_escalator_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_lsc_credential/commands_response/delete_lsc_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_lsc_credential/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/commands_response/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/commands_response/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/get_reports_escalate_response"
                             mode="response-indicator"/>
<!--
        <xsl:apply-templates select="get_report/get_reports_response"
                             mode="response-indicator"/>
-->
        <xsl:apply-templates select="get_report_format/commands_response/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/commands_response/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/commands_response/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/create_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/commands_response/verify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/commands_response/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/create_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/commands_response/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/commands_response/delete_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/commands_response/delete_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/create_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_system_reports/get_system_reports_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/commands_response/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/create_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/commands_response/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/modify_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/start_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/stop_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/pause_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/resume_paused_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/commands_response/resume_stopped_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_escalator_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_lsc_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/empty_trashcan_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/restore_response"
                             mode="response-indicator"/>

        <!-- Administrator -->
        <xsl:apply-templates select="commands_response/create_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_auth_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_settings_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/sync_feed_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_settings/get_settings_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_settings/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/modify_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_settings/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/gsad_msg"
                             mode="response-indicator"/>

        <a href="/help/javascript.html?token={/envelope/token}" title="Greenbone Security Assistant">
          <script type="text/javascript">
            document.write ("&lt;img src=\"/img/indicator_js.png\" alt=\"JavaScript is active\" title=\"JavaScript is active\"/&gt;");
          </script>
          <noscript></noscript>
        </a>
      </div>
    </div>
  </div>
  <br clear="all"/>
</xsl:template>

<xsl:template name="html-footer">
  <div class="gsa_footer">
    Greenbone Security Assistant (GSA) Copyright 2009-2011 by Greenbone Networks
    GmbH, <a href="http://www.greenbone.net">www.greenbone.net</a>
  </div>
</xsl:template>

<xsl:template name="html-gsa-navigation">
  <div class="gb_window" style="width:170px;">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Navigation</div>
    <div class="gb_window_part_content_no_pad">
      <div id="nav">
        <ul>
          <li>
            Scan Management
            <ul>
              <li><a href="/omp?cmd=get_tasks&amp;overrides=1&amp;token={/envelope/token}">Tasks</a></li>
              <li><a href="/omp?cmd=new_task&amp;overrides=1&amp;token={/envelope/token}">New Task</a></li>
              <li><a href="/omp?cmd=get_notes&amp;token={/envelope/token}">Notes</a></li>
              <li><a href="/omp?cmd=get_overrides&amp;token={/envelope/token}">Overrides</a></li>
              <li><a href="/omp?cmd=get_system_reports&amp;duration=86400&amp;slave_id=0&amp;token={/envelope/token}">Performance</a></li>
            </ul>
          </li>
          <li>
            Configuration
            <ul>
              <li><a href="/omp?cmd=get_configs&amp;token={/envelope/token}">Scan Configs</a></li>
              <li><a href="/omp?cmd=get_targets&amp;token={/envelope/token}">Targets</a></li>
              <li><a href="/omp?cmd=get_lsc_credentials&amp;token={/envelope/token}">Credentials</a></li>
              <li><a href="/omp?cmd=get_agents&amp;token={/envelope/token}">Agents</a></li>
              <li><a href="/omp?cmd=get_escalators&amp;token={/envelope/token}">Escalators</a></li>
              <li><a href="/omp?cmd=get_schedules&amp;token={/envelope/token}">Schedules</a></li>
              <li><a href="/omp?cmd=get_report_formats&amp;token={/envelope/token}">Report Formats</a></li>
              <li><a href="/omp?cmd=get_slaves&amp;token={/envelope/token}">Slaves</a></li>
            </ul>
          </li>
          <li>
            Administration
            <ul>
              <li><a href="/oap?cmd=get_users&amp;token={/envelope/token}">Users</a></li>
              <li><a href="/oap?cmd=get_feed&amp;token={/envelope/token}">NVT Feed</a></li>
              <li><a href="/oap?cmd=get_settings&amp;token={/envelope/token}">Settings</a></li>
            </ul>
          </li>
          <li>
            Miscellaneous
            <ul>
              <li><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">Trashcan</a></li>
            </ul>
          </li>
          <li>
            Help
            <ul>
              <li><a href="/help/contents.html?token={/envelope/token}">Contents</a></li>
              <li><a href="/help/about.html?token={/envelope/token}">About</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

<!-- DIALOGS -->

<xsl:template name="error_dialog">
  <xsl:param name="title">(Missing title)</xsl:param>
  <xsl:param name="message">(Missing message)</xsl:param>
  <xsl:param name="backurl">/omp?cmd=get_tasks&amp;overrides=1</xsl:param>
  <xsl:param name="token"></xsl:param>
  <center>
    <div class="envelope" style="width:500px;">
      <div class="gb_window" style="margin-top:150px;">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">Error Message</div>
        <div class="gb_window_part_content_error" style="text-align:center;">
          <div class="float_right">
            <a href="/help/error_messages.html?token={$token}" title="Help: Error Message">
              <img src="/img/help.png"/>
            </a>
          </div>
          <br/>
          <img src="/img/alert_sign.png" alt="" title="{$title}"
               style="float:left;margin-left:10px;"/>
          <span style="font-size:16px;">
            <div style="font-weight:bold;padding-top:12px;font-size:20px;">
              <xsl:value-of select="$title"/>
            </div>
            <br clear="all"/>
            <xsl:value-of select="$message"/>
          </span>
          <div style="margin-top:10px;">
            Your options (not all may work):<br/>
            'Back' button of browser
            <xsl:choose>
              <xsl:when test="string-length ($token) &gt; 0">
                | <a href="{$backurl}&amp;token={$token}">Assumed sane state</a>
                | <a href="/logout?token={$token}">Logout</a>
              </xsl:when>
              <xsl:otherwise>
                | <a href="/login/login.html">Login</a>
              </xsl:otherwise>
            </xsl:choose>
          </div>
        </div>
      </div>
      <xsl:call-template name="html-footer"/>
    </div>
  </center>
</xsl:template>

<!-- GSAD_RESPONSE -->

<xsl:template match="gsad_response">
  <xsl:call-template name="error_dialog">
    <xsl:with-param name="title">
      <xsl:value-of select="title"/>
    </xsl:with-param>
    <xsl:with-param name="message">
      <xsl:value-of select="message"/>
    </xsl:with-param>
    <xsl:with-param name="backurl">
      <xsl:value-of select="backurl"/>
    </xsl:with-param>
    <xsl:with-param name="token">
      <xsl:value-of select="token"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- COMMON TEMPLATES -->

<xsl:template name="command_result_dialog">
  <xsl:param name="operation">(Operation description is missing)</xsl:param>
  <xsl:param name="status">(Status code is missing)</xsl:param>
  <xsl:param name="msg">(Status message is missing)</xsl:param>
  <xsl:param name="details"></xsl:param>

  <xsl:choose>
    <xsl:when test="$status = '200' or $status = '201' or $status = '202'">
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">
          Results of last operation
        </div>

        <div class="gb_window_part_content_no_pad">
          <div style="text-align:left;">
            <table>
              <xsl:choose>
                <xsl:when test="$operation = ''">
                </xsl:when>
                <xsl:otherwise>
                  <tr>
                    <td>Operation:</td>
                    <td><xsl:value-of select="$operation"/></td>
                  </tr>
                </xsl:otherwise>
              </xsl:choose>

              <xsl:choose>
                <xsl:when test="$status = ''">
                </xsl:when>
                <xsl:otherwise>
                  <tr>
                    <td>Status code:</td>
                    <td><xsl:value-of select="$status"/></td>
                  </tr>
                </xsl:otherwise>
              </xsl:choose>

              <tr>
                <td>Status message:</td>
                <td><xsl:value-of select="$msg"/></td>
              </tr>
            </table>

            <xsl:choose>
              <xsl:when test="$details = ''">
              </xsl:when>
              <xsl:otherwise>
                <table><tr><td><xsl:value-of select="$details"/></td></tr></table>
              </xsl:otherwise>
            </xsl:choose>

          </div>
        </div>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- OMP -->

<xsl:include href="omp.xsl"/>

<!-- OAP -->

<xsl:include href="oap.xsl"/>

<!-- Help -->

<xsl:include href="help.xsl"/>

<!-- Login page -->

<xsl:template match="login_page">
  <div style="width:315px;margin-top:5px;">
    <div class="gb_window">
      <div class="gb_window_part_left"></div>
      <div class="gb_window_part_right"></div>
      <div class="gb_window_part_center">Greenbone Security Assistant</div>
      <div class="gb_window_part_content">
        <img src="/img/gsa_splash.png" alt="" />
        <center>
          <div style="color: red"><xsl:value-of select="message"/></div>
          <form action="/omp" method="post" enctype="multipart/formdata">
            <input type="hidden" name="cmd" value="login" />
            <xsl:choose>
              <xsl:when test="string-length(url) = 0">
                <input type="hidden" name="text" value="/omp?cmd=get_tasks&amp;overrides=1" />
              </xsl:when>
              <xsl:otherwise>
                <input type="hidden" name="text" value="{url}" />
              </xsl:otherwise>
            </xsl:choose>
            <table>
              <tr>
                <td>Username</td>
                <td><input type="text" autocomplete="off" name="login" value="" /></td>
              </tr>
              <tr>
                <td>Password</td>
                <td><input type="password" autocomplete="off" name="password" value="" /></td>
              </tr>
            </table>
            <div style="text-align:center;float:center;"><input type="submit" value="Login" /></div>
            <br clear="all" />
          </form>
        </center>
      </div>
    </div>
  </div>
</xsl:template>

<!-- ROOT, ENVELOPE -->

<xsl:template match="caller">
</xsl:template>

<xsl:template match="token">
</xsl:template>

<xsl:template match="login">
</xsl:template>

<xsl:template match="time">
</xsl:template>

<xsl:template match="envelope">
  <div class="envelope">
    <xsl:call-template name="html-gsa-logo">
      <xsl:with-param name="username">
        <xsl:value-of select="login/text()"/>
      </xsl:with-param>
      <xsl:with-param name="time">
        <xsl:value-of select="time"/>
      </xsl:with-param>
    </xsl:call-template>
    <table width="100%" cellpadding="3" cellspacing="0">
      <tr>
        <td valign="top" width="1">
          <xsl:call-template name="html-gsa-navigation"/>
        </td>
        <td valign="top">
          <xsl:apply-templates/>
        </td>
      </tr>
    </table>
    <xsl:call-template name="html-footer"/>
  </div>
</xsl:template>

<xsl:template match="/">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <xsl:call-template name="html-head"/>
    <body>
      <center>
        <xsl:apply-templates/>
      </center>
    </body>
  </html>
</xsl:template>

</xsl:stylesheet>
