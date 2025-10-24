# 🧪 Unit Test Execution Guide - Location Controller & Firebase Service

## 📋 Overview

This document provides instructions for running the comprehensive unit test suites for:
- **Location Controller** (`src/controllers/location.controller.js`)
- **Firebase Service** (`src/services/firebase.service.js`)

## 🎯 Test Coverage Summary

### Location Controller Tests (30 test cases)
- ✅ `updateLocation` - 8 tests
- ✅ `getMyLocation` - 4 tests  
- ✅ `getFamilyLocations` - 6 tests
- ✅ `getUserLocation` - 6 tests
- ✅ `removeLocation` - 5 tests

### Firebase Service Tests (19 test cases)
- ✅ `initialize` - 4 tests
- ✅ `updateLocation` - 4 tests
- ✅ `getLocation` - 4 tests
- ✅ `getMultipleLocations` - 4 tests
- ✅ `removeLocation` - 3 tests
- ✅ `listenToLocation` - 4 tests

**Total: 49 comprehensive unit tests**

---

## 🚀 Quick Start

### Install Dependencies
```powershell
npm install
```

### Run All Tests
```powershell
npm test
```

### Run with Coverage Report
```powershell
npm run test:coverage
```

### Run in Watch Mode (for development)
```powershell
npm run test:watch
```

### Run Only Unit Tests
```powershell
npm run test:unit
```

---

## 📊 Test Execution Commands

### Run Specific Test File

**Location Controller Tests:**
```powershell
npx jest src/controllers/__tests__/location.controller.test.js
```

**Firebase Service Tests:**
```powershell
npx jest src/services/__tests__/firebase.service.test.js
```

### Run Tests with Verbose Output
```powershell
npx jest --verbose
```

### Run Tests and Generate HTML Coverage Report
```powershell
npm run test:coverage
# Open: coverage/lcov-report/index.html
```

### Run Tests in CI/CD Pipeline
```powershell
npm run test:ci
```

---

## 🔍 Test Structure Explanation

### Location Controller Test Structure
```
location.controller.test.js
├── 2.1 updateLocation
│   ├── 2.1.1 - Valid coordinates
│   ├── 2.1.2 - Boundary values (parametrized)
│   ├── 2.1.3 - Invalid range (parametrized)
│   ├── 2.1.4 - Non-numeric coordinates (parametrized)
│   ├── 2.1.5 - Socket emission to family
│   ├── 2.1.6 - No Socket.IO
│   ├── 2.1.7 - Firebase error propagation
│   └── 2.1.8 - User.findById error
├── 2.2 getMyLocation
│   ├── 2.2.1 - Location exists
│   ├── 2.2.2 - Location not found
│   ├── 2.2.3 - Firebase service error
│   └── 2.2.4 - No socket emissions
├── 2.3 getFamilyLocations
│   ├── 2.3.1 - Multiple family members
│   ├── 2.3.2 - Empty family list
│   ├── 2.3.3 - User not found
│   ├── 2.3.4 - Partial location data
│   ├── 2.3.5 - Firebase service error
│   └── 2.3.6 - Null userFamily
├── 2.4 getUserLocation
│   ├── 2.4.1 - Own location
│   ├── 2.4.2 - Family member location
│   ├── 2.4.3 - Non-family member denied
│   ├── 2.4.4 - Current user not found
│   ├── 2.4.5 - Database error
│   └── 2.4.6 - Empty family array
└── 2.5 removeLocation
    ├── 2.5.1 - Successful deletion
    ├── 2.5.2 - Firebase error
    ├── 2.5.3 - Socket.IO unavailable
    ├── 2.5.4 - Removal before emission
    └── 2.5.5 - Concurrent requests
```

---

## 📈 Expected Coverage Metrics

### Target Coverage (as per test design):
- **Branches**: ≥95%
- **Functions**: ≥95%
- **Lines**: ≥95%
- **Statements**: ≥95%

### Minimum Acceptable Coverage:
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%
- **Statements**: ≥80%

---

## 🧩 Mock Strategy

### Dependencies Mocked:
1. **firebaseService** - All async operations
2. **User Model** - Database queries
3. **Socket.IO** - Event emissions
4. **Logger** - Console output
5. **Firebase Admin SDK** - Initialization and database

