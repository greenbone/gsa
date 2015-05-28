# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
#
# Copyright:
# Copyright (C) 2015 Greenbone Networks GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

include (FindGettext)

macro (MAKE_TRANSLATION _LANG)
  make_directory (${CMAKE_CURRENT_BINARY_DIR}/${_LANG})
  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo
                      DEPENDS gsad_xsl-${_LANG}.po
                      COMMAND ${GETTEXT_MSGFMT_EXECUTABLE}
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_xsl-${_LANG}.po -o ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo)
  install (FILES ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo
           DESTINATION ${GSA_LOCALE_DIR}/${_LANG}/LC_MESSAGES)
endmacro ()

if (GETTEXT_FOUND)

  MAKE_TRANSLATION (de)
  MAKE_TRANSLATION (zh)

  add_custom_target (gettext-mo-files
                     ALL
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/de/gsad_xsl.mo
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/zh/gsad_xsl.mo
                     COMMENT "Creating translation .mo files")


else (GETTEXT_FOUND)
  message (WARNING "Could not build translation .mo files: gettext not found.")
endif (GETTEXT_FOUND)