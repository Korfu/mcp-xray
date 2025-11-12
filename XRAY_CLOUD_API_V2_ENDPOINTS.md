# Xray Cloud API v2 - Complete Endpoint List

## Important Note
Xray Cloud uses **GraphQL API** for querying data (tests, test runs, etc.) and **REST API v2** for importing/exporting results.

**GraphQL Endpoint:** `https://xray.cloud.getxray.app/api/v2/graphql`
**REST Base URL:** `https://xray.cloud.getxray.app/api/v2`

## Authentication
- **POST** `/authenticate` - Get JWT token
  - Input: `{ client_id, client_secret }`
  - Output: JWT token string

## Import Operations (REST)

### Test Execution Results Import
- **POST** `/import/execution` - Import Xray JSON format results
- **POST** `/import/execution/cucumber` - Import Cucumber JSON results  
- **POST** `/import/execution/junit` - Import JUnit XML results
- **POST** `/import/execution/testng` - Import TestNG XML results
- **POST** `/import/execution/nunit` - Import NUnit XML results
- **POST** `/import/execution/xunit` - Import XUnit XML results
- **POST** `/import/execution/robot` - Import Robot Framework XML results
- **POST** `/import/execution/behave` - Import Behave JSON results

### Feature Files Import (BDD)
- **POST** `/import/feature` - Import Cucumber .feature files
  - Can create or update tests from Gherkin scenarios

## Export Operations (REST)

### Cucumber Features Export
- **GET** `/export/cucumber` - Export all Cucumber features for project/filter
- **GET** `/export/cucumber?keys={testKeys}` - Export specific Cucumber tests

## GraphQL Operations

### Queries (Read Operations)
```graphql
# Get test details with steps
query {
  getTest(issueId: "EXM-123") {
    issueId
    jira(fields: ["key", "summary", "description"])
    testType {
      name
      kind
    }
    steps {
      id
      data
      action
      result
    }
  }
}

# Get test executions
query {
  getTestExecutions(testIssueIds: ["EXM-123"], limit: 10) {
    results {
      issueId
      jira(fields: ["key", "summary"])
    }
  }
}

# Get test runs
query {
  getTestRuns(testExecIssueIds: ["EXM-456"], limit: 10) {
    results {
      id
      status {
        name
      }
      test {
        issueId
      }
    }
  }
}

# Get test plans
query {
  getTestPlans(projectKey: "TES", limit: 10) {
    results {
      issueId
      jira(fields: ["key", "summary"])
    }
  }
}
```

### Mutations (Write Operations)
```graphql
# Update test run status
mutation {
  updateTestRunStatus(id: "123456", status: "PASS")
}

# Add comment to test run
mutation {
  updateTestRun(id: "123456", comment: "Test passed successfully")
}
```

## Tools to Implement

### Priority 1 - Core Testing Operations
1. ✅ `get_test` - Get test details with steps (via GraphQL)
2. ⭕ `import_execution_results` - Import test results (Xray JSON)
3. ⭕ `import_cucumber_results` - Import Cucumber JSON results
4. ⭕ `import_junit_results` - Import JUnit XML results
5. ⭕ `import_testng_results` - Import TestNG XML results
6. ⭕ `export_cucumber_features` - Export Cucumber features

### Priority 2 - Advanced Operations
7. ⭕ `get_test_runs` - Get test runs via GraphQL
8. ⭕ `get_test_executions_for_test` - Get executions for a specific test
9. ⭕ `update_test_run_status` - Update test run status
10. ⭕ `add_test_run_comment` - Add comment to test run
11. ⭕ `add_test_run_defect` - Link defect to test run
12. ⭕ `add_test_run_evidence` - Upload evidence/attachment

### Priority 3 - Organization & Management  
13. ⭕ `import_feature_file` - Import .feature file (BDD)
14. ⭕ `get_test_plans` - List test plans
15. ⭕ `get_test_sets` - List test sets
16. ⭕ `get_test_repository_folders` - Get folder hierarchy
17. ⭕ `add_test_to_folder` - Organize tests in folders

## Implementation Strategy

1. **Fix existing `get_test` tool** - Switch from REST to GraphQL
2. **Add GraphQL support** - Create GraphQLService class
3. **Add import tools** - For CI/CD integration (high value)
4. **Add export tools** - For backup/reporting
5. **Add management tools** - For organization

## References
- [Xray Cloud GraphQL API Docs](https://us.xray.cloud.getxray.app/doc/graphql/index.html)
- [Xray Cloud REST API v2](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- [Xray Postman Collections](https://github.com/Xray-App/xray-postman-collections)

