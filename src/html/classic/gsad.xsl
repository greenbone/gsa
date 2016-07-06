<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:func = "http://exslt.org/functions"
    xmlns:gsa="http://openvas.org"
    xmlns:gsa-i18n="http://openvas.org/i18n"
    xmlns:exslt="http://exslt.org/common"
    xmlns="http://www.w3.org/1999/xhtml"
    extension-element-prefixes="func exslt gsa gsa-i18n">
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
Karl-Heinz Ruskowski <khruskowski@intevation.de>
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2009, 2010, 2012-2016 Greenbone Networks GmbH

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

<!-- GLOBAL VARIABLES -->
<!-- language code, needed where /envelope is not available -->
<xsl:variable name="i18n_language" select="(/envelope | /login_page)/i18n"/>
<!-- first language code in HTML attribute form -->
<xsl:variable name="html-lang">
  <xsl:choose>
    <xsl:when test="contains ($i18n_language, ':')">
      <xsl:value-of select="translate (substring-before ($i18n_language, ':'), '_', '-')"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="translate ($i18n_language, '_', '-')"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:variable>

<!-- XPATH FUNCTIONS -->

<!--
  The following functions are defined as extensions of libxslt:
    gsa-i18n:gettext (language, msgid, [context])
    gsa-i18n:ngettext (language, msgid, msgid_plural, count, [context])
    gsa-i18n:strformat (format_string, [insert_1], [insert_2], ...)
-->

<func:function name="gsa:i18n">
  <xsl:param name="id"/>
  <xsl:param name="context"/>
  <xsl:param name="default" select="$id"/>

  <xsl:choose>
    <xsl:when test="function-available('gsa-i18n:gettext')">
      <!-- Use new gettext extension based i18n -->
      <xsl:variable name="new_msg" select="gsa-i18n:gettext ($i18n_language, $id, $context)"/>
      <func:result>
        <xsl:choose>
          <xsl:when test="$new_msg != '### N/A ###'">
            <xsl:value-of select="$new_msg"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$default"/>
          </xsl:otherwise>
        </xsl:choose>
      </func:result>
    </xsl:when>
    <xsl:otherwise>
      <func:result>
        <xsl:value-of select="$default"/>
      </func:result>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:n-i18n">
  <xsl:param name="id"/>
  <xsl:param name="id_plural"/>
  <xsl:param name="count"/>
  <xsl:param name="context"/>
  <xsl:param name="default" select="$id"/>
  <xsl:param name="default_plural" select="$id_plural"/>

  <xsl:choose>
    <xsl:when test="function-available('gsa-i18n:ngettext')">
      <!-- Use new gettext extension based i18n -->
      <xsl:variable name="new_msg" select="gsa-i18n:ngettext ($i18n_language, $id, $id_plural, $count, $context)"/>
      <func:result>
        <xsl:choose>
          <xsl:when test="$new_msg != '### N/A ###'">
            <xsl:value-of select="$new_msg"/>
          </xsl:when>
          <xsl:when test="$new_msg = '### N/A ###' and $count != 1">
            <xsl:value-of select="$default_plural"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$default"/>
          </xsl:otherwise>
        </xsl:choose>
      </func:result>
    </xsl:when>
    <xsl:when test="$count &gt; 1">
      <!-- fall back to default plural -->
      <func:result>
        <xsl:value-of select="$default_plural"/>
      </func:result>
    </xsl:when>
    <xsl:otherwise>
      <!-- fall back to default singular -->
      <func:result>
        <xsl:value-of select="$default"/>
      </func:result>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<!-- HEADERS, FOOTER, SIDEBARS -->

<xsl:template name="html-head">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <link rel="icon" href="/img/favicon.gif" type="image/gif"/>
    <title>Greenbone Security Assistant</title>
    <link rel="stylesheet" type="text/css" href="/css/gsa-base.css"/>
    <xsl:choose>
      <xsl:when test="/login_page != ''">
        <link rel="stylesheet" type="text/css" href="/css/gsa-login.css"/>
      </xsl:when>
      <xsl:otherwise>
        <link rel="stylesheet" type="text/css" href="/css/select2.min.css"/>
        <link rel="stylesheet" type="text/css" href="/css/jquery-ui.structure.min.css"/>
        <link rel="stylesheet" type="text/css" href="/css/jquery-ui.theme.min.css"/>
        <link rel="stylesheet" type="text/css" href="/css/gsa-style.css"/>
        <script src="/js/jquery-2.1.4.js" type="text/javascript"></script>
        <script src="/js/jquery-ui.js" type="text/javascript"></script>
        <script src="/js/select2.js" type="text/javascript"></script>
        <script src="/js/i18next-2.3.4.js" type="text/javascript"></script>
        <script src="/js/i18next-xhr-0.5.3.js" type="text/javascript"></script>
        <script src="/js/i18next-languagedetector-0.2.2.js" type="text/javascript"></script>
        <script src="/js/greenbone-ui.js" type="text/javascript"></script>
        <script src="/js/greenbone.js" type="text/javascript"></script>
        <xsl:apply-templates select="envelope/autorefresh" mode="html-header-meta" />
      </xsl:otherwise>
    </xsl:choose>
  </head>
