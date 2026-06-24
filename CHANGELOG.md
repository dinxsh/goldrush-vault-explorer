# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-06-24

### Added
- Comprehensive documentation section with 6 pages:
  - Getting Started guide with step-by-step deposit instructions
  - How It Works explaining vault mechanics and yield sources
  - Strategy Guide with conservative, balanced, and growth strategies
  - Security & Audits page with audit standards and risk disclosure
  - FAQ with 11 common questions and answers
- Documentation sidebar navigation with active link tracking
- Expanded vault database from 6 to 16 opportunities
- Multi-chain support: Ethereum, Base, Polygon
- New protocols: Aave, Curve, Yearn, Compound, Lido, Rocket Pool
- Live statistics dashboard on Earn page:
  - Top APY across all vaults
  - Total TVL aggregation
  - Average APY calculation
  - Available chains counter
- Navbar documentation link

### Improved
- Enhanced Earn page header with comprehensive stats
- GoldRush theme consistency across all new pages
- Better visual hierarchy in documentation

## [0.1.1] - 2026-06-24

### Fixed
- Resolve infinite fetch loop in opportunities page caused by recreating `addToast` function on every render
- Prevent repeated API requests to `/api/opportunities` endpoint
- Fix Toast hook to use `useCallback` for stable function references
- Display asset name in opportunity detail page Quick Facts section

## [0.1.0] - 2026-06-24

### Added
- Initial release of GoldRush Vault Explorer
- Opportunities discovery list with filtering and sorting
- Vault address decomposition functionality
- Toast notification system
- Responsive UI with dark theme
