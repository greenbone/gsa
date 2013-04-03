<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:gsa="http://openvas.org">
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
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>

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

<xsl:template match="group" mode="newuser">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template name="new-user-group-select">
  <xsl:param name="position" select="1"/>
  <xsl:param name="count" select="0"/>
  <xsl:param name="groups" select="get_groups_response"/>
  <select name="group_id_optional:{$position}">
    <option value="--">--</option>
    <xsl:apply-templates select="$groups/group"
                         mode="newuser"/>
  </select>
  <xsl:if test="$count &gt; 1">
    <br/>
    <xsl:call-template name="new-user-group-select">
      <xsl:with-param name="groups" select="$groups"/>
      <xsl:with-param name="count" select="$count - 1"/>
      <xsl:with-param name="position" select="$position + 1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="html-create-user-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New User
      <a href="/help/users.html?token={/envelope/token}#newuser"
         title="Help: Users (New User)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_users&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
         title="Users" style="margin-left:3px;">
        <img src="/img/list.png" border="0" alt="Users"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="create_user"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr class="odd">
            <td valign="top" width="125">Login Name</td>
            <td>
              <input type="text" name="login" value="{gsa:param-or ('login', 'unnamed')}"
                     size="30" maxlength="80"/>
            </td>
          </tr>
          <tr class="even">
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
                <xsl:choose>
                  <xsl:when test="/envelope/params/role = 'Admin'">
                    <option value="Admin" selected="1">Admin</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="Admin">Admin</option>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="not (boolean (/envelope/params/role)) or (/envelope/params/role = 'User')">
                    <option value="User" selected="1">User</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="User">User</option>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="/envelope/params/role = 'Observer'">
                    <option value="Observer" selected="1">Observer</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="Observer">Observer</option>
                  </xsl:otherwise>
                </xsl:choose>
              </select>
            </td>
          </tr>
          <tr class="even">
            <td>Groups (optional)</td>
            <td>
              <xsl:variable name="groups"
                            select="get_groups_response/group"/>
              <xsl:for-each select="/envelope/params/_param[substring-before (name, ':') = 'group_id_optional'][value != '--']">
                <select name="{name}">
                  <xsl:variable name="group_id" select="value"/>
                  <xsl:choose>
                    <xsl:when test="string-length ($group_id) &gt; 0">
                      <option value="0">--</option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="0" selected="1">--</option>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:for-each select="$groups">
                    <xsl:choose>
                      <xsl:when test="@id = $group_id">
                        <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                      </xsl:when>
                      <xsl:otherwise>
                        <option value="{@id}"><xsl:value-of select="name"/></option>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:for-each>
                </select>
                <br/>
              </xsl:for-each>
              <xsl:variable name="count"
                            select="count (/envelope/params/_param[substring-before (name, ':') = 'group_id_optional'][value != '--'])"/>
              <xsl:call-template name="new-user-group-select">
                <xsl:with-param name="groups" select="get_groups_response"/>
                <xsl:with-param name="count" select="/envelope/params/groups - $count"/>
                <xsl:with-param name="position" select="$count + 1"/>
              </xsl:call-template>

              <xsl:choose>
                <xsl:when test="string-length (/envelope/params/groups)">
                  <input type="hidden" name="groups" value="{/envelope/params/groups}"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="hidden" name="groups" value="{1}"/>
                </xsl:otherwise>
              </xsl:choose>
              <!-- Force the Create Task button to be the default. -->
              <input style="position: absolute; left: -100%"
                     type="submit" name="submit" value="Create User"/>
              <input type="submit" name="submit_plus_group" value="+"/>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top">Host Access</td>
            <td>
              <label>
                <xsl:choose>
                  <xsl:when test="not (boolean (/envelope/params/hosts_allow)) or (/envelope/params/hosts_allow = '2')">
                    <input type="radio" name="hosts_allow" value="2" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="2"/>
                  </xsl:otherwise>
                </xsl:choose>
                Allow All
              </label>
              <br/>
              <label>
                <xsl:choose>
                  <xsl:when test="/envelope/params/hosts_allow = '1'">
                    <input type="radio" name="hosts_allow" value="1" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="1"/>
                  </xsl:otherwise>
                </xsl:choose>
                Allow:
              </label>
              <label>
                <xsl:choose>
                  <xsl:when test="/envelope/params/hosts_allow = '0'">
                    <input type="radio" name="hosts_allow" value="0" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="0"/>
                  </xsl:otherwise>
                </xsl:choose>
                Deny:
              </label>
              <br/>
              <input type="text" name="access_hosts" value="{gsa:param-or ('access_hosts', '')}"
                     size="30" maxlength="500"/>
            </td>
          </tr>
          <!-- Only if ldap-connect is enabled, it is per-user. !-->
          <xsl:if test="//group[@name='method:ldap_connect']/auth_conf_setting[@key='enable']/@value = 'true'">
            <tr class="odd">
              <td valign="top">Allow LDAP- Authentication only</td>
              <td>
                <input type="checkbox" name="enable_ldap_connect" value="1" checked="1"/>
              </td>
            </tr>
          </xsl:if>
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
      <a href="/help/users.html?token={/envelope/token}#users"
         title="Help: Users (Users)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=new_user&amp;filter={str:encode-uri (/envelope/params/filter, true ())}&amp;filt_id={/envelope/params/filt_id}&amp;token={/envelope/token}"
         title="New User">
        <img src="/img/new.png" border="0" style="margin-left:3px;"/>
      </a>
      <div id="small_inline_form" style="display: inline; margin-left: 15px; font-weight: normal;">
        <a href="/omp?cmd=export_users&amp;filter={str:encode-uri (filters/term, true ())}&amp;token={/envelope/token}"
           title="Export all Users as XML"
           style="margin-left:3px;">
          <img src="/img/download.png" border="0" alt="Export XML"/>
        </a>
      </div>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Role</td>
            <td>Groups</td>
            <td>Host Access</td>
            <xsl:if test="//group[@name='method:ldap_connect']/auth_conf_setting[@key='enable']/@value = 'true'">
              <td>LDAP Authentication</td>
            </xsl:if>
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