</xsl:template>

<!-- Add meta refresh info if autorefresh element present -->
<xsl:template match="autorefresh" mode="html-header-meta">
  <xsl:variable name="cmd" select="name(/envelope/*[starts-with (name(), 'get_')])"/>
  <xsl:if test="starts-with ($cmd, 'get_') and substring ($cmd, 1) and ($cmd = 'get_task' or substring ($cmd, string-length ($cmd), 1) = 's') and ($cmd != 'get_my_settings') and ($cmd != 'get_system_reports') and (count (//gsad_msg) = 0) and (count (//gsad_response) = 0)">
    <script type="text/javascript">
    window.autorefresh_enabled = true;
    </script>
  </xsl:if>
</xsl:template>

<!-- TODO: Add i18n for fixed "Result of " string and $command -->
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

<xsl:template match="action_status" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="text()"/>
    <xsl:with-param name="status_text" select="../action_message"/>
    <xsl:with-param name="command" select="../prev_action"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_agent_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Agent'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_asset_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Asset'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_config_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Config'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_alert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Alert'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_filter_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Filter'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_group_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Group'"/>
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

<xsl:template match="create_permission_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Permission'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_port_list_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Port List'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_port_range_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Port Range'"/>
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
    <xsl:with-param name="command" select="'Create Report'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_role_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Role'"/>
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

<xsl:template match="create_tag_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Create Tag'"/>
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

<xsl:template match="delete_alert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Alert'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_asset_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Asset'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_filter_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Filter'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_group_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Group'"/>
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

<xsl:template match="delete_permission_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Permission'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_port_list_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Port List'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_port_range_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Port Range'"/>
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

<xsl:template match="delete_role_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Role'"/>
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

<xsl:template match="delete_tag_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Delete Tag'"/>
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

<xsl:template match="get_reports_alert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Alert'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_reports_response" mode="response-indicator-alert">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Run Alert'"/>
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

<xsl:template match="modify_agent_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Agent'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_alert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Alert'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_credential_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Credential'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_filter_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Filter'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_group_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Group'"/>
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

<xsl:template match="modify_permission_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Permission'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_port_list_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Port List'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Modify Report Format'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_role_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Role'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_scanner_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Scanner'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_schedule_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Schedule'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_slave_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Slave'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_tag_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Tag'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_target_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Target'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="modify_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Save Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="move_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Move Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="restore_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Restore'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="run_wizard_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Run Wizard'"/>
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

<xsl:template match="sync_config_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Sync Config'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="resume_task_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Resume Task'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="test_alert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Test Alert'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="verify_agent_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Verify Agent'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="verify_report_format_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Verify Report Format'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="verify_scanner_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Verify Scanner'"/>
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
    <xsl:with-param name="command" select="'Save Auth'"/>
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

