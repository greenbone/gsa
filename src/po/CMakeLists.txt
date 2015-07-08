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
include (FindPythonInterp)

macro (MAKE_TRANSLATION _LANG)
  file (MAKE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/${_LANG})
  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo
                      DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_xsl-${_LANG}.po
                      COMMAND ${GETTEXT_MSGFMT_EXECUTABLE}
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_xsl-${_LANG}.po -o ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo)
  install (FILES ${CMAKE_CURRENT_BINARY_DIR}/${_LANG}/gsad_xsl.mo
           DESTINATION ${GSA_LOCALE_DIR}/${_LANG}/LC_MESSAGES)

  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl-${_LANG}-merged.po
                      DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot
                      COMMAND ${GETTEXT_MSGMERGE_EXECUTABLE}
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_xsl-${_LANG}.po
                      ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot
                      -o ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl-${_LANG}-merged.po)
endmacro ()

if (GETTEXT_FOUND)

  MAKE_TRANSLATION (de)
  MAKE_TRANSLATION (ru)
  MAKE_TRANSLATION (zh)

  add_custom_target (gettext-mo-files
                     ALL
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/de/gsad_xsl.mo
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/ru/gsad_xsl.mo
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/zh/gsad_xsl.mo
                     COMMENT "Created translation .mo files")

  add_custom_target (gettext-po-files
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl-de-merged.po
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl-ru-merged.po
                     DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl-zh-merged.po
                     COMMENT "Created translation .po files")

  if (PYTHONINTERP_FOUND)
    add_custom_command (OUTPUT  ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot
                        COMMAND ${PYTHON_EXECUTABLE} "${CMAKE_SOURCE_DIR}/tools/xsl2pot"
                        ARGS    "${CMAKE_SOURCE_DIR}/src/html/classic"
                                "${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot"
                        DEPENDS ${CMAKE_SOURCE_DIR}/src/html/classic/*.xsl
                        COMMENT "Creating translation template (.pot) files")
    add_custom_target (gettext-pot-files
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_xsl.pot)
  else (PYTHONINTERP_FOUND)
    message (WARNING "Python interpreter not found, cannot run .pot generator.")
  endif (PYTHONINTERP_FOUND)

else (GETTEXT_FOUND)
  message (WARNING "Could not build translation files: gettext not found.")
endif (GETTEXT_FOUND)