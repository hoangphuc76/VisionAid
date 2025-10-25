## --------------------------------------------- Stage 1 ------------------------------------------------------------##

## --------------------------------------------- INPUT -------------------------------------------------------------##

You are an expert software architect and product designer using the Tree-of-Thought (ToT) reasoning process.

## Context

We are building a new Core Feature called **GPS Tracking** for a mobile/web application.
This feature allows users to share, update, and view real-time locations of themselves and their family members.
The backend is implemented in Node.js/Express and Firebase Realtime Database, using `location.controller.js` which includes:

- updateLocation()
- getMyLocation()
- getFamilyLocations()
- getUserLocation()
- removeLocation()

We are currently in “Phase 1: Feature Analysis & Selection (15')” — the goal is to analyze why GPS Tracking is chosen, and identify core functions to test.

## Goal

Design the **Core Feature Summary Slide** for “GPS Tracking”.
The slide must include:

1. **Why choose GPS Tracking?** (business logic & technical reasons)
2. **Functions to test** (from the controller logic)
   Output must follow the Markdown hybrid format below.

## Constraints

- The reasons must be realistic and measurable (e.g. “Relevance to real-world apps”, “Includes concurrency or sync challenges”, “Firebase integration logic”, etc.).
- The functions must be atomic and testable.

## Workflow

1. Generate 3 candidate outlines for the GPS Tracking slide (each with "Why choose" + "Functions to test" + code sample).
2. Score each using the rubric.
3. Select the top 2.
4. Refine them by merging strengths.
5. Output the final structured result below.

Rules:

- Output **only** the structured Markdown content, no raw internal reasoning.
- Keep style minimalistic and presentation-ready (for slide use).

## --------------------------------------------- INPUT -------------------------------------------------------------##

## --------------------------------------------- OUTPUT ------------------------------------------------------------##

## Why Choose GPS Tracking?

**Business & Product Logic**

- **Family Safety**: Enables families to view members' real-time locations (useful for "Find My Family"-like apps).
- **Market Relevance**: Location sharing is a core part of modern lifestyle & logistics apps (Grab, Life360, Zalo).
- **User Engagement**: Promotes trust, safety, and daily interaction inside family/community features.

**Technical Rationale**

- **Real-time Synchronization**: Uses Firebase Realtime DB for instant data propagation.
- **Concurrency Handling**: Supports multi-user updates & socket-based push to family members.
- **Secure Access Control**: Validates access only to authorized users/family members.
- **Test Coverage Potential**: Involves validation, async DB ops, socket emission, and error handling paths.

---

## Functions to Test

| Function               | Purpose                              | Test Focus                                         |
| ---------------------- | ------------------------------------ | -------------------------------------------------- |
| `updateLocation()`     | Update user's current position       | Input validation, Firebase write, socket broadcast |
| `getMyLocation()`      | Fetch current user's location        | Correct retrieval & structure                      |
| `getFamilyLocations()` | Fetch all family members’ locations  | Batch queries, missing users handling              |
| `getUserLocation()`    | Fetch one specific member’s location | Access validation & correctness                    |
| `removeLocation()`     | Delete user’s location               | Deletion success, socket removal event             |

## --------------------------------------------- OUTPUT -------------------------------------------------------------##

## --------------------------------------------- Stage 1 ------------------------------------------------------------##

## ---------------------------------------------- Stage 2 -----------------------------------------------------------##

## --------------------------------------------- INPUT -------------------------------------------------------------##

# PROMPT TITLE: Unit Test → Test Case Matrix (VisionAid GPS – Short CoT Version)

ROLE:
You are a QA engineer testing VisionAid – a GPS navigation system for visually impaired users.
Goal: Convert a Unit Test Design Document (Given/When/Then or descriptive format) into a Test Case Matrix Table.

---

CONTEXT:
#file:location.controller.js
VisionAid handles location updates, route guidance, and family tracking.
Main methods: updateLocation(), getMyLocation(), getFamilyLocations(), getUserLocation(), removeLocation().
Test focus: accuracy, reliability, safety, and edge cases (signal loss, invalid GPS, permission denied).

---

WORKFLOW (Chain-of-Thought internal reasoning):

1. Parse each test scenario from the input text.
2. Identify which method is being tested.
3. Classify the test category:
   - Happy Path = normal expected flow
   - Edge Case = boundary or limit condition
   - Error = invalid input or system failure
4. Summarize each test into 4 fields:
   Category | Test Case | Input | Expected
5. Group cases by method, output as Markdown-like table.

---

OUTPUT FORMAT:

#### [methodName]

| Category   | Test Case            | Input     | Expected        |
| ---------- | -------------------- | --------- | --------------- |
| Happy Path | short scenario title | key input | expected result |
| Edge Case  | ...                  | ...       | ...             |
| Error      | ...                  | ...       | ...             |

---

EXAMPLE INPUT:

1. updateLocation
   - Given valid coordinates → Should update Firebase
   - Given invalid lat > 90 → ValidationError
   - Given no auth → 401 Unauthorized
   - Given slow network → retry 3 times then timeout

---

EXAMPLE OUTPUT:

#### updateLocation

| Category   | Test Case           | Input                         | Expected                           |
| ---------- | ------------------- | ----------------------------- | ---------------------------------- |
| Happy Path | Valid coordinates   | userId=blindUser01, lat=16.07 | Firebase updated and notify family |
| Edge Case  | Slow network retry  | delay >5s                     | Retries 3 times then timeout       |
| Error      | Invalid latitude    | lat=91                        | Throws ValidationError             |
| Error      | Unauthorized access | userId=null                   | Returns 401                        |

---

FINAL INSTRUCTION:
Apply this workflow to convert the following Unit Test Design Document
into a formatted Test Case Matrix Table for the VisionAid GPS system.

## --------------------------------------------- INPUT -------------------------------------------------------------##

## --------------------------------------------- OUTPUT ------------------------------------------------------------##

Test Case Matrix for VisionAid Location Controller
Based on the analysis of the location controller, here are the test case matrices for each method:

updateLocation
Category Test Case Input Expected
Happy Path Valid coordinates update userId=user123, lat=16.07, lon=108.22 Location updated in Firebase, socket emits location:updated
Happy Path Update with family notification userId=user123 with family members Emits family:location:updated to all family members
Happy Path Valid boundary coordinates lat=90, lon=180 Location updated successfully
Happy Path Valid negative coordinates lat=-45.5, lon=-122.3 Location updated successfully
Edge Case Minimum valid latitude lat=-90, lon=0 Location updated successfully
Edge Case Maximum valid latitude lat=90, lon=0 Location updated successfully
Edge Case Minimum valid longitude lat=0, lon=-180 Location updated successfully
Edge Case Maximum valid longitude lat=0, lon=180 Location updated successfully
Edge Case User with empty family list userId with userFamily=[] Location updated, no family notifications
Edge Case No socket.io available req.app.get('io') returns null Location updated without socket emission
Error Latitude exceeds maximum lat=91, lon=108 Throws ValidationError: latitude must be between -90 and 90
Error Latitude below minimum lat=-91, lon=108 Throws ValidationError: latitude must be between -90 and 90
Error Longitude exceeds maximum lat=16, lon=181 Throws ValidationError: longitude must be between -180 and 180
Error Longitude below minimum lat=16, lon=-181 Throws ValidationError: longitude must be between -180 and 180
Error Non-number latitude lat="sixteen", lon=108 Throws ValidationError: latitude and longitude must be numbers
Error Non-number longitude lat=16, lon="hundred" Throws ValidationError: latitude and longitude must be numbers
Error Missing latitude lon=108 Throws ValidationError: latitude and longitude must be numbers
Error Missing longitude lat=16 Throws ValidationError: latitude and longitude must be numbers
Error Null coordinates lat=null, lon=null Throws ValidationError: latitude and longitude must be numbers
Error Undefined coordinates lat=undefined, lon=undefined Throws ValidationError: latitude and longitude must be numbers
Error No authentication token req.user.id=null Authentication middleware catches, returns 401
getMyLocation
Category Test Case Input Expected
Happy Path Retrieve own location userId=user123 Returns { success: true, location: { lat, lon, timestamp } }
Happy Path Location exists in Firebase userId with valid location data Returns stored location with coordinates
Edge Case No location previously set userId with no Firebase location Returns location as null or empty object
Edge Case Location data incomplete userId with partial location data Returns available location data
Error Firebase service error Firebase connection fails Throws error, handled by next(error)
Error User not authenticated req.user.id=null Authentication middleware catches, returns 401
getFamilyLocations
Category Test Case Input Expected
Happy Path User with multiple family members userId with userFamily=[fam1, fam2, fam3] Returns { success: true, locations: { fam1: {...}, fam2: {...}, fam3: {...} } }
Happy Path All family members have locations All family members with valid Firebase data Returns all locations with coordinates
Edge Case User with empty family list userId with userFamily=[] Returns { success: true, locations: {} }
Edge Case User with null family field userId with userFamily=null Returns { success: true, locations: {} }
Edge Case Some family members missing locations 2 of 3 family members have locations Returns locations for available members only
Edge Case Single family member userId with userFamily=[fam1] Returns single family member's location
Error User not found in database userId does not exist Throws NotFoundError: User not found
Error Firebase retrieval fails Firebase.getMultipleLocations() fails Throws error, handled by next(error)
Error User not authenticated req.user.id=null Authentication middleware catches, returns 401
getUserLocation
Category Test Case Input Expected
Happy Path Get own location currentUserId=user123, targetUserId=user123 Returns { success: true, location: {...} }
Happy Path Get family member location targetUserId in currentUser.userFamily Returns family member's location
Happy Path Valid family member with location Family member has valid Firebase location Returns coordinates and timestamp
Edge Case Requesting own location currentUserId === targetUserId Allowed, returns own location
Edge Case Family member with no location Valid family member, no Firebase data Returns location as null or empty
Error Non-family member request targetUserId not in userFamily list Throws ValidationError: You can only view locations of your family members
Error Current user not found currentUserId does not exist in DB Throws NotFoundError: User not found
Error Invalid userId parameter userId is malformed or empty Validation error or NotFoundError
Error User not authenticated req.user.id=null Authentication middleware catches, returns 401
Error Firebase service error Firebase.getLocation() fails Throws error, handled by next(error)
removeLocation
Category Test Case Input Expected
Happy Path Remove own location userId=user123 Location removed from Firebase, returns { success: true, message: 'Location removed successfully' }
Happy Path Remove with socket notification userId with active socket connection Emits location:removed event to user's socket room
Edge Case No location to remove userId with no existing location Firebase operation succeeds, returns success message
Edge Case No socket.io available req.app.get('io') returns null Location removed without socket emission
Edge Case Remove multiple times Calling removeLocation twice Both calls succeed (idempotent operation)
Error Firebase removal fails Firebase.removeLocation() throws error Error handled by next(error)
Error User not authenticated req.user.id=null Authentication middleware catches, returns 401
Summary Statistics
Total Test Cases: 61

updateLocation: 21 test cases
getMyLocation: 6 test cases
getFamilyLocations: 9 test cases
getUserLocation: 10 test cases
removeLocation: 7 test cases
Category Breakdown:

Happy Path: 18 cases
Edge Cases: 21 cases
Error Handling: 22 cases
Critical Safety Tests for Visually Impaired Users
Priority Test Case Rationale
P0 Location accuracy within 5m Precise navigation critical for safety
P0 Permission denied handling Must inform user immediately if GPS unavailable
P0 Signal loss recovery Auto-reconnect without user intervention
P0 Family notification reliability Emergency contact depends on this
P1 Battery-efficient updates Avoid draining battery during long navigation
P1 Offline mode graceful degradation Store locations locally when network unavailable
This matrix provides comprehensive coverage for all controller methods with special attention to accessibility and safety concerns for visually impaired users.

## --------------------------------------------- OUTPUT ------------------------------------------------------------##

## --------------------------------------------- Stage 3 ------------------------------------------------------------##

## --------------------------------------------- INPUT -------------------------------------------------------------##

{
"meta": {
"project": "VisionAid GPS - Location Controller Unit Test Generator",
"language": "JavaScript (Node.js, Jest)",
"output": "Jest .test.js files",
"context": "Assistive GPS tracking system for visually impaired users",e Jest unit test suites based on Test Case Matrix for VisionAid Location Controller covering updateLocation, getMyLocation, getFamilyLocations, getUserLocation, and removeLocation."
},
"workflow": [
"Step 1: Parse test matrix data by function (updateLocation, getMyLocation, getFamilyLocations, getUserLocation, removeLocation).",
"Step 2: For each function, group test cases by category (Happy Path, Edge Case, Error).",
"Step 3: Create Jest test suites using describe() for each function.",
"Step 4: Inside each describe block, write individual it() tests for each scenario.",
"Step 5: Use async/await, jest mocks, and beforeEach(jest.clearAllMocks) in every suite.",
"Step 6: Ensure firebaseService, User model, and Socket.IO are mocked properly.",
"Step 7: Validate response, error propagation, and socket emissions per Expected column.",
"Step 8: Return clean Jest test code only, no explanation or comments."
],
"output_format": "Return a valid Jest test file with describe() and it() blocks for each function. Use async/await syntax, jest.mock(), and assertions (expect). No additional explanation, only executable code.",
"prompts": [
{
"function": "updateLocation",
"context": "Handles updating a user's location in Firebase and notifying family members via Socket.IO.",
"description": "Covers validation, Firebase updates, and Socket.IO notifications for user and family members.",
"test_cases": 21,
"prompt_text": "Write a Jest unit test suite for updateLocation(req, res, next) in location.controller.js. Include mocks for firebaseService.updateLocation, User.findById, and req.app.get('io') (Socket.IO). Cover these scenarios:\n1) Valid coordinates update; expect firebaseService.updateLocation called with (userId, lat, lon), response 200, and socket emission 'location:updated'.\n2) Update with family notification; expect 'family:location:updated' events sent to all family rooms.\n3) Boundary coordinates (±90, ±180) succeed without validation error.\n4) Edge cases for min/max lat/lon succeed.\n5) Empty family list results in success, no notifications.\n6) Socket.IO missing; function still succeeds without emitting.\n7) Invalid latitude/longitude (>90 or <-90, >180 or <-180) throws ValidationError.\n8) Non-number coordinates throw ValidationError.\n9) Missing coordinates (null, undefined) throw ValidationError.\n10) Unauthenticated user (req.user.id=null) returns 401.\n11) firebaseService.updateLocation rejects; propagate error via next(error).\nUse async/await and beforeEach to clear mocks."
},
{
"function": "getMyLocation",
"context": "Retrieves the current user's last known GPS coordinates from Firebase.",
"description": "Tests success, null data, and Firebase errors when retrieving user's own location.",
"test_cases": 6,
"prompt_text": "Write a Jest unit test suite for getMyLocation(req, res, next) in location.controller.js. Include mocks for firebaseService.getLocation and User.findById. Cover these scenarios:\n1) Location exists; return 200 with { success: true, location }.\n2) No location previously set; return { success: true, location: null }.\n3) Incomplete location data returns partial coordinates.\n4) firebaseService.getLocation rejects; propagate via next(error).\n5) Unauthenticated user (req.user.id=null) returns 401.\n6) Ensure async/await and jest.clearAllMocks() in beforeEach."
},
{
"function": "getFamilyLocations",
"context": "Retrieves GPS locations for all family members linked to the user.",
"description": "Covers multiple members, empty lists, partial data, and Firebase or DB errors.",
"test_cases": 9,
"prompt_text": "Write a Jest unit test suite for getFamilyLocations(req, res, next) in location.controller.js. Mocks: User.findById, firebaseService.getMultipleLocations. Cover:\n1) Multiple family members; return { success: true, locations } for all.\n2) Empty family list returns { success: true, locations: {} }.\n3) Null family field handled as empty list.\n4) Partial data; include only non-null results.\n5) Single family member returns valid location.\n6) User not found in DB; next(NotFoundError).\n7) firebaseService.getMultipleLocations rejects; propagate via next(error).\n8) Unauthenticated user returns 401.\n9) No socket emissions expected; purely data retrieval."
},
{
"function": "getUserLocation",
"context": "Fetches location for a specific user (self or family member) with permission validation.",
"description": "Validates user-family relationship, permissions, and Firebase errors.",
"test_cases": 10,
"prompt_text": "Create a Jest unit test suite for getUserLocation(req, res, next) in location.controller.js. Include mocks for User.findById and firebaseService.getLocation. Cover:\n1) Retrieve own location successfully.\n2) Retrieve family member location successfully.\n3) Request non-family member; throw ValidationError 'You can only view locations of your family members'.\n4) Family member with no Firebase data returns null.\n5) Current user not found; next(NotFoundError).\n6) Invalid userId parameter triggers validation or NotFoundError.\n7) firebaseService.getLocation rejects; propagate error.\n8) Unauthenticated user returns 401.\n9) Use async/await and beforeEach to reset mocks.\n10) Ensure both success and error paths are validated."
},
{
"function": "removeLocation",
"context": "Removes user's location record from Firebase and optionally emits socket notifications.",
"description": "Covers deletion success, socket availability, and Firebase failure propagation.",
"test_cases": 7,
"prompt_text": "Create a Jest unit test suite for removeLocation(req, res, next) in location.controller.js. Include mocks for firebaseService.removeLocation and req.app.get('io'). Cover:\n1) Successful deletion; firebaseService.removeLocation called with userId, emits 'location:removed' via socket.\n2) Firebase error; propagate via next(error).\n3) Socket.IO unavailable (io=null); return 200 without emission.\n4) Idempotent behavior; repeated deletions succeed.\n5) Unauthenticated user (req.user.id=null) returns 401.\n6) Ensure emissions occur before completion and are skipped when io missing.\n7) Use async/await and jest.clearAllMocks in beforeEach."
}
],
"advancedTechniques": [
"Use parameterized tests for latitude/longitude boundary and invalid inputs to increase branch coverage.",
"Include step-by-step outline (CoT-lite) for test generation consistency.",
"Instrument Jest coverage reports to tag each test case (e.g., TC1.1, TC1.2).",
"Ensure one test file per controller function, with reusable mock helpers and consistent naming."
]
}

## --------------------------------------------- INPUT -------------------------------------------------------------##

## --------------------------------------------- Stage 4 ------------------------------------------------------------##

## --------------------------------------------- INPUT -------------------------------------------------------------##

Context:

- Function under test: updateLocation(req, res, next) in location.controller.js
- Uses firebaseService.updateLocation, Socket.IO, and Express res.status().
- Common errors:
  • Expected 201/204 but got 200
  • TypeError: Cannot read property 'id' of undefined
  • next() called unexpectedly

Task:

1. Analyze the error log.
2. Compare test expectations vs actual function behavior.
3. Identify root cause (wrong status, missing mock, unhandled promise, etc.).
4. using agent to fix

## --------------------------------------------- INPUT -------------------------------------------------------------##

## --------------------------------------------- Stage 5 ------------------------------------------------------------##

## --------------------------------------------- INPUT ------------------------------------------------------------##

Write a comprehensive Jest test suite for the updateLocation controller function.

✅ Requirements:

1. Use describe('2.1 updateLocation', ...) as the main test group.
2. Mock all external dependencies:
   - firebaseService.updateLocation
   - User.findById (Mongoose model)
   - req.app.get('io') returning mockIo with to and emit spies
   - res.status, res.json, and next should all be jest.fn()
3. Include beforeEach() and afterEach() for mock setup/teardown.
4. Use _realistic mock data_ and simulate both success and failure paths.
5. Cover these scenarios:
   - _Happy path:_ valid coordinates update successfully (status 200, emit event)
   - _Edge cases:_ boundary coordinates (±90°, ±180°), zero, high-precision, negative within range
   - _Validation errors:_ non-numeric, missing fields, out-of-range, invalid data types (array, object, boolean, Infinity)
   - _Error propagation:_ Firebase or User service rejection passes to next(err)
   - _Family notifications:_ multiple userFamily members trigger multiple emits
   - _Unauthenticated user:_ when req.user is null → should call next(Error)
6. Use it.each() tables for repetitive validation and boundary tests.
7. Assert:
   - firebaseService.updateLocation calls with correct args
   - res.status and res.json for success cases
   - next receives ValidationError or Error when appropriate
   - mockIo.emit and mockIo.to are called expected times
8. Ensure test names match format:
   "2.1.x - should <behavior>"

🧩 Structure Example:

```js
describe('2.1 updateLocation', () => {
  beforeEach(() => {
    // setup req, res, next, mockIo, and mocks for firebaseService, User
  });

  afterEach(() => jest.clearAllMocks());

  it('2.1.1 - should update location successfully with valid coordinates', async () => {
    ...
  });

  it.each([...])('2.1.2 - should accept boundary values', async (...) => { ... });

  // continue up to 2.1.21 including edge, invalid, and error cases
});
```
## --------------------------------------------- Stage 6 ------------------------------------------------------------##

VisionAid_BE/
├── src/
│   ├── app.js                            # 🚀 Express application
│   │
│   ├── config/                           # ⚙️ Configuration
│   │   ├── config.js                     # App config
│   │   ├── database.js                   # 🐘 PostgreSQL setup
│   │   ├── env.js                        # Environment variables
│   │   └── logger.js                     # 📝 Winston logger
│   │
│   ├── controllers/                      # 🎮 Request handlers
│   │   ├── location.controller.js        # 📍 GPS location CRUD
│   │   │   ├── updateLocation()          # ✅ TESTED (21 cases)
│   │   │   ├── getMyLocation()           # ✅ TESTED (6 cases)
│   │   │   ├── getFamilyLocations()      # ✅ TESTED (9 cases)
│   │   │   ├── getUserLocation()         # ✅ TESTED (10 cases)
│   │   │   └── removeLocation()          # ✅ TESTED (3 cases)
│   │   │
│   │   ├── user.controller.js            # 👤 User management
│   │   └── __tests__/
│   │       ├── location.controller.test.js  # 🧪 63 tests (100% pass)
│   │       └── ShoppingCart.test.js
│   │
│   ├── services/                         # 🛠️ Business logic
│   │   ├── firebase.service.js           # 🔥 Firebase Realtime DB
│   │   │   ├── updateLocation()
│   │   │   ├── getLocation()
│   │   │   ├── getMultipleLocations()
│   │   │   └── removeLocation()
│   │   │
│   │   ├── user.service.js               # User business logic
│   │   └── __tests__/
│   │       └── firebase.service.test.js  # 🧪 Firebase service tests
│   │
│   ├── models/                           # 📊 Database models (Sequelize)
│   │   ├── user.model.js                 # User schema
│   │   ├── refreshToken.model.js         # JWT refresh tokens
│   │   └── index.js                      # Model exports
│   │
│   ├── routes/                           # 🛣️ API routes
│   │   ├── auth.routes.js                # /api/auth/*
│   │   ├── user.routes.js                # /api/users/*
│   │   ├── location.routes.js            # /api/locations/*
│   │   └── index.js                      # Route aggregator
│   │
│   ├── middlewares/                      # 🔒 Express middlewares
│   │   ├── auth.middleware.js            # JWT verification
│   │   ├── validation.middleware.js      # Request validation
│   │   ├── error.middleware.js           # Error handling
│   │   ├── logger.middleware.js          # Request logging
│   │   └── index.js
│   │
│   └── utils/                            # 🧰 Utility functions
│       └── errors.js                     # Custom error classes
│           ├── ValidationError
│           ├── NotFoundError
│           ├── UnauthorizedError
│           └── ForbiddenError
│
├── coverage/                             # 📊 Jest coverage reports
│   ├── lcov-report/                      # HTML coverage
│   └── lcov.info                         # LCOV format
│
├── logs/                                 # 📝 Application logs
├── scripts/                              # 🔧 Utility scripts
│   └── check-firebase.js                 # Firebase connection test
│
├── jest.config.js                        # 🧪 Jest configuration
├── jest.setup.js                         # Jest setup file
└── server.js                             # 🚀 Server entry point

src/controllers/__tests__/
└── location.controller.test.js          # ✅ 63 tests, 100% pass rate
    │
    ├── 2.1 updateLocation (21 tests)    # GPS location update
    │   ├── ✅ Happy path
    │   ├── ✅ Boundary values (±90°, ±180°)
    │   ├── ✅ Validation errors
    │   ├── ✅ Socket.IO emissions
    │   ├── ✅ Family notifications
    │   ├── ✅ Error propagation
    │   └── ✅ Edge cases (NaN, Infinity, etc.)
    │
    ├── 2.2 getMyLocation (6 tests)
    │   ├── ✅ Location exists
    │   ├── ✅ Location not found
    │   ├── ✅ Firebase errors
    │   ├── ✅ Socket.IO behavior
    │   └── ✅ Unauthenticated users
    │
    ├── 2.3 getFamilyLocations (9 tests)
    │   ├── ✅ Multiple family members
    │   ├── ✅ Empty family list
    │   ├── ✅ User not found
    │   ├── ✅ Partial data handling
    │   └── ✅ Large family lists
    │
    ├── 2.4 getUserLocation (10 tests)
    │   ├── ✅ Own location retrieval
    │   ├── ✅ Family member access
    │   ├── ✅ Access control
    │   ├── ✅ Database errors
    │   └── ✅ Invalid parameters
    │
    └── 2.5 removeLocation (3 tests)
        ├── ✅ Successful deletion
        ├── ✅ Firebase errors
        └── ✅ Socket.IO unavailable

src/services/__tests__/
└── firebase.service.test.js             # Firebase Realtime DB tests