<xsl:template match="new_user">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_user_response"/>
  <xsl:apply-templates select="create_user_response"/>
  <xsl:call-template name="html-create-user-form"/>
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

<!--     MODIFY_USER_RESPONSE -->

<xsl:template match="modify_user_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save User</xsl:with-param>
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
      <b>
        <a href="/omp?cmd=get_user&amp;user_id={@id}&amp;filter={str:encode-uri (../filters/term, true ())}&amp;token={/envelope/token}">
          <xsl:value-of select="name"/>
        </a>
      </b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:value-of select="role"/>
    </td>
    <td>
      <xsl:for-each select="groups/group">
        <a href="/omp?cmd=get_group&amp;group_id={@id}&amp;token={/envelope/token}">
          <xsl:value-of select="name"/>
        </a>
        <xsl:if test="position() != last()">, </xsl:if>
      </xsl:for-each>
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
    <xsl:if test="//group[@name='method:ldap_connect']/auth_conf_setting[@key='enable']/@value = 'true'">
      <td>
        <xsl:choose>
          <xsl:when test="sources/source/text() = 'ldap_connect'">
            <input type="checkbox" name="-" value="-" checked="checked" disabled="true"/>
          </xsl:when>
          <xsl:otherwise>
            <input type="checkbox" name="-" value="-" disabled="true"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </xsl:if>
    <td>
      <xsl:choose>
        <xsl:when test="name=/envelope/login/text()">
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:when>
        <xsl:otherwise>
          <div style="display: inline">
            <form style="display: inline; font-size: 0px; margin-left: 3px" action="/omp" method="post" enctype="multipart/form-data">
              <input type="hidden" name="token" value="{/envelope/token}"/>
              <input type="hidden" name="caller" value="{/envelope/caller}"/>
              <input type="hidden" name="cmd" value="delete_user"/>
              <input type="hidden" name="user_id" value="{@id}"/>
              <input type="image" src="/img/delete.png" alt="Delete"
                     name="Delete" value="Delete" title="Delete"/>
            </form>
          </div>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:call-template name="list-window-line-icons">
        <xsl:with-param name="cap-type" select="'User'"/>
        <xsl:with-param name="type" select="'user'"/>
        <xsl:with-param name="id" select="@id"/>
        <xsl:with-param name="notrash" select="1"/>
      </xsl:call-template>
    </td>
  </tr>