<xsl:template match="sync_scap_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Synchronization with SCAP Feed'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template match="sync_cert_response" mode="response-indicator">
  <xsl:call-template name="indicator">
    <xsl:with-param name="status" select="@status"/>
    <xsl:with-param name="status_text" select="@status_text"/>
    <xsl:with-param name="command" select="'Synchronization with CERT Feed'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="html-gsa-logo">
  <xsl:param name="username"/>
  <xsl:param name="time"/>
  <div id="gb_header">
    <div class="logo">
      <a href="/omp?token={/envelope/token}" title="Dashboard">
        <img src="/img/style/gsa-logo.png" alt="Greenbone Security Assistant" width="202" height="40"/>
      </a>
    </div>
    <div>
      <div class="logout_panel">
        <xsl:value-of select="gsa:i18n('Logged in as', 'Logo')"/>&#160;
        <xsl:value-of select="/envelope/role"/>&#160;
        <b><a href="/omp?cmd=get_my_settings&amp;token={/envelope/token}">
        <xsl:choose>
          <xsl:when test="$username = ''">
          </xsl:when>
          <xsl:when test="string-length ($username) &gt; 45">
            <xsl:value-of select="substring ($username, 1, 45)"/>...
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$username"/>
          </xsl:otherwise>
        </xsl:choose>
        </a></b> |
        <a href="/logout?token={/envelope/token}" title="{gsa:i18n('Logout', 'Action Verb')}" style="margin-left:3px;">
          <xsl:value-of select="gsa:i18n('Logout', 'Action Verb')"/>
        </a>
        <div><xsl:value-of select="$time"/></div>
      </div>
      <div class="pull-right">
        <select id="autorefresh">
          <option value="0"><xsl:value-of select="gsa:i18n('No auto-refresh')"/></option>
          <option value="30"><xsl:value-of select="gsa:i18n('Refresh every 30 Sec.')"/></option>
          <option value="60"><xsl:value-of select="gsa:i18n('Refresh every 60 Sec.')"/></option>
          <option value="120"><xsl:value-of select="gsa:i18n('Refresh every 2 Min.')"/></option>
          <option value="300"><xsl:value-of select="gsa:i18n('Refresh every 5 Min.')"/></option>
        </select>
      </div>
      <div class="status_panel">
        <xsl:apply-templates select="gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="/envelope/params/action_status"
                             mode="response-indicator"/>
        <!-- Manager -->
        <xsl:apply-templates select="commands_response/create_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="move_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/move_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/delete_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/create_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/start_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/stop_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_task/resume_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/create_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/create_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config/commands_response/delete_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_configs/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_configs/delete_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_config_response/sync_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_configs/sync_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/modify_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credentials/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credentials/modify_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/commands_response/delete_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credentials/delete_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_alert/modify_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_credential/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_filter/modify_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_group/modify_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_role/modify_role_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_tag/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_tag/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_task/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_note/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_override/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_permission/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_port_list/create_port_range_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_port_list/delete_port_range_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_port_list/modify_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_role/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_role/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="edit_user/modify_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agents/commands_response/verify_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/create_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agents/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/modify_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agents/modify_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agents/verify_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agent/commands_response/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_agents/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/commands_response/delete_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/create_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/modify_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alert/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/modify_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/create_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/delete_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_alerts/test_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_assets/delete_asset_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/create_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_credential/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_delta_result/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_delta_result/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_delta_result/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/delete_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/modify_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filter/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filters/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filters/delete_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_filters/modify_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/create_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/delete_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/modify_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_group/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_groups/create_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_groups/delete_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_groups/modify_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_info/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_info/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_info/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_note/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_notes/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_nvts/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_override/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_overrides/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permission/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permission/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permission/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permission/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permissions/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permissions/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_permissions/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_lists/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_lists/create_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_lists/commands_response/delete_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/create_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/modify_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_lists/modify_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/create_port_range_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_list/commands_response/delete_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_port_lists/delete_port_list_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/create_asset_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/delete_asset_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/get_reports_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_reports/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_reports/delete_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/create_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/commands_response/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/create_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/modify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_format/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_formats/verify_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_scanner/verify_scanner_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_scanners/verify_scanner_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_scanner/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_scanner/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_scanner/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_summary_response/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_summary_response/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_summary_response/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_report_summary_response/get_report/get_reports_alert_response/get_reports_response"
                             mode="response-indicator-alert"/>
        <xsl:apply-templates select="get_result/commands_response/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/create_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/commands_response/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/create_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/commands_response/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/commands_response/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_result/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_role/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_role/delete_role_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_roles/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_roles/delete_role_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/commands_response/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/create_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/create_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/commands_response/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/modify_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedule/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/modify_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_schedules/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/modify_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/create_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slave/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/modify_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_slaves/delete_slave_response"
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
        <xsl:apply-templates select="get_tag/commands_response/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tag/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tags/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tags/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tags/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tags/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tags/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/commands_response/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/create_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/delete_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/modify_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/create_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/modify_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/modify_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_targets/modify_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_target/modify_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/modify_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/start_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/stop_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/resume_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_agent_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_alert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_credential_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_note_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_override_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_role_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_target_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/delete_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/empty_trashcan_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_trash/restore_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_tasks/run_wizard_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_user/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_user/create_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/create_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/delete_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/modify_user_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_user/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_user/delete_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_user/modify_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/modify_auth_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_config/create_config_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_container_task/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_filter/create_filter_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_group/create_group_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_host/create_asset_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_permission/create_permission_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_role/create_role_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_report_format/create_report_format_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_schedule/create_schedule_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_slave/create_slave_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_tag/create_tag_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_tag/gsad_msg"
                             mode="response-indicator"/>
        <xsl:apply-templates select="upload_report/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_task/create_report_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_task/create_task_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="new_user/create_user_response"
                             mode="response-indicator"/>

        <!-- Administrator -->
        <xsl:apply-templates select="commands_response/sync_feed_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/sync_scap_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="commands_response/sync_cert_response"
                             mode="response-indicator"/>
        <xsl:apply-templates select="get_users/gsad_msg"
                             mode="response-indicator"/>

        <!-- Wizards -->
        <xsl:apply-templates select="wizard/run_wizard_response"
                             mode="response-indicator"/>

      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="print-node">
  <xsl:param name="node" select="."/>
  <xsl:param name="indent" select="0"/>
  <div style="margin-left: {$indent * 25}px">
    <xsl:text>&lt;</xsl:text>
    <xsl:value-of select="name ($node)"/>
    <xsl:for-each select="@*">
      <xsl:text> </xsl:text>
      <xsl:value-of select="name (.)"/>
      <xsl:text>="</xsl:text>
      <xsl:value-of select="."/>
      <xsl:text>"</xsl:text>
    </xsl:for-each>
    <xsl:text>&gt;</xsl:text>
  </div>
  <div style="margin-left: {$indent * 50}px">
    <xsl:value-of select="normalize-space ($node/text())"/>
  </div>
  <xsl:for-each select="*">
    <xsl:call-template name="print-node">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="indent" select="$indent + 1"/>
    </xsl:call-template>
  </xsl:for-each>
  <div style="margin-left: {$indent * 25}px">
    &lt;/<xsl:value-of select="name ($node)"/>&gt;
  </div>
