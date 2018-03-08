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
      <xsl:variable name="new_msg">
        <xsl:choose test="string ($context)">
          <xsl:when test="$context != ''">
            <xsl:value-of select="gsa-i18n:gettext ($i18n_language, $id, $context)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="gsa-i18n:gettext ($i18n_language, $id)"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
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
      <xsl:variable name="new_msg">
        <xsl:choose test="string ($context)">
          <xsl:when test="$context != ''">
            <xsl:value-of select="gsa-i18n:ngettext ($i18n_language, $id, $id_plural, $count, $context)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="gsa-i18n:ngettext ($i18n_language, $id, $id_plural, $count)"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
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
        <script src="/js/moment.js" type="text/javascript"></script>
        <script src="/js/moment-timezone-with-data.js" type="text/javascript"></script>
        <script src="/js/greenbone-ui.js" type="text/javascript"></script>
        <script src="/js/greenbone.js" type="text/javascript"></script>
        <script src="/js/gsa_polyfill.js" type="text/javascript"></script>
        <xsl:apply-templates select="envelope/autorefresh" mode="html-header-meta" />
      </xsl:otherwise>
    </xsl:choose>
  </head>
</xsl:template>

<!-- Add meta refresh info if autorefresh element present -->
<xsl:template match="autorefresh" mode="html-header-meta">
  <xsl:variable name="cmd" select="name(/envelope/*[starts-with (name(), 'get_') or name() = 'dashboard'])"/>
  <xsl:if test="(starts-with ($cmd, 'get_')  or $cmd='dashboard') and substring ($cmd, 1) and ($cmd='dashboard' or $cmd = 'get_task' or substring ($cmd, string-length ($cmd), 1) = 's') and ($cmd != 'get_my_settings') and ($cmd != 'get_system_reports') and (count (//gsad_msg) = 0) and (count (//gsad_response) = 0)">
    <script type="text/javascript">
    window.autorefresh_enabled = true;
    </script>
  </xsl:if>
</xsl:template>

