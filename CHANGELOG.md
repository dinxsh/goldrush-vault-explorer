# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-06-24

### Fixed
- Resolve infinite fetch loop in opportunities page caused by recreating `addToast` function on every render
- Prevent repeated API requests to `/api/opportunities` endpoint
- Fix Toast hook to use `useCallback` for stable function references

## [0.1.0] - 2026-06-24

### Added
- Initial release of GoldRush Vault Explorer
- Opportunities discovery list with filtering and sorting
- Vault address decomposition functionality
- Toast notification system
- Responsive UI with dark theme
