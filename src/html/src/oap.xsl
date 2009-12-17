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
Description: OpenVAS Administrator Protocol (OAP) stylesheet

Authors:
Matthew Mundell <matthew.mundell@intevation.de>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@intevation.de>

Copyright:
Copyright (C) 2009 Greenbone Networks GmbH

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

<!-- BEGIN USERS MANAGEMENT -->

<xsl:template name="html-create-user-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New User
      <a href="/help/configure_users.html#newuser"
         title="Help: Configure Users (New User)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_user"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Password</td>
            <td>
              <input type="password" name="password" value="" size="30"
                     maxlength="40"/>
            </td>
          </tr>
          <tr>
            <td>Role</td>
            <td>
              <select name="role">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create User"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-users-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Users
      <a href="/help/configure_users.html#users"
         title="Help: Configure Users (Users)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Role</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="user"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_USER_RESPONSE -->

<xsl:template match="create_user_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create User</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_USER_RESPONSE -->

<xsl:template match="delete_user_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete User</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     USER -->

<xsl:template match="user">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
    </td>
    <td><xsl:value-of select="role"/></td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:when>
        <xsl:otherwise>
          <a href="/oap?cmd=delete_user&amp;name={name}"
             title="Delete User"
             style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<!--     GET_USERS_RESPONSE -->

<xsl:template match="get_users_response">
  <xsl:call-template name="html-create-user-form"/>
  <xsl:call-template name="html-users-table"/>
</xsl:template>

<!-- END USERS MANAGEMENT -->

<!-- BEGIN FEED MANAGEMENT -->

<!-- DESCRIBE FEED RESPONSE    -->

<xsl:template match="describe_feed_response">
  <xsl:call-template name="html-feed-form"/>
</xsl:template>

<xsl:template name="html-feed-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">NVT Feed Management
      <a href="/help/feed_management.html"
         title="Help: NVT Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="sync_feed"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="feed/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="feed/description"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a href="/help/feed_management.html#consequences" title="Help: Feed Management">Learn about the consequences of feed synchronization</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_FEED_RESPONSE -->

<xsl:template match="sync_feed_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with NVT Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END FEED MANAGEMENT -->

<!-- BEGIN SETTINGS MANAGEMENT -->

<xsl:template name="html-settings-table">
  <xsl:apply-templates select="scanner_settings"/>
</xsl:template>

<!--     SCANNER_SETTINGS -->

<xsl:template match="scanner_settings">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Scanner Settings
      <a href="/help/settings.html"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div>From file: <xsl:value-of select="@sourcefile"/></div>
      <div id="settings">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Setting</td>
            <td>Value</td>
          </tr>
          <xsl:apply-templates select="setting"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     SETTING -->

<xsl:template match="setting">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="@name"/></b>
    </td>
    <td><xsl:value-of select="text()"/></td>
  </tr>
</xsl:template>

<!--     GET_SETTINGS_RESPONSE -->

<xsl:template match="get_settings_response">
  <xsl:call-template name="html-settings-table"/>
</xsl:template>

<!-- END SETTINGS MANAGEMENT -->

</xsl:stylesheet>