</xsl:template>

<xsl:template name="html-footer">
  <div class="gsa-footer">
    <div class="pull-left">
      <xsl:choose>
        <xsl:when test="not (boolean (/envelope/backend_operation))"/>
        <xsl:when test="/envelope/backend_operation = 0"/>
        <xsl:otherwise>
          <xsl:value-of select="gsa:i18n ('Backend operation', 'Performance Timing')"/>: <xsl:value-of select="/envelope/backend_operation"/>s
        </xsl:otherwise>
      </xsl:choose>
      <span id="gsa-token" style="display: none;"><xsl:value-of select="/envelope/token"/></span>
    </div>
    Greenbone Security Assistant (GSA) Copyright 2009-2016 by Greenbone Networks
    GmbH, <a href="http://www.greenbone.net" target="_blank">www.greenbone.net</a>
  </div>
  <xsl:choose>
    <xsl:when test="/envelope/params/debug = '1'">
      <div style="text-align: left">
        <b>Params:</b>
        <br/>
        <xsl:for-each select="/envelope/params/*">
          <xsl:value-of select="name ()"/>:
          <xsl:value-of select="text ()"/>
          <br/>
        </xsl:for-each>
        <br/>
        <b>XML:</b>
        <xsl:call-template name="print-node">
          <xsl:with-param name="node" select="/"/>
        </xsl:call-template>
      </div>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="gsa-navigation-menu">
  <xsl:param name="items" xmlns=""/>
  <xsl:param name="menu_title"/>

  <xsl:variable name="token" select="/envelope/token"/>
  <xsl:variable name="count" select="count (exslt:node-set ($items)/item)"/>

  <xsl:choose>
    <xsl:when test="$count = 0">
      <div class="empty_top_button"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="first_item" select="exslt:node-set ($items)/item[1]"/>
      <xsl:variable name="first_url">
        <xsl:choose>
          <xsl:when test="$first_item/url">
            <xsl:value-of select="$first_item/url"/>
          </xsl:when>
          <xsl:when test="boolean (filter)">
            <xsl:value-of select="concat ('/omp?cmd=', $first_item/page, '&amp;filter=', $first_item/filter, '&amp;token=', $token)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="concat ('/omp?cmd=', $first_item/page, '&amp;token=', $token)"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <a class="top_button" href="{$first_url}">
        <xsl:value-of select="$menu_title"/>
        <div class="first_button_overlay">
          <ul class="first_button_overlay">
            <xsl:choose>
              <xsl:when test="$count = 1">
                <li class="first_button_overlay overlay_last">
                  <xsl:value-of select="exslt:node-set ($items)/item/name"/>
                </li>
              </xsl:when>
              <xsl:otherwise>
                <li class="first_button_overlay">
                  <xsl:value-of select="exslt:node-set ($items)/item/name"/>
                </li>
              </xsl:otherwise>
            </xsl:choose>
          </ul>
        </div>
      </a>
      <ul>
        <li class="pointy"></li>
        <xsl:for-each select="exslt:node-set ($items)/*">
          <xsl:if test="name (.) = 'item'">
            <xsl:variable name="divider">
              <xsl:if test="name (preceding-sibling::node ()[1]) = 'divider'">
                <xsl:text>section_start</xsl:text>
              </xsl:if>
            </xsl:variable>
            <xsl:variable name="url">
              <xsl:choose>
                <xsl:when test="url">
                  <xsl:value-of select="url"/>
                </xsl:when>
                <xsl:when test="boolean (filter)">
                  <xsl:value-of select="concat ('/omp?cmd=', page, '&amp;filter=', filter, '&amp;token=', $token)"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="concat ('/omp?cmd=', page, '&amp;token=', $token)"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <xsl:choose>
              <xsl:when test="position() = last() or $count = 1">
                <li class="last {$divider} {class}"><a href="{$url}"><xsl:value-of select="name"/></a></li>
              </xsl:when>
              <xsl:when test="string-length (class) &gt; 0">
                <li class="{$divider} {class}"><a href="{$url}"><xsl:value-of select="name"/></a></li>
              </xsl:when>
              <xsl:otherwise>
                <li class="{$divider}"><a href="{$url}"><xsl:value-of select="name"/></a></li>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:if>
        </xsl:for-each>
      </ul>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-gsa-navigation">
  <xsl:variable name="token" select="/envelope/token"/>
  <div id="gb_menu" class="clearfix">
   <ul>
    <li>
      <a class="top_button"
          href="/omp?cmd=dashboard&amp;token={/envelope/token}">
        <img class="logo" src="/img/greenbone.svg"/>
        <xsl:value-of select="gsa:i18n ('Dashboard', 'Dashboard')"/>
      </a>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_TASKS') or gsa:may-op ('GET_REPORTS') or gsa:may-op ('GET_RESULTS') or gsa:may-op ('GET_NOTES') or gsa:may-op ('GET_OVERRIDES')">
          <item>
            <page>dashboard&amp;dashboard_name=scans</page>
            <name><xsl:value-of select="gsa:i18n ('Dashboard', 'Dashboard')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_TASKS')">
          <item>
            <page>get_tasks</page>
            <name><xsl:value-of select="gsa:i18n ('Tasks', 'Task')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORTS')">
          <item>
            <page>get_reports</page>
            <name><xsl:value-of select="gsa:i18n ('Reports', 'Report')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_RESULTS')">
          <item>
            <page>get_results</page>
            <name><xsl:value-of select="gsa:i18n ('Results', 'Result')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_NOTES')">
          <item>
            <page>get_notes</page>
            <name><xsl:value-of select="gsa:i18n ('Notes', 'Note')"/></name>
            <filter>sort=nvt</filter>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_OVERRIDES')">
          <item>
            <page>get_overrides</page>
            <name><xsl:value-of select="gsa:i18n ('Overrides', 'Override')"/></name>
            <filter>sort=nvt</filter>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Scans', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_ASSETS')">
          <item>
            <page>dashboard&amp;dashboard_name=assets</page>
            <name><xsl:value-of select="gsa:i18n ('Dashboard', 'Dashboard')"/></name>
          </item>
          <divider/>
          <item>
            <page>get_assets&amp;asset_type=host</page>
            <name><xsl:value-of select="gsa:i18n ('Hosts', 'Host')"/></name>
          </item>
          <item>
            <page>get_assets&amp;asset_type=os</page>
            <name><xsl:value-of select="gsa:i18n ('Operating Systems', 'Operating System')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORTS')">
          <item>
            <page>get_report&amp;type=assets&amp;apply_overrides=1&amp;levels=hm</page>
            <name><xsl:value-of select="gsa:i18n ('Hosts (Classic)', 'Host')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Assets', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_INFO')">
          <item>
            <page>dashboard&amp;dashboard_name=secinfo</page>
            <name><xsl:value-of select="gsa:i18n ('Dashboard', 'Dashboard')"/></name>
          </item>
          <divider/>
          <item>
            <page>get_info&amp;info_type=nvt</page>
            <name><xsl:value-of select="gsa:i18n ('NVTs', 'NVT')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cve</page>
            <name><xsl:value-of select="gsa:i18n ('CVEs', 'CVE')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cpe</page>
            <name><xsl:value-of select="gsa:i18n ('CPEs', 'CPE')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=ovaldef</page>
            <name><xsl:value-of select="gsa:i18n ('OVAL Definitions', 'OVAL Definition')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cert_bund_adv</page>
            <name><xsl:value-of select="gsa:i18n ('CERT-Bund Advisories', 'CERT-Bund Advisory')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=dfn_cert_adv</page>
            <name><xsl:value-of select="gsa:i18n ('DFN-CERT Advisories', 'DFN-CERT Advisory')"/></name>
          </item>
          <divider/>
          <item>
            <page>get_info&amp;info_type=allinfo</page>
            <name><xsl:value-of select="gsa:i18n ('All SecInfo', 'All SecInfo Information')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('SecInfo', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_TARGETS')">
          <item>
            <page>get_targets</page>
            <name><xsl:value-of select="gsa:i18n ('Targets', 'Target')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_PORT_LISTS')">
          <item>
            <page>get_port_lists</page>
            <name><xsl:value-of select="gsa:i18n ('Port Lists', 'Port List')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_CREDENTIALS')">
          <item>
            <page>get_credentials</page>
            <name><xsl:value-of select="gsa:i18n ('Credentials', 'Credential')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_CONFIGS')">
          <item>
            <page>get_configs</page>
            <name><xsl:value-of select="gsa:i18n ('Scan Configs', 'Scan Config')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_ALERTS')">
          <item>
            <page>get_alerts</page>
            <name><xsl:value-of select="gsa:i18n ('Alerts', 'Alert')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SCHEDULES')">
          <item>
            <page>get_schedules</page>
            <name><xsl:value-of select="gsa:i18n ('Schedules', 'Schedule')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORT_FORMATS')">
          <item>
            <page>get_report_formats</page>
            <name><xsl:value-of select="gsa:i18n ('Report Formats', 'Report Format')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SLAVES')">
          <item>
            <page>get_slaves</page>
            <name><xsl:value-of select="gsa:i18n ('Slaves', 'Slave')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_AGENTS')">
          <item>
            <page>get_agents</page>
            <name><xsl:value-of select="gsa:i18n ('Agents', 'Agent')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_SCANNERS')">
          <item>
            <page>get_scanners</page>
            <name><xsl:value-of select="gsa:i18n ('Scanners', 'Scanner')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_FILTERS')">
          <item>
            <page>get_filters</page>
            <name><xsl:value-of select="gsa:i18n ('Filters', 'Filter')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_TAGS')">
          <item>
            <page>get_tags</page>
            <name><xsl:value-of select="gsa:i18n ('Tags', 'Tag')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_PERMISSIONS')">
          <item>
            <page>get_permissions</page>
            <name><xsl:value-of select="gsa:i18n ('Permissions', 'Permission')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Configuration', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-get-trash ()">
          <item>
            <page>get_trash</page>
            <name><xsl:value-of select="gsa:i18n ('Trashcan', 'Trashcan')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SETTINGS')">
          <item>
            <page>get_my_settings</page>
            <name><xsl:value-of select="gsa:i18n ('My Settings', 'My Settings')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SYSTEM_REPORTS')">
          <item>
            <page>get_system_reports&amp;duration=86400&amp;slave_id=0</page>
            <name><xsl:value-of select="gsa:i18n ('Performance', 'Performance')"/></name>
          </item>
        </xsl:if>
        <item>
          <page>cvss_calculator</page>
          <name><xsl:value-of select="gsa:i18n ('CVSS Calculator', 'CVSS Calculator')"/></name>
        </item>
        <xsl:if test="gsa:may-op ('DESCRIBE_FEED') or gsa:may-op ('DESCRIBE_SCAP') or gsa:may-op ('DESCRIBE_CERT')">
          <item>
            <page>get_feeds</page>
            <name><xsl:value-of select="gsa:i18n ('Feed Status', 'Main menu')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Extras', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_USERS')">
          <item>
            <page>get_users</page>
            <name><xsl:value-of select="gsa:i18n ('Users', 'User')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_GROUPS')">
          <item>
            <page>get_groups</page>
            <name><xsl:value-of select="gsa:i18n ('Groups', 'Group')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_ROLES')">
          <item>
            <page>get_roles</page>
            <name><xsl:value-of select="gsa:i18n ('Roles', 'Role')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('DESCRIBE_FEED')">
          <divider/>
          <item>
            <page>auth_settings&amp;name=ldap</page>
            <name><xsl:value-of select="gsa:i18n ('LDAP', 'Main menu')"/></name>
          </item>
          <item>
            <page>auth_settings&amp;name=radius</page>
            <name><xsl:value-of select="gsa:i18n ('Radius', 'Main menu')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Administration', 'Main Menu')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <item>
          <url><xsl:value-of select="concat ('/help/contents.html?token=',$token)"/></url>
          <name><xsl:value-of select="gsa:i18n ('Contents', 'Help')"/></name>
        </item>
        <item>
          <url><xsl:value-of select="concat ('/help/about.html?token=',$token)"/></url>
          <name><xsl:value-of select="gsa:i18n ('About', 'Help')"/></name>
        </item>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Help', 'Help')"/>
      </xsl:call-template>
    </li>
   </ul>
  </div>