### Mock Cleanup:
- `jest.clearAllMocks()` in `beforeEach` of every test suite
- Ensures test isolation and prevents mock pollution

---

## ✅ Validation Checklist

Run this checklist after test execution:

- [ ] All 49 tests pass
- [ ] Coverage ≥80% for all metrics
- [ ] No console errors or warnings
- [ ] Test execution time <30 seconds
- [ ] Coverage report generated in `coverage/`
- [ ] No flaky tests (run 3 times to confirm)

---

## 🐛 Troubleshooting

### Issue: Tests Fail with "Cannot find module"
**Solution:**
```powershell
npm install
# Ensure all dev dependencies are installed
```

### Issue: Mock not working properly
**Solution:**
```powershell
# Clear Jest cache
npx jest --clearCache
npm test
```

### Issue: Coverage report not generated
**Solution:**
```powershell
# Manually run with coverage
npx jest --coverage --collectCoverageFrom="src/**/*.js"
```

### Issue: Tests timeout
**Solution:**
Edit `jest.config.js` and increase `testTimeout`:
```javascript
testTimeout: 15000
```

---

## 📁 Test Files Location

```
VisionAid_BE/
├── src/
│   ├── controllers/
│   │   ├── __tests__/
│   │   │   └── location.controller.test.js  ← 30 tests
│   │   └── location.controller.js
│   └── services/
│       ├── __tests__/
│       │   └── firebase.service.test.js      ← 19 tests
│       └── firebase.service.js
├── jest.config.js                             ← Jest configuration
├── jest.setup.js                              ← Global test setup
└── package.json                               ← Test scripts
```

---

## 🎨 Test Output Format

### Successful Test Run:
```
PASS  src/controllers/__tests__/location.controller.test.js
  LocationController
    2.1 updateLocation
      ✓ 2.1.1 - should update location successfully (15ms)
      ✓ 2.1.2 - should accept boundary values (8ms)
      ...
    2.2 getMyLocation
      ✓ 2.2.1 - should return location when it exists (5ms)
      ...

Test Suites: 2 passed, 2 total
Tests:       49 passed, 49 total
Coverage:    95% Statements, 95% Branches, 95% Functions, 95% Lines
```

---

## 📊 Coverage Report Access

After running `npm run test:coverage`:

1. **Terminal Summary**: Displayed immediately
2. **HTML Report**: `coverage/lcov-report/index.html`
3. **LCOV Format**: `coverage/lcov.info` (for CI/CD tools)

### View HTML Report:
```powershell
# Windows
start coverage/lcov-report/index.html

# Or open manually in browser
```

---

## 🔄 Continuous Integration

### GitHub Actions Example:
```yaml
- name: Run Unit Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## 📝 Test Maintenance

### Adding New Tests:
1. Create test file in `__tests__` directory
2. Follow naming convention: `[module].test.js`
3. Use test IDs (e.g., 2.1.1) for traceability
4. Update this guide with new test counts

### Updating Existing Tests:
1. Run tests before changes
2. Update test cases
3. Verify coverage doesn't decrease
4. Run full suite to ensure no regressions

---

## 🏆 Best Practices Applied

✅ **Parametrized Tests**: Used for boundary values and error messages  
✅ **Mock Isolation**: Each test has independent mocks  
✅ **Async/Await**: All async operations properly handled  
✅ **Error Testing**: Both happy paths and error paths covered  
✅ **Clear Naming**: Test IDs and descriptive names  
✅ **Complete Coverage**: All public methods tested  
✅ **Edge Cases**: Boundary values, null handling, empty arrays  
✅ **Integration Points**: Socket.IO, Firebase, Database mocked

---

## 📞 Support

For issues or questions:
1. Check test output for specific error messages
2. Review mock setup in test files
3. Verify environment variables in `jest.setup.js`
4. Consult Jest documentation: https://jestjs.io/docs/getting-started

---

## 📄 Related Documentation

- [Unit Test Design Document](./UnitTests_LocationController_Summary.txt)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Architecture Overview](../VisionAid-API/ARCHITECTURE.md)

---

**Generated**: 2025-10-24  
**Test Framework**: Jest 29.7.0  
**Total Test Cases**: 49  
**Target Coverage**: ≥95%
