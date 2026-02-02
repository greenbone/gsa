# Naming Conventions <!-- omit in toc -->

- [Modules](#modules)
- [Classes](#classes)
- [TypeScript Types and Interfaces](#typescript-types-and-interfaces)
- [Functions and Methods](#functions-and-methods)
- [Arguments including Props](#arguments-including-props)
- [React Components](#react-components)
- [React Hooks](#react-hooks)
- [React HOCs](#react-hocs)
- [URLs](#urls)
- [Entity Types](#entity-types)

This document summarizes the to be used naming conventions in the GSA code base.

Currently the GSA code base doesn't comply with the defined conventions for
historical reasons. It is intended to convert all code to comply with the rules
defined in this document in future.

New code added to GSA has to follow the rules defined in this document.

## Modules

- TypeScript and JavaScript modules should use kebab-case naming.
  For example `src/gmp/commands/oci-image-target.ts`
- Exceptions are modules containing [React hooks](#react-hooks) or [React components](#react-components).
- Modules for tests should use the same name as their tested module with a
  `.test.ts` or `.test.js` suffix and in a `__tests__` directory.
  For example `src/gmp/commands/__tests__/agent-installers.test.ts` or
  `src/web/components/bar/__tests__/ProgressBar.test.tsx`.

## Classes

- TypeScript and JavaScript classes should use PascalCase naming.
  For example `TaskCommand`.

## TypeScript Types and Interfaces

- For TypeScript type definitions and interfaces the same rules as for classes
  apply. Both should use camelCase.
  For example: `interface SectionComponentProps {...}` or
  `type EntityType = ...`.

## Functions and Methods

- Functions and also class methods should use camelCase naming.
  For example `const buildUrlParams = (params) => {...}`

## Arguments including Props

- Arguments for functions, methods, React components (aka. prop) should use
  camelCase naming.

## React Components

- TypeScript modules containing React component have to use the `.tsx` suffix.
- JavaScript modules containing React components have to use the `.jsx` suffix.
- Module names containing React components should use PascalCase and should be
  named after the component.
  For example `src/web/pages/agent-groups/AgentGroupsDialog.tsx`
- React component classes should use PascalCase.
  For example `EntitiesPage`.
- React component functions should use PascalCase.
  For example `TaskListPage`.

## React Hooks

- TypeScript modules containing React hooks should use the `.ts` suffix.
- JavaScript modules containing React hooks should use the `.js` suffix.
- React hooks names should use a `use` prefix.
- Module containing a single React hook should use camelCase and be named
  after the hook.
  For example `src/web/hooks/useFilterSortBy.ts`.
- If a module contains several hooks the naming should use kebab-case according
  to the [module](#modules) specification.
  For example `src/web/hooks/use-query/agent-installers.ts`

## React HOCs

- TypeScript modules containing React HOC (Higher Order Components) should use
  the `.tsx` suffix.
- TypeScript modules containing React HOC (Higher Order Components) should use
  the `.jsx` suffix.
- HOC names should use a `with` Prefix
- Module containing a single React HOC should use camelCase and be named
  after the hook.
  For example `src/web/utils/withGmp.jsx`.
- If a module contains several HOC the naming should use kebab-case according to
  the [module](#modules) specification.

## URLs

- URLs should use kebab-case names. For example `/scan-configs`.
- Single entity pages (aka. *Details Pages*) use singular terms for example `/task/id`.
- Pages for displaying a list of entities (aka. *List Pages*) should use plural
  terms for example `/targets`.

## Entity Types
