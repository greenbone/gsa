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
Matthew Mundell <matthew.mundell@intevation.de>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@intevation.de>

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
    <link rel="icon" href="/favicon.gif" type="image/x-icon"/>
    <title>Greenbone Security Assistant</title>
    <xsl:apply-templates select="envelope/autorefresh" mode="html-header-meta" />
  </head>
</xsl:template>

<!-- Add meta refresh info if autorefresh element present -->
<xsl:template match="autorefresh" mode="html-header-meta">
  <xsl:if test="@interval &gt; 0">
    <meta http-equiv="refresh" content="{@interval};/omp?cmd=get_status&amp;refresh_interval={@interval}" />
  </xsl:if>
</xsl:template>

<xsl:template name="html-gsa-logo">
  <xsl:param name="username"/>
  <xsl:param name="time"/>
  <div style="text-align:left;">
    <div class="logo_l">
      <a href="/omp?cmd=get_status" title="Greenbone Security Assistant">
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
        <a href="/logout" title="Logout" style="margin-left:3px;">Logout</a>
        <br/>
        <br/>
        <xsl:value-of select="$time"/>
      </div>
    </div>
  </div>
  <br clear="all"/>
</xsl:template>

<xsl:template name="html-footer">
  <div class="gsa_footer">
    Greenbone Security Assistant (GSA) Copyright 2009, 2010 by Greenbone Networks
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
              <li><a href="/omp?cmd=get_status">Tasks</a></li>
              <li><a href="/new_task.html">New Task</a></li>
              <li><a href="/omp?cmd=get_notes">Notes</a></li>
              <li><a href="/omp?cmd=get_system_reports">Performance</a></li>
            </ul>
          </li>
          <li>
            Configuration
            <ul>
              <li><a href="/omp?cmd=get_configs">Scan Configs</a></li>
              <li><a href="/omp?cmd=get_targets">Targets</a></li>
              <li><a href="/omp?cmd=get_lsc_credentials">Credentials</a></li>
              <li><a href="/omp?cmd=get_agents">Agents</a></li>
              <li><a href="/omp?cmd=get_escalators">Escalators</a></li>
              <li><a href="/omp?cmd=get_schedules">Schedules</a></li>
            </ul>
          </li>
          <li>
            Administration
            <ul>
              <li><a href="/oap?cmd=get_users">Users</a></li>
              <li><a href="/oap?cmd=get_feed">NVT Feed</a></li>
              <li><a href="/oap?cmd=get_settings">Settings</a></li>
            </ul>
          </li>
          <li>
            Help
            <ul>
              <li><a href="/help/contents.html">Contents</a></li>
              <li><a href="/about.html">About</a></li>
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
  <xsl:param name="backurl">/omp?get_status</xsl:param>
  <center>
    <div class="envelope" style="width:500px;">
      <div class="gb_window" style="margin-top:150px;">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">Error Message</div>
        <div class="gb_window_part_content_error" style="text-align:center;">
          <div style="float:right;">
            <a href="/help/error_messages.html" title="Help: Error Message">
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
            'Back' button of browser |
            <a href="{$backurl}">Assumed sane state</a> |
            <a href="/login.html">Logout</a>
          </div>
        </div>
      </div>
      <xsl:call-template name="html-footer"/>
    </div>
  </center>
</xsl:template>

<!-- COMMON TEMPLATES -->

<xsl:template name="command_result_dialog">
  <xsl:param name="operation">(Operation description is missing)</xsl:param>
  <xsl:param name="status">(Status code is missing)</xsl:param>
  <xsl:param name="msg">(Status message is missing)</xsl:param>
  <xsl:param name="details"></xsl:param>

  <div class="gb_window">

    <!-- Choose red color if status is "bad" (outside the 200s). -->
    <xsl:choose>
      <xsl:when test="$status = '200' or $status = '201' or $status = '202'">
        <div class="gb_window_part_left"></div>
        <div class="gb_window_part_right"></div>
        <div class="gb_window_part_center">Results of last operation</div>
      </xsl:when>
      <xsl:otherwise>
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">
          Results of last operation
        </div>
      </xsl:otherwise>
    </xsl:choose>

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
</xsl:template>

<!-- OMP -->

<xsl:include href="omp.xsl"/>

<!-- OAP -->

<xsl:include href="oap.xsl"/>

<!-- ROOT, ENVELOPE -->

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
  <html>
    <xsl:call-template name="html-head"/>
    <body>
      <center>
        <xsl:apply-templates/>
      </center>
    </body>
  </html>
</xsl:template>

</xsl:stylesheet>