<xsl:template name="html-gsa-logo">
  <xsl:param name="username"/>
  <xsl:param name="time"/>
  <div id="gb_header">
    <div class="logo">
      <a href="/omp?token={/envelope/token}" title="Dashboard">
        <img src="/img/greenbone.svg" alt="Greenbone Security Assistant" class="greenbone-icon"/>
        <img src="/img/gsa.svg" alt="Greenbone Security Assistant" class="greenbone-text"/>
      </a>
    </div>
    <div>
      <div class="logout_panel">
        <xsl:value-of select="gsa:i18n('Logged in as')"/>&#160;
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
    Greenbone Security Assistant (GSA) Copyright 2009 - 2018 by Greenbone Networks
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
      <xsl:choose>
        <xsl:when test="number (/envelope/guest) or not(gsa:may-op ('GET_AGGREGATES')) or not(gsa:may-op ('GET_TASKS') or gsa:may-op ('GET_INFO'))">
          <div class="empty_top_button"/>
        </xsl:when>
        <xsl:otherwise>
          <a class="top_button"
              href="/omp?cmd=dashboard&amp;token={/envelope/token}">
            <img class="logo" src="/img/greenbone.svg"/>
            <xsl:value-of select="gsa:i18n ('Dashboard')"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_AGGREGATES') and (gsa:may-op ('GET_TASKS') or gsa:may-op ('GET_REPORTS') or gsa:may-op ('GET_RESULTS') or gsa:may-op ('GET_NOTES') or gsa:may-op ('GET_OVERRIDES'))">
          <item>
            <page>dashboard&amp;dashboard_name=scans</page>
            <name><xsl:value-of select="gsa:i18n ('Dashboard')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_TASKS')">
          <item>
            <page>get_tasks</page>
            <name><xsl:value-of select="gsa:i18n ('Tasks')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORTS')">
          <item>
            <page>get_reports</page>
            <name><xsl:value-of select="gsa:i18n ('Reports')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_RESULTS')">
          <item>
            <page>get_results</page>
            <name><xsl:value-of select="gsa:i18n ('Results')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_NOTES')">
          <item>
            <page>get_notes</page>
            <name><xsl:value-of select="gsa:i18n ('Notes')"/></name>
            <filter>sort=nvt</filter>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_OVERRIDES')">
          <item>
            <page>get_overrides</page>
            <name><xsl:value-of select="gsa:i18n ('Overrides')"/></name>
            <filter>sort=nvt</filter>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Scans')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_ASSETS')">
          <xsl:if test="gsa:may-op ('GET_AGGREGATES')">
            <item>
              <page>dashboard&amp;dashboard_name=assets</page>
              <name><xsl:value-of select="gsa:i18n ('Dashboard')"/></name>
            </item>
            <divider/>
          </xsl:if>
          <item>
            <page>get_assets&amp;asset_type=host</page>
            <name><xsl:value-of select="gsa:i18n ('Hosts')"/></name>
          </item>
          <item>
            <page>get_assets&amp;asset_type=os</page>
            <name><xsl:value-of select="gsa:i18n ('Operating Systems')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORTS')">
          <item>
            <page>get_report&amp;type=assets&amp;apply_overrides=1&amp;levels=hm</page>
            <name><xsl:value-of select="gsa:i18n ('Hosts (Classic)')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Assets')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_INFO')">
          <xsl:if test="gsa:may-op ('GET_AGGREGATES')">
            <item>
              <page>dashboard&amp;dashboard_name=secinfo</page>
              <name><xsl:value-of select="gsa:i18n ('Dashboard')"/></name>
            </item>
            <divider/>
          </xsl:if>
          <item>
            <page>get_info&amp;info_type=nvt</page>
            <name><xsl:value-of select="gsa:i18n ('NVTs')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cve</page>
            <name><xsl:value-of select="gsa:i18n ('CVEs')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cpe</page>
            <name><xsl:value-of select="gsa:i18n ('CPEs')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=ovaldef</page>
            <name><xsl:value-of select="gsa:i18n ('OVAL Definitions')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=cert_bund_adv</page>
            <name><xsl:value-of select="gsa:i18n ('CERT-Bund Advisories')"/></name>
          </item>
          <item>
            <page>get_info&amp;info_type=dfn_cert_adv</page>
            <name><xsl:value-of select="gsa:i18n ('DFN-CERT Advisories')"/></name>
          </item>
          <divider/>
          <item>
            <page>get_info&amp;info_type=allinfo</page>
            <name><xsl:value-of select="gsa:i18n ('All SecInfo')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('SecInfo')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_TARGETS')">
          <item>
            <page>get_targets</page>
            <name><xsl:value-of select="gsa:i18n ('Targets')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_PORT_LISTS')">
          <item>
            <page>get_port_lists</page>
            <name><xsl:value-of select="gsa:i18n ('Port Lists')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_CREDENTIALS')">
          <item>
            <page>get_credentials</page>
            <name><xsl:value-of select="gsa:i18n ('Credentials')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_CONFIGS')">
          <item>
            <page>get_configs</page>
            <name><xsl:value-of select="gsa:i18n ('Scan Configs')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_ALERTS')">
          <item>
            <page>get_alerts</page>
            <name><xsl:value-of select="gsa:i18n ('Alerts')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SCHEDULES')">
          <item>
            <page>get_schedules</page>
            <name><xsl:value-of select="gsa:i18n ('Schedules')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_REPORT_FORMATS')">
          <item>
            <page>get_report_formats</page>
            <name><xsl:value-of select="gsa:i18n ('Report Formats')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_AGENTS')">
          <item>
            <page>get_agents</page>
            <name><xsl:value-of select="gsa:i18n ('Agents')"/></name>
          </item>
        </xsl:if>
        <divider/>
        <xsl:if test="gsa:may-op ('GET_SCANNERS')">
          <item>
            <page>get_scanners</page>
            <name><xsl:value-of select="gsa:i18n ('Scanners')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_FILTERS')">
          <item>
            <page>get_filters</page>
            <name><xsl:value-of select="gsa:i18n ('Filters')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_TAGS')">
          <item>
            <page>get_tags</page>
            <name><xsl:value-of select="gsa:i18n ('Tags')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_PERMISSIONS')">
          <item>
            <page>get_permissions</page>
            <name><xsl:value-of select="gsa:i18n ('Permissions')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Configuration')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-get-trash ()">
          <item>
            <page>get_trash</page>
            <name><xsl:value-of select="gsa:i18n ('Trashcan')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SETTINGS')">
          <item>
            <page>get_my_settings</page>
            <name><xsl:value-of select="gsa:i18n ('My Settings')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_SYSTEM_REPORTS')">
          <item>
            <page>get_system_reports&amp;slave_id=0</page>
            <name><xsl:value-of select="gsa:i18n ('Performance')"/></name>
          </item>
        </xsl:if>
        <item>
          <page>cvss_calculator</page>
          <name><xsl:value-of select="gsa:i18n ('CVSS Calculator')"/></name>
        </item>
        <xsl:if test="gsa:may-op ('GET_FEEDS')">
          <item>
            <page>get_feeds</page>
            <name><xsl:value-of select="gsa:i18n ('Feed Status')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Extras')"/>
      </xsl:call-template>
    </li>
    <li>
      <xsl:variable name="items" xmlns="">
        <xsl:if test="gsa:may-op ('GET_USERS')">
          <item>
            <page>get_users</page>
            <name><xsl:value-of select="gsa:i18n ('Users')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_GROUPS')">
          <item>
            <page>get_groups</page>
            <name><xsl:value-of select="gsa:i18n ('Groups')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('GET_ROLES')">
          <item>
            <page>get_roles</page>
            <name><xsl:value-of select="gsa:i18n ('Roles')"/></name>
          </item>
        </xsl:if>
        <xsl:if test="gsa:may-op ('DESCRIBE_AUTH') and gsa:may-op ('MODIFY_AUTH')">
          <divider/>
          <item>
            <page>auth_settings&amp;name=ldap</page>
            <name><xsl:value-of select="gsa:i18n ('LDAP', 'Auth Method')"/></name>
          </item>
          <item>
            <page>auth_settings&amp;name=radius</page>
            <name><xsl:value-of select="gsa:i18n ('Radius', 'Auth Method')"/></name>
          </item>
        </xsl:if>
      </xsl:variable>
      <xsl:call-template name="gsa-navigation-menu">
        <xsl:with-param name="items" xmlns="" select="$items"/>
        <xsl:with-param name="menu_title" select="gsa:i18n ('Administration')"/>
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
        <xsl:with-param name="menu_title" select="gsa:i18n ('Help')"/>
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
  <div class="panel panel-error" style="width: 520px; margin: 0 auto;">
    <div class="panel-heading">
      <xsl:value-of select="$heading"/>
    </div>
    <div class="panel-body">
