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
          <tr class="odd">
            <td valign="top" width="125">Login Name</td>
            <td>
              <input type="text" name="login" value="" size="30"
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
          <tr class="odd">
            <td valign="top">Role</td>
            <td>
              <select name="role">
                <option value="Admin">Admin</option>
                <option value="User" selected="1">User</option>
              </select>
            </td>
          </tr>
          <tr>
            <td valign="top">Host Access</td>
            <td>
              <input type="radio" name="hosts_allow" value="2" checked="1"/>
              Allow All
              <br/>
              <input type="radio" name="hosts_allow" value="1"/>
              Allow:
              <input type="radio" name="hosts_allow" value="0"/>
              Deny:
              <br/>
              <input type="text" name="access_hosts" value="" size="30"
                     maxlength="500"/>
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
            <td>Host Access</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="user">
            <xsl:sort select="role"/>
            <xsl:sort select="name"/>
          </xsl:apply-templates>
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
    <td>
      <xsl:value-of select="role"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="count(hosts) = 0 or hosts/@allow = 2">
          Allow All
        </xsl:when>
        <xsl:when test="hosts/@allow = 3">
          Custom
        </xsl:when>
        <xsl:when test="hosts/@allow = 0">
          Deny:
          <xsl:value-of select="hosts/text()"/>
        </xsl:when>
        <xsl:when test="hosts/@allow = 1">
          Allow:
          <xsl:value-of select="hosts/text()"/>
        </xsl:when>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="name=/envelope/login/text()">
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
      <a href="/oap?cmd=get_user&amp;name={name}"
         title="Details"
         style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/oap?cmd=edit_user&amp;name={name}"
         title="Edit User"
         style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="user" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       User Details
       <a href="/help/configure_users.html#userdetails"
         title="Help: Configure Users (User Details)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float-right">
        <a href="?cmd=get_users">Back to Users</a>
      </div>
      <table>
        <tr>
          <td><b>Login Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Role:</td>
          <td><xsl:value-of select="role"/></td>
        </tr>
        <tr>
          <td>Host Access:</td>
          <td>
            <xsl:choose>
              <xsl:when test="count(hosts) = 0 or hosts/@allow = 2">
                Allow All
              </xsl:when>
              <xsl:when test="hosts/@allow = 3">
                Custom
              </xsl:when>
              <xsl:when test="hosts/@allow = 0">
                Deny:
                <xsl:value-of select="hosts/text()"/>
              </xsl:when>
              <xsl:when test="hosts/@allow = 1">
                Allow:
                <xsl:value-of select="hosts/text()"/>
              </xsl:when>
            </xsl:choose>
          </td>
        </tr>
      </table>

<!--
      <xsl:choose>
        <xsl:when test="count(tasks/task) = 0">
          <h1>Tasks managed by this User: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Tasks managed by this User</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="tasks/task">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_status&amp;task_id={@id}" title="Reports">
                    <img src="/img/list.png"
                         border="0"
                         alt="Reports"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
-->
    </div>
  </div>
</xsl:template>

<xsl:template match="user" mode="edit">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       Edit User
       <a href="/help/configure_users.html#userdetails"
         title="Help: Configure Users (Edit User)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float-right">
        <a href="?cmd=get_users">Back to Users</a>
      </div>
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="save_user"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr class="odd">
            <td valign="top" width="125"><b>Login Name:</b></td>
            <td>
              <input type="hidden" name="login" value="{name}"/>
              <b><xsl:value-of select="name"/></b>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Password</td>
            <td>
              <input type="radio" name="modify_password" value="0" checked="1"/>
              Use existing value
              <br/>
              <input type="radio" name="modify_password" value="1"/>
              <input type="password" name="password" value="" size="30"
                     maxlength="40"/>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top">Role</td>
            <td>
              <select name="role">
                <xsl:choose>
                  <xsl:when test="role='User'">
                    <option value="Admin">Admin</option>
                    <option value="User" selected="1">User</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="Admin" selected="1">Admin</option>
                    <option value="User">User</option>
                  </xsl:otherwise>
                </xsl:choose>
              </select>
            </td>
          </tr>
          <tr>
            <td valign="top">Host Access</td>
            <td>
              <xsl:choose>
                <xsl:when test="count(hosts) = 0 or hosts/@allow &gt; 1">
                  <input type="radio" name="hosts_allow" value="2" checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="hosts_allow" value="2"/>
                </xsl:otherwise>
              </xsl:choose>
              Allow All
              <br/>
              <xsl:choose>
                <xsl:when test="hosts/@allow = 1">
                  <input type="radio" name="hosts_allow" value="1" checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="hosts_allow" value="1"/>
                </xsl:otherwise>
              </xsl:choose>
              Allow:
              <xsl:choose>
                <xsl:when test="hosts/@allow = 0">
                  <input type="radio" name="hosts_allow" value="0" checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="hosts_allow" value="0"/>
                </xsl:otherwise>
              </xsl:choose>
              Deny:
              <br/>
              <input type="text" name="access_hosts" value="{hosts}" size="30"
                     maxlength="500"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save User"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--     GET_USERS_RESPONSE -->

<xsl:template match="get_users_response">
  <xsl:call-template name="html-create-user-form"/>
  <xsl:call-template name="html-users-table"/>
</xsl:template>

<!--     EDIT_USER -->

<xsl:template match="edit_user">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="get_users_response/user" mode="edit"/>
</xsl:template>

<!--     GET_USER -->

<xsl:template match="get_user">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="get_users_response/user" mode="details"/>
</xsl:template>

<!-- END USERS MANAGEMENT -->

<!-- BEGIN FEED MANAGEMENT -->

<!-- DESCRIBE FEED RESPONSE    -->

<xsl:template match="describe_feed_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-feed-form"/>
    </xsl:otherwise>
  </xsl:choose>
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
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="feed/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="feed/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
	              <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="feed/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="feed/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="feed/description"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="feed/currently_syncing">
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
      <xsl:if test="@editable=1">
        <a href="/oap?cmd=edit_settings"
           title="Edit Settings"
           style="margin-left:3px;">
          <img src="/img/edit.png"/>
        </a>
      </xsl:if>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div style="text-align:left">From file: <xsl:value-of select="@sourcefile"/></div>
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

<xsl:template match="scanner_settings" mode="edit">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Scanner Settings
      <a href="/help/settings.html"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div style="text-align:left">From file: <xsl:value-of select="@sourcefile"/></div>
      <div id="settings">
        <form action="/omp" method="post" enctype="multipart/form-data">
          <input type="hidden" name="cmd" value="save_settings"/>
          <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
            <tr class="gbntablehead2">
              <td>Setting</td>
              <td>Value</td>
            </tr>
            <xsl:apply-templates select="setting" mode="edit"/>
            <tr>
              <td colspan="2" style="text-align:right;">
                <input type="submit"
                       name="submit"
                       value="Save Settings"
                       title="Save Settings"/>
              </td>
            </tr>
          </table>
        </form>
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

<xsl:template match="setting" mode="edit">
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
    <td>
      <input type="text" name="method_data:{@name}" value="{text()}" size="50"
             maxlength="400"/>
    </td>
  </tr>
</xsl:template>

<!--     GET_SETTINGS_RESPONSE -->

<xsl:template match="get_settings_response">
  <xsl:choose>
	<xsl:when test="@status = '200' or @status = '201' or @status = '202'">
	  <xsl:call-template name="html-settings-table"/>
	</xsl:when>
	<xsl:otherwise>
	  <xsl:call-template name="command_result_dialog">
		<xsl:with-param name="operation">List Settings</xsl:with-param>
		<xsl:with-param name="status">
		  <xsl:value-of select="@status"/>
		</xsl:with-param>
		<xsl:with-param name="msg">
		  <xsl:value-of select="@status_text"/>
		</xsl:with-param>
	  </xsl:call-template>
	</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="get_settings_response" mode="edit">
  <xsl:choose>
    <xsl:when test="@status = '200' or @status = '201' or @status = '202'">
      <xsl:apply-templates select="scanner_settings" mode="edit"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Edit Settings</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- PAGE TEMPLATES -->

<xsl:template match="get_settings">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="save_settings_response"/>
  <xsl:apply-templates select="get_settings_response"/>
</xsl:template>

<xsl:template match="edit_settings">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="get_settings_response" mode="edit"/>
</xsl:template>

<!-- END SETTINGS MANAGEMENT -->

</xsl:stylesheet>