</xsl:template>

<xsl:template match="user" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       User Details
       <xsl:call-template name="details-header-icons">
         <xsl:with-param name="cap-type" select="'User'"/>
         <xsl:with-param name="type" select="'user'"/>
         <xsl:with-param name="noedit" select="1"/>
         <xsl:with-param name="noexport" select="1"/>
       </xsl:call-template>
    </div>
    <div class="gb_window_part_content">
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
          <td>Groups:</td>
          <td>
            <xsl:for-each select="groups/group">
              <a href="/omp?cmd=get_group&amp;group_id={@id}&amp;token={/envelope/token}">
                <xsl:value-of select="name"/>
              </a>
              <xsl:if test="position() != last()">, </xsl:if>
            </xsl:for-each>
          </td>
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
        <xsl:if test="//group[@name='method:ldap_connect']/auth_conf_setting[@key='enable']/@value = 'true'">
          <tr>
            <td>LDAP-Authentication:</td>
            <td>
              <xsl:choose>
                <xsl:when test="sources/source/text() = 'ldap_connect'">
                  Yes
                </xsl:when>
                <xsl:otherwise>
                  No
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </xsl:if>

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
                  <a href="/omp?cmd=get_tasks&amp;task_id={@id}&amp;token={/envelope/token}" title="Reports">
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
       <a href="/help/users.html?token={/envelope/token}#userdetails"
         title="Help: Users (Edit User)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_users&amp;token={/envelope/token}">Users</a>
      </div>
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="save_user"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
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
              <label>
                <input type="radio" name="modify_password" value="0" checked="1"/>
                Use existing value
              </label>
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
                    <option value="Observer">Observer</option>
                  </xsl:when>
                  <xsl:when test="role='Observer'">
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Observer" selected="1">Observer</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="Admin" selected="1">Admin</option>
                    <option value="User">User</option>
                    <option value="Observer">Observer</option>
                  </xsl:otherwise>
                </xsl:choose>
              </select>
            </td>
          </tr>
          <tr>
            <td valign="top">Host Access</td>
            <td>
              <label>
                <xsl:choose>
                  <xsl:when test="count(hosts) = 0 or hosts/@allow &gt; 1">
                    <input type="radio" name="hosts_allow" value="2" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="2"/>
                  </xsl:otherwise>
                </xsl:choose>
                Allow All
              </label>
              <br/>
              <label>
                <xsl:choose>
                  <xsl:when test="hosts/@allow = 1">
                    <input type="radio" name="hosts_allow" value="1" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="1"/>
                  </xsl:otherwise>
                </xsl:choose>
                Allow:
              </label>
              <label>
                <xsl:choose>
                  <xsl:when test="hosts/@allow = 0">
                    <input type="radio" name="hosts_allow" value="0" checked="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="hosts_allow" value="0"/>
                  </xsl:otherwise>
                </xsl:choose>
                Deny:
              </label>
              <br/>
              <input type="text" name="access_hosts" value="{hosts}" size="30"
                     maxlength="500"/>
            </td>
          </tr>
          <!-- Only if per-user ldap enabled. -->
          <xsl:if test="//group[@name='method:ldap_connect']/auth_conf_setting[@key='enable']/@value = 'true'">
            <tr class="odd">
              <td valign="top">Authentication via LDAP</td>
              <td>
               <xsl:choose>
                 <xsl:when test="sources/source/text() = 'ldap_connect'">
                   <input type="checkbox" name="enable_ldap_connect" value="1" checked="checked"/>
                 </xsl:when>
                 <xsl:otherwise>
                   <input type="checkbox" name="enable_ldap_connect" value="1"/>
                 </xsl:otherwise>
               </xsl:choose>
              </td>
            </tr>
          </xsl:if>
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