</xsl:template>

<!-- DIALOGS -->

<xsl:template name="error_window">
  <xsl:param name="heading">Error Message</xsl:param>
  <xsl:param name="message">(Missing message)</xsl:param>
  <xsl:param name="token"></xsl:param>
  <div class="panel panel-error">
    <div class="panel-heading">
      <xsl:value-of select="$heading"/>
    </div>
    <div class="panel-body">
<!--
      <div class="pull-right">
        <a href="/help/error_messages.html?token={$token}" title="Help: Error Message">
          <img src="/img/help.png"/>
        </a>
      </div>
      <span>
        <img src="/img/alert_sign.png" alt="" title="{$heading}"
             style="margin-left:10px; margin-top:10px; text-align:left;"/>
      </span>
-->
      <div style="width: 500px; margin: 0 auto;">
        <xsl:copy-of select="$message"/>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="error_dialog">
  <xsl:param name="title">(Missing title)</xsl:param>
  <xsl:param name="message">(Missing message)</xsl:param>
  <xsl:param name="backurl">/omp?cmd=get_tasks</xsl:param>
  <xsl:param name="token"></xsl:param>
  <div class="gsa-head">
    <xsl:call-template name="html-gsa-logo">
      <xsl:with-param name="username">
        <xsl:value-of select="login/text()"/>
      </xsl:with-param>
      <xsl:with-param name="time">
        <xsl:value-of select="time"/>
      </xsl:with-param>
    </xsl:call-template>
    <xsl:call-template name="html-gsa-navigation"/>
  </div>
  <div class="gsa-main">
    <div>
      <div class="panel panel-error">
        <div class="panel-heading">
          <h3 class="panel-title">Error Message</h3>
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="pull-right">
              <a href="/help/error_messages.html?token={$token}" title="Help: Error Message">
                <img src="/img/help.png"/>
              </a>
            </div>
            <img src="/img/alert_sign.png" alt="" title="{$title}"
              class="pull-left" style="margin-left:10px;"/>
            <h4>
              <xsl:value-of select="$title"/>
            </h4>
          </div>
          <p style="margin-top: 10px; font-size: 16px;">
            <xsl:value-of select="$message"/>
          </p>
        </div>
        <div class="panel-footer">
          Your options (not all may work):
          'Back' button of browser
          <xsl:choose>
            <xsl:when test="string-length ($token) &gt; 0">
              <xsl:choose>
                <xsl:when test="contains ($backurl, '?')">
                  | <a href="{$backurl}&amp;token={$token}">Assumed sane state</a>
                </xsl:when>
                <xsl:otherwise>
                  | <a href="{$backurl}?token={$token}">Assumed sane state</a>
                </xsl:otherwise>
              </xsl:choose>
              | <a href="/logout?token={$token}">Logout</a>
            </xsl:when>
            <xsl:otherwise>
              | <a href="/logout">Logout</a>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </div>
      <xsl:call-template name="html-footer"/>
    </div>
  </div>
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

