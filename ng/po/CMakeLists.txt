# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2015 - 2018 Greenbone Networks GmbH
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
include (FindPythonModule)

find_python_module(polib)

set (NG_LOCALE_DIR ${NG_SRC_DIR}/public/locales)

# Create targets for a language _LANG
macro (MAKE_TRANSLATION _LANG)
  # Files for installation
  # .json for JS
  add_custom_command (OUTPUT ${NG_LOCALE_DIR}/gsa-${_LANG}.json
                      DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/gsa-${_LANG}.po
                      COMMAND ${PYTHON_EXECUTABLE} "${CMAKE_SOURCE_DIR}/tools/po2json"
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsa-${_LANG}.po
                      ${NG_LOCALE_DIR}/gsa-${_LANG}.json)

  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/gsa-${_LANG}-merged.po
                      DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa.pot
                      COMMAND ${GETTEXT_MSGMERGE_EXECUTABLE}
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsa-${_LANG}.po
                      ${CMAKE_CURRENT_BINARY_DIR}/gsa.pot
                      -o ${CMAKE_CURRENT_BINARY_DIR}/gsa-${_LANG}-merged.po)
endmacro ()

if (GETTEXT_FOUND)
  if (PY_POLIB_FOUND)

    file (MAKE_DIRECTORY ${NG_LOCALE_DIR})

    MAKE_TRANSLATION (ar)
    MAKE_TRANSLATION (de)
    MAKE_TRANSLATION (fr)
    MAKE_TRANSLATION (pt_BR)
    MAKE_TRANSLATION (ru)
    MAKE_TRANSLATION (tr)
    MAKE_TRANSLATION (zh_CN)

    # Installed files
    add_custom_target (gettext-json
                       ALL
                       DEPENDS ${NG_LOCALE_DIR}/gsa-ar.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-de.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-fr.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-pt_BR.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-ru.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-tr.json
                       DEPENDS ${NG_LOCALE_DIR}/gsa-zh_CN.json
                       COMMENT "Created translation .json files")

    # Merged .po files
    add_custom_target (gettext-merge
                       DEPENDS gettext-js-merge
                       COMMENT "Merged translation .po files")

    add_custom_target (gettext-js-merge
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa.pot
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-ar-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-de-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-fr-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-pt_BR-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-ru-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-tr-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa-zh_CN-merged.po
                       COMMENT "Merged translation .po files for JS")

    # Template (.pot) files
    # All template files
    add_custom_target (gettext-pot
                       DEPENDS gettext-js-pot)

    # JS template files
    add_custom_target (gettext-js-pot
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsa.pot)

    add_custom_command (OUTPUT  ${CMAKE_CURRENT_BINARY_DIR}/gsa.pot
                        COMMAND "${CMAKE_SOURCE_DIR}/tools/js2pot"
                        ARGS    "${CMAKE_SOURCE_DIR}"
                                "${CMAKE_CURRENT_BINARY_DIR}/gsa.pot"
                                "${CMAKE_SOURCE_DIR}/ng/src"
                        DEPENDS ${NG_JS_SRC_FILES}
                        COMMENT "Creating translation template (.pot) file from JS")

    install (DIRECTORY
             ${NG_BUILD_DIR}/locales
             DESTINATION ${NG_DEST_DIR})

  else (PY_POLIB_FOUND)
    message (WARNING "Could not build translation files: Python interpreter or polib Python module not found.")
  endif (PY_POLIB_FOUND)

else (GETTEXT_FOUND)
  message (WARNING "Could not build translation files: gettext not found.")
endif (GETTEXT_FOUND)
