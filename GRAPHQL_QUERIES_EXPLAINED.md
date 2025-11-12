# Xray GraphQL Queries: getTest vs getTests

## Overview

The XRay MCP server now provides two tools for fetching test details:
1. `get_test` - Uses the `getTest` (singular) GraphQL query
2. `get_test_with_steps` - Uses the `getTests` (plural) GraphQL query ✅ **RECOMMENDED**

## The Problem with `getTest`

The `getTest` query sometimes returns `null` for tests, even when they exist in Jira:

```graphql
query {
  getTest(issueId: "EXM-123") {
    issueId
    testType { name }
    steps { id action data result }
  }
}
```

**Result:** `{ "data": { "getTest": null } }`

This appears to be a quirk or limitation of the Xray Cloud API v2.

## The Solution: `getTests`

The `getTests` query with JQL filter reliably returns test data with steps:

```graphql
query {
  getTests(jql: "key = EXM-123", limit: 1) {
    total
    results {
      issueId
      testType { name }
      steps { id action data result }
    }
  }
}
```

**Result:** Returns the test with all steps! ✅

## Implementation

### XrayCloudService

The `XrayCloudService` class now has two methods:

1. **`getTest(testKey: string)`** - Original method using `getTest` query
   - May return null
   - Kept for backward compatibility

2. **`getTestWithSteps(testKey: string)`** - New method using `getTests` query
   - Reliably returns test steps
   - Uses JQL filter: `key = ${testKey}`
   - Returns first result from results array

### Tools

1. **`get_test`** - Original tool
   - Uses `getTest` query
   - May not always return steps
   - Continues to work for basic test info from Jira API

2. **`get_test_with_steps`** - New tool ✅ **RECOMMENDED**
   - Uses `getTests` query via `getTestWithSteps()` method
   - Requires Xray Cloud API credentials
   - Always fetches test steps if they exist
   - Better error handling

## When to Use Which Tool

### Use `get_test_with_steps` when:
- ✅ You need test steps (most common use case)
- ✅ You have Xray Cloud API credentials configured
- ✅ You want reliable results

### Use `get_test` when:
- ⚠️ You only need basic Jira metadata (no steps)
- ⚠️ Xray Cloud API is not configured
- ⚠️ Maintaining backward compatibility

## Example Outputs

### Using `get_test_with_steps` (Recommended)

```
**Test: EXM-123**
**Summary:** Verify bookmarking content from content page
**Test Type:** Manual

**Test Steps:**

**Step 1:**
- **Action:** Login to expert
  users logins: https://your-instance.atlassian.net/wiki/pages/123456/Example-Documentation
- **Data:** dev env: https://your-app-dev.example.com/
- **Expected Result:** User logged in

**Step 2:**
- **Action:** Click on Meny-> Bokmerker
- **Data:** N/A
- **Expected Result:** Modal with the view of saved (bookmarked) articles displayed

**Step 3:**
- **Action:** Go back to the main page...
- **Data:** N/A
- **Expected Result:** Article marked, added to bookmarks
```

### Using `get_test` (May miss steps)

```
**Test: EXM-123**
**Summary:** Verify bookmarking content from content page

**Description:**
Verify user is be able to toggle bookmark for content on the Content Page

**Details:**
- Status: New
- Priority: Medium
- Assignee: Unassigned
...

(No test steps returned)
```

## API Endpoints

Both tools use:
- **Jira REST API v3**: For basic issue metadata
- **Xray Cloud GraphQL API v2**: For test steps
  - Endpoint: `https://xray.cloud.getxray.app/api/v2/graphql`
  - Authentication: Bearer token from `/api/v2/authenticate`

## Recommendation

**Always use `get_test_with_steps` when you need test details.** It's more reliable and specifically designed to handle the Xray Cloud API quirks.

The original `get_test` tool is maintained for backward compatibility but should not be the primary choice.

## Future Improvements

Potential enhancements:
1. Deprecate `get_test` and rename `get_test_with_steps` to `get_test`
2. Add fallback logic to automatically try `getTests` if `getTest` returns null
3. Cache test results to reduce API calls
4. Support batch fetching multiple tests in one query

## References

- [Xray Cloud GraphQL API](https://docs.getxray.app/display/XRAYCLOUD/GraphQL+API)
- [Xray Cloud REST API v2](https://docs.getxray.app/display/XRAYCLOUD/REST+API)