<!--
      <div class="pull-right">
        <a href="/help/error_messages.html?token={$token}" title="Help: Error Message">
          <img src="/img/help.svg"/>
        </a>
      </div>
      <span>
        <img src="/img/alert_sign.svg" alt="" title="{$heading}"
             style="margin-left:10px; margin-top:10px; text-align:left;"/>
      </span>
-->
      <div>
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
  <xsl:if test="$token != ''">
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
  </xsl:if>
  <div class="gsa-main">
    <div>
      <div class="panel panel-error">
        <div class="panel-heading">
          <h3 class="panel-title">Error Message</h3>
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="pull-right">
              <a href="/help/error_messages.html?token={$token}"
                class="icon icon-sm"
                title="Help: Error Message">
                <img src="/img/help.svg" class="icon icon-sm"/>
              </a>
            </div>
            <img src="/img/alert_sign.svg" alt="" title="{$title}" class="pull-left icon icon-lg"/>
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
            <xsl:when test="starts-with ($backurl, '/login')">
              | <a href="{$backurl}">Go to login page</a>
            </xsl:when>
            <xsl:otherwise>
              | <a href="/logout">Logout</a>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </div>
      <xsl:if test="$token = ''">
        <xsl:call-template name="html-footer"/>
      </xsl:if>
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
            <xsl:value-of select="gsa:i18n (message)"/>
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
    <xsl:choose>
      <xsl:when test="number(http_only)">
        <div class="box container">
          <div class="col-12">
            <p class="error_message">
              <xsl:value-of select="gsa:i18n ('Warning: Connection unencrypted')"/>
            </p>
            <p>
              <xsl:value-of select="gsa:i18n ('The connection to this GSA is not encrypted, allowing anyone listening to the traffic to steal your credentials.')"/>
            </p>
            <p>
              <xsl:value-of select="gsa:i18n ('Please configure a TLS certificate for the HTTPS service or ask your administrator to do so as soon as possible.')"/>
            </p>
          </div>
        </div>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>
    <div class="box container">
      <div class="logo col-3">
        <xsl:choose>
          <xsl:when test="label">
            <img src="/img/{label}"/>
          </xsl:when>
          <xsl:otherwise>
            <img src="/img/login-label.png"/>
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
            <label for="login" class="col-4 control-label"><xsl:value-of select="gsa:i18n('Username')"/>:</label>
            <div class="col-8">
              <input type="text" autocomplete="off" id="login" name="login"
                value="" autofocus="autofocus" tabindex="1" class="form-control"/>
            </div>
          </div>
          <div class="form-group">
            <label for="password" class="control-label col-4"><xsl:value-of select="gsa:i18n('Password')"/>:</label>
            <div class="col-8">
              <input type="password" class="form-control"
                    autocomplete="off" id="password" name="password" tabindex="2"
                    onkeydown="if (event.keyCode == 13) {{ this.form.submit(); login.disabled = password.disabled = true; return false; }}"/>
            </div>
          </div>
          <div class="form-group">
            <div class="col-6 offset-6 container">
              <input type="submit" class="col-12 button" tabindex="3" value="{gsa:i18n('Login', 'Action Verb')}" />
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

<xsl:template match="guest">
</xsl:template>

<xsl:template match="chart_preferences">
</xsl:template>

<xsl:template match="help_response">
</xsl:template>

<xsl:template match="envelope">
  <xsl:choose>
    <xsl:when test="params/cmd = 'get_aggregate' or params/cmd = 'get_assets_chart' or params/cmd = 'get_tasks_chart'">
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
  <div class="gb_window_error">
    <div class="gb_window_part_left_error"></div>
    <div class="gb_window_part_right_error"></div>
    <div class="gb_window_part_center_error">
      <xsl:value-of select="gsa:i18n ('Warning')"/>
    </div>
    <div class="gb_window_part_content_error">
      <p>
        <xsl:value-of select="gsa:i18n ('Your current password does not comply with the password policy:')"/><br/>
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
