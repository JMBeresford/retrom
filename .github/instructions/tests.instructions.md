# Testing Instructions

## Testing Philosophy

Testing is critical to maintaining code quality. All tests should be run before committing
changes, especially for affected packages.

## Rust Testing

### Test Organization

#### Unit Tests

Place unit tests in inline modules using `#[cfg(test)]`:

```rust
// src/my_module.rs

pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, 1), 0);
    }
}
```

**Benefits:**

- Tests live close to the code they test
- Private functions can be tested
- Tests are only compiled in test mode

#### Async Tests

For async code, use `tokio::test`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_operation() {
        let result = fetch_data().await;
        assert!(result.is_ok());
    }
}
```

#### Integration Tests

Place integration tests in the `tests/` directory at the package root:

```
package-name/
├── src/
│   └── lib.rs
├── tests/
│   ├── integration_test_1.rs
│   └── integration_test_2.rs
└── Cargo.toml
```

Each file in `tests/` is compiled as a separate test binary. Use for:

- Testing public API
- Cross-module functionality
- End-to-end scenarios

### Existing Test Coverage

The codebase has inline test modules in:

- `packages/service-common/src/media_cache/index.rs`
- `packages/service-common/src/media_cache/utils.rs`
- `packages/grpc-service/src/server/mod.rs`
- `packages/grpc-service/src/library/content_resolver/mod.rs`

### Running Rust Tests

#### Via NX

Run tests across all packages:

```bash
pnpm nx run-many -t cargo:test
```

Run tests for a specific package:

```bash
pnpm nx cargo:test <package-name>
```

Run tests with output:

```bash
pnpm nx cargo:test <package-name> -- --nocapture
```

Run specific test:

```bash
pnpm nx cargo:test <package-name> -- test_name
```

#### Via Cargo (Direct)

Run all tests in workspace:

```bash
cargo test
```

Run tests for specific package:

```bash
cargo test -p <package-name>
```

Run with debug output:

```bash
cargo test -- --nocapture
```

### Test Writing Best Practices

#### Naming

- Use descriptive test names that explain what is being tested
- Prefix with `test_` for clarity
- Examples: `test_user_creation_succeeds`, `test_invalid_email_returns_error`

#### Structure

Follow the Arrange-Act-Assert pattern:

```rust
#[test]
fn test_feature() {
    // Arrange - Set up test data
    let input = create_test_input();
    
    // Act - Execute the code under test
    let result = function_under_test(input);
    
    // Assert - Verify the results
    assert_eq!(result, expected_value);
}
```

#### Assertions

- Use `assert_eq!` and `assert_ne!` for equality checks
- Use `assert!` for boolean conditions
- Use `matches!` macro for pattern matching
- For Result types: `assert!(result.is_ok())` or `assert!(result.is_err())`

#### Test Data

- Create helper functions for common test data
- Use descriptive variable names
- Keep test data minimal but realistic

#### Mocking

When testing code with external dependencies:

- Consider using trait bounds and passing test implementations
- Use `mockall` crate if extensive mocking is needed
- Keep mocks simple and focused

## TypeScript Testing

### Current State

Currently, no dedicated test files exist in the TypeScript packages. When implementing tests:

### Recommended Setup

For future TypeScript testing:

**Framework**: Vitest (integrates well with Vite)

**Structure**:

```
package-name/
├── src/
│   ├── component.tsx
│   └── component.test.tsx
└── package.json
```

**Test Files**:

- Co-locate tests with source: `*.test.ts`, `*.test.tsx`
- Or use separate `__tests__/` directory

**Patterns**:

- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock API calls with MSW (Mock Service Worker)

**Running**:

```bash
pnpm nx test <package-name>
```

## Pre-Commit Testing Requirements

Before committing code, run tests for affected packages:

### For Rust Changes

```bash
pnpm nx run-many -t cargo:test -p <affected-packages>
```

Or test all packages:

```bash
pnpm nx run-many -t cargo:test
```

### For TypeScript Changes

Once tests are implemented:

```bash
pnpm nx run-many -t test -p <affected-packages>
```

### CI/CD Testing

Tests should run in CI pipelines:

- On pull requests
- Before merges
- On main branch commits

## Test Coverage

While coverage tools are not currently configured, aim for:

- **High coverage** of critical paths
- **100% coverage** of error handling paths
- **Tests for edge cases** and boundary conditions

## Writing Effective Tests

### Do's

- ✅ Test behavior, not implementation
- ✅ Write tests for bug fixes to prevent regressions
- ✅ Keep tests focused and independent
- ✅ Use descriptive test names
- ✅ Test error paths and edge cases
- ✅ Keep tests fast and deterministic

### Don'ts

- ❌ Don't test framework code or external libraries
- ❌ Don't write flaky tests that sometimes fail
- ❌ Don't skip tests to make CI pass
- ❌ Don't test private implementation details
- ❌ Don't write overly complex test setups

## Debugging Tests

### Rust

Print debug output:

```bash
pnpm nx cargo:test <package> -- --nocapture
```

Run specific test with debug info:

```bash
RUST_LOG=debug pnpm nx cargo:test <package> -- test_name --nocapture
```

### TypeScript

When Vitest is configured:

```bash
pnpm nx test <package> -- --reporter=verbose
```

## Test Maintenance

- **Keep tests up to date** with code changes
- **Refactor tests** when refactoring code
- **Delete obsolete tests** that no longer apply
- **Update test data** to reflect current requirements
- **Review test failures** carefully before fixing

## Performance Testing

For performance-critical code:

- Use Criterion.rs for Rust benchmarks
- Measure before and after optimization
- Add regression tests for performance

## Integration Testing

For cross-package integration:

- Test at the highest reasonable level
- Use realistic scenarios
- Consider using Docker for external dependencies (databases, etc.)
- Keep integration tests separate from unit tests

## Continuous Improvement

- Add tests when fixing bugs
- Increase coverage for critical paths
- Review and improve test quality during code reviews
- Share testing patterns across the team