<!-- TODO: Add i18n for fixed strings and $operation -->
<xsl:template name="command_result_dialog">
  <xsl:param name="operation">(Operation description is missing)</xsl:param>
  <xsl:param name="status">(Status code is missing)</xsl:param>
  <xsl:param name="msg">(Status message is missing)</xsl:param>
  <xsl:param name="details"></xsl:param>
  <xsl:param name="always-visible"></xsl:param>

  <xsl:choose>
    <xsl:when test="not ($always-visible) and ($status = '200' or $status = '201' or $status = '202')">
    </xsl:when>
    <xsl:otherwise>
      <div class="panel panel-error">
        <div class="panel-heading">
          <h3 class="panel-title">
            Results of last operation
          </h3>
        </div>

        <div class="panel-body">
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
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- OMP -->

<xsl:include href="omp.xsl"/>

<!-- Wizards -->

<xsl:include href="wizard.xsl"/>

<!-- Graphics -->

<xsl:include href="graphics.xsl"/>

<!-- Login page -->
<!-- Beware: This page has its own CSS -->

<xsl:template match="login_page">
 <div class="page-wrap">
  <header>
   <span class="title"><xsl:value-of select="gsa:i18n('Greenbone Security Assistant')"/></span>
   <span class="version">
     <xsl:choose>
       <xsl:when test="string-length (vendor_version) &gt; 0">
         <xsl:value-of select="vendor_version"/>
       </xsl:when>
       <xsl:otherwise>
          <xsl:text>Version </xsl:text>
         <xsl:value-of select="version"/>
       </xsl:otherwise>
     </xsl:choose>
   </span>
  </header>
  <div class="logo_box">
     <img src="/img/greenbone.svg" />
  </div>
  <div class="login-box">
    <xsl:choose>
      <xsl:when test="string-length (message) &gt; 0">
        <div class="box container">
          <div class="error_message">
            <xsl:value-of select="gsa:i18n (message, 'Login Message')"/>
          </div>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div class="box container invisible">
          <div>
            &#160; <!-- nbsp in order to keep the div even when no messages -->
          </div>
        </div>
      </xsl:otherwise>
    </xsl:choose>
    <div class="box container">
      <div class="logo col-3">
        <xsl:choose>
          <xsl:when test="alternate_label = 0">
            <img src="/img/login-label.png"/>
          </xsl:when>
          <xsl:otherwise>
            <img src="/img/label.png"/>
          </xsl:otherwise>
        </xsl:choose>
      </div>
      <div class="login col-9">
        <form action="/omp" method="post" class="form-horizontal">
          <input type="hidden" name="cmd" value="login" />
          <xsl:choose>
            <xsl:when test="string-length(url) = 0">
              <input type="hidden" name="text" value="/omp?r=1" />
            </xsl:when>
            <xsl:otherwise>
              <input type="hidden" name="text" value="{url}" />
            </xsl:otherwise>
          </xsl:choose>
          <div class="form-group">
            <label for="login" class="col-4 control-label"><xsl:value-of select="gsa:i18n('Username:')"/></label>
            <div class="col-8">
              <input type="text" autocomplete="off" id="login" name="login"
                value="" autofocus="autofocus" tabindex="1" class="form-control"/>
            </div>
          </div>
          <div class="form-group">
            <label for="password" class="control-label col-4"><xsl:value-of select="gsa:i18n('Password:')"/></label>
            <div class="col-8">
              <input type="password" class="form-control"
                    autocomplete="off" id="password" name="password" tabindex="2"
                    onkeydown="if (event.keyCode == 13) {{ this.form.submit(); login.disabled = password.disabled = true; return false; }}"/>
            </div>
          </div>
          <div class="form-group">
            <div class="col-6 offset-6 container">
              <input type="submit" class="col-12 button" tabindex="3" value="{gsa:i18n('Login')}" />
            </div>
          </div>
        </form>
      </div>
    </div>
    <xsl:if test="string-length (guest/username) &gt; 0">
      <div class="box container">
        <div class="col-6 offset-3">
          <xsl:choose>
            <xsl:when test="string-length(url) = 0">
              <a href="/omp?r=1&amp;token=guest" class="col-12 button" tabindex="4">
                <xsl:value-of select="gsa:i18n ('Login as a guest', 'Action Verb')"/>
              </a>
            </xsl:when>
            <xsl:otherwise>
              <a href="{url}&amp;token=guest" class="col-12 button" tabindex="4">
                <xsl:value-of select="gsa:i18n ('Login as a guest', 'Action Verb')"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </div>
    </xsl:if>
  </div>
 </div>