<!--     EDIT_USER -->

<xsl:template match="edit_user">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/get_users_response/user" mode="edit"/>
</xsl:template>

<!--     GET_USER -->

<xsl:template match="get_user">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_user_response"/>
  <xsl:apply-templates select="commands_response/modify_user_response"/>
  <xsl:apply-templates select="get_users_response/user" mode="details"/>
</xsl:template>

<!--     GET_USERS_RESPONSE -->

<xsl:template match="get_users">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="delete_user_response"/>
  <xsl:apply-templates select="create_user_response"/>
  <xsl:apply-templates select="modify_user_response"/>
  <!-- The for-each makes the get_users_response the current node. -->
  <xsl:for-each select="get_users_response | commands_response/get_users_response">
    <xsl:choose>
      <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
        <xsl:call-template name="command_result_dialog">
          <xsl:with-param name="operation">
            Get Users
          </xsl:with-param>
          <xsl:with-param name="status">
            <xsl:value-of select="@status"/>
          </xsl:with-param>
          <xsl:with-param name="msg">
            <xsl:value-of select="@status_text"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="html-users-table"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:for-each>
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
      <a href="/help/feed_management.html?token={/envelope/token}"
         title="Help: NVT Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_feed"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
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
          <xsl:choose>
            <xsl:when test="feed/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="feed/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="feed/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="feed/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="feed/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/feed_management.html?token={/envelope/token}#side_effects" title="Help: Feed Management">Learn about the side effects of feed synchronization!</a>
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

<!-- BEGIN SCAP FEED MANAGEMENT -->

<!-- DESCRIBE SCAP FEED RESPONSE    -->

<xsl:template match="describe_scap_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe SCAP Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-scap-form"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-scap-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">SCAP Feed Management
      <a href="/help/scap_management.html?token={/envelope/token}"
         title="Help: SCAP Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_scap"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="scap/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="scap/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="scap/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
                  <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="scap/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="scap/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="scap/description"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="scap/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="scap/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="scap/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="scap/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="scap/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/scap_management.html?token={/envelope/token}#side_effects" title="Help: SCAP Feed Management">Learn about the side effects of SCAP Feed synchronization!</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_SCAP_RESPONSE -->

<xsl:template match="sync_scap_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with SCAP Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END SCAP MANAGEMENT -->

<!-- BEGIN CERT FEED MANAGEMENT -->

<!-- DESCRIBE CERT FEED RESPONSE    -->

<xsl:template match="describe_cert_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe SCAP Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-cert-form"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-cert-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">CERT Feed Management
      <a href="/help/cert_management.html?token={/envelope/token}"
         title="Help: CERT Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_cert"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="cert/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="cert/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="cert/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
                  <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="cert/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="cert/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="cert/description"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="cert/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="cert/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="cert/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="cert/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="cert/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/cert_management.html?token={/envelope/token}#side_effects" title="Help: CERT Feed Management">Learn about the side effects of CERT Feed synchronization!</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_CERT_RESPONSE -->

<xsl:template match="sync_cert_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with CERT Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END CERT FEED MANAGEMENT -->

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
      <a href="/help/settings.html?token={/envelope/token}"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
      <xsl:if test="@editable=1">
        <a href="/oap?cmd=edit_settings&amp;token={/envelope/token}"
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
      <a href="/help/settings.html?token={/envelope/token}"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div style="text-align:left">From file: <xsl:value-of select="@sourcefile"/></div>
      <div id="settings">
        <form action="/omp" method="post" enctype="multipart/form-data">
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="cmd" value="save_settings"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
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

