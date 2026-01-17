# Durion Common

Shared entities, services, and utilities

## Overview

This component is part of the Durion ERP system built on the Moqui Framework.

## Purpose

Provide shared entities, services, and utilities used across Durion components to keep cross-cutting concerns consistent (common types, shared helpers, and reusable UI patterns).

## Scope

In scope:
- Shared data types and base entities used by multiple domains/components
- Cross-cutting utilities and common services that are not owned by a single domain
- Reusable screens, widgets, and templates intended for broad reuse

Out of scope:
- Domain-specific business rules and authoritative workflows (owned by the domain components)
- Cross-service integrations that belong in dedicated integration/bridge components

## Structure

- `data/` - Seed and demo data
- `entity/` - Entity definitions
- `screen/` - UI screens and forms
- `service/` - Service definitions
- `src/` - Groovy/Java source code
- `template/` - Email and document templates
- `test/` - Test specifications

## Dependencies

See `component.xml` for component dependencies.

## Installation

This component is managed via `myaddons.xml` in the Moqui project root.

## License

Same as Durion project.

---

**Last Updated:** December 09, 2025