</xsl:template>

<!-- Action result -->
<xsl:template match="action_result">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation" select="action"/>
    <xsl:with-param name="status" select="status"/>
    <xsl:with-param name="msg" select="message"/>
    <xsl:with-param name="details"/>
    <xsl:with-param name="always-visible" select="1"/>
  </xsl:call-template>
</xsl:template>

<!-- ROOT, ENVELOPE -->

<xsl:template match="backend_operation">
</xsl:template>

<xsl:template match="client_address">
</xsl:template>

<xsl:template match="params">
</xsl:template>

<xsl:template match="caller">
</xsl:template>

<xsl:template match="current_page">
</xsl:template>

<xsl:template match="token">
</xsl:template>

<xsl:template match="version">
</xsl:template>

<xsl:template match="vendor_version">
</xsl:template>

<xsl:template match="login">
</xsl:template>

<xsl:template match="time">
</xsl:template>

<xsl:template match="timezone">
</xsl:template>

<xsl:template match="envelope/role">
</xsl:template>

<xsl:template match="i18n">
</xsl:template>

<xsl:template match="severity">
</xsl:template>

<xsl:template match="charts">
</xsl:template>

<xsl:template match="chart_preferences">
</xsl:template>

<xsl:template match="help_response">
</xsl:template>

<xsl:template match="envelope">
  <xsl:choose>
    <xsl:when test="params/cmd = 'get_aggregate' or params/cmd = 'get_tasks_chart'">
      <xsl:apply-templates/>
    </xsl:when>
    <xsl:otherwise>
      <div class="gsa-head">
        <xsl:call-template name="html-gsa-logo">
          <xsl:with-param name="username">
            <xsl:value-of select="login/text()"/>
          </xsl:with-param>
          <xsl:with-param name="time">
            <xsl:value-of select="time"/>
          </xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="html-gsa-navigation"/>
      </div>
      <div class="gsa-main">
        <xsl:apply-templates select="/envelope/params/action_status"/>
        <xsl:apply-templates/>
      </div>
      <xsl:call-template name="html-footer"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="password_warning">
  <div class="gb_window">
    <div class="gb_window_part_left_error"></div>
    <div class="gb_window_part_right_error"></div>
    <div class="gb_window_part_center_error">
      <xsl:value-of select="gsa:i18n ('Warning', 'Login Message')"/>
    </div>
    <div class="gb_window_part_content_error">
      <p>
        <xsl:value-of select="gsa:i18n ('Your current password does not comply with the password policy:', 'Login Message')"/><br/>
        <xsl:value-of select="text()"/>
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template match="/">
  <html lang="{$html-lang}">
    <xsl:call-template name="html-head"/>
    <body>
      <xsl:apply-templates/>
    </body>
  </html>
</xsl:template>

</xsl:stylesheet>