<!-- END SETTINGS MANAGEMENT -->

<!-- AUTHENTICATION DESCRIPTION -->

<xsl:template match="group" mode="auth">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      <xsl:choose>
        <xsl:when test="@name='method:ads'">
          ADS Authentication
          <a href="/help/users.html?token={/envelope/token}#adsauthentication"
            title="Help: Users (ADS Authentication)">
          <img src="/img/help.png"/></a>
        </xsl:when>
        <xsl:when test="@name='method:ldap'">
          LDAP Authentication and Authorization
          <a href="/help/users.html?token={/envelope/token}#ldapauthentication"
            title="Help: Users (LDAP Authentication and Authorization)">
          <img src="/img/help.png"/></a>
        </xsl:when>
        <xsl:when test="@name='method:ldap_connect'">
          LDAP per-User Authentication
          <a href="/help/users.html?token={/envelope/token}#peruserldapauthentication"
            title="Help: Users (LDAP per-User Authentication)">
          <img src="/img/help.png"/></a>
        </xsl:when>
      </xsl:choose>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <form action="/oap" method="post" enctype="multipart/form-data">
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="cmd" value="modify_auth"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <!-- group name is e.g. of method:ldap -->
          <input type="hidden" name="group" value="{@name}"/>
          <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
            <tr class="gbntablehead2">
              <td>Setting</td>
              <td>Value</td>
            </tr>
              <tr class="odd">
                <td>Enable</td>
                <td>
                  <xsl:choose>
                    <xsl:when test="auth_conf_setting[@key='enable']/@value = 'true'">
                      <input type="checkbox" name="enable" value="1" checked="1"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <input type="checkbox" name="enable" value="1"/>
                    </xsl:otherwise>
                 </xsl:choose>
                 </td>
              </tr>
              <tr class="even">
                <td>
                <xsl:choose>
                  <xsl:when test="@name='method:ads'">
                    ADS
                  </xsl:when>
                  <xsl:when test="@name='method:ldap'">
                    LDAP
                  </xsl:when>
                  <xsl:when test="@name='method:ldap_connect'">
                    LDAP
                  </xsl:when>
                </xsl:choose>
                Host</td>
                <td><input type="text" name="ldaphost" size="30"
                     value="{auth_conf_setting[@key='ldaphost']/@value}"/></td>
              </tr>
              <tr class="odd">
              <xsl:choose>
                <xsl:when test="@name='method:ads'">
                  <td>Domain</td>
                  <td><input type="text" name="domain" size="30"
                       value="{auth_conf_setting[@key='domain']/@value}"/></td>
                </xsl:when>
                <xsl:otherwise>
                  <td>Auth. DN</td>
                  <td><input type="text" name="authdn" size="30"
                       value="{auth_conf_setting[@key='authdn']/@value}"/></td>
                </xsl:otherwise>
              </xsl:choose>
              </tr>
            <tr>
              <td colspan="2" style="text-align:right;">
                <input type="submit" name="submit" value="Save"/>
              </td>
            </tr>
          </table>
        </form>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template match="describe_auth_response">
</xsl:template>

<xsl:template match="modify_auth_response" mode="show">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Modify Authentication Configuration</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template name="describe_auth_response" mode="show">
  <xsl:apply-templates select="../describe_auth_response/group[@name='method:ldap']" mode="auth"/>
  <xsl:apply-templates select="../describe_auth_response/group[@name='method:ads']" mode="auth"/>
  <xsl:apply-templates select="../describe_auth_response/group[@name='method:ldap_connect']" mode="auth"/>
</xsl:template>

<!-- END AUTHENTICATION DESCRIPTION -->

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

<!-- END PAGE TEMPLATES -->

</xsl:stylesheet>
