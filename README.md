# Xray MCP

A Model Context Protocol (MCP) server that integrates Cursor IDE with Xray Test Management for Jira, allowing you to manage tests, test executions, and test plans directly from your development environment.

## Features

### Tests
- **List Tests**: Fetch all tests from your Jira project with filtering options
- **Get Test Details**: Retrieve detailed test information **including test steps via GraphQL** ✨
- **Get Test With Steps**: **NEW!** Reliably fetch test details with steps using the GraphQL `getTests` query 🚀
- **Create Test**: Create new manual or automated tests
- **Update Test**: Modify existing tests

### Test Executions
- **List Test Executions**: View all test executions in a project
- **Get Test Execution Details**: See detailed execution results including test runs
- **Create Test Execution**: Create new test execution sessions
- **Update Test Run**: Record test results (PASS, FAIL, TODO, EXECUTING, ABORTED)

### Test Plans
- **List Test Plans**: View all test plans in a project
- **Get Test Plan Details**: See test plan information with associated tests
- **Create Test Plan**: Create new test plans
- **Add Tests to Test Plan**: Associate tests with existing plans

### Test Sets
- **List Test Sets**: View all test sets in a project
- **Get Test Set Details**: See test set information with associated tests

### Import Operations (CI/CD Integration) 🚀 NEW!
- **Import Xray JSON Results**: Import test execution results in Xray JSON format
- **Import Cucumber Results**: Import Cucumber JSON test results
- **Import JUnit Results**: Import JUnit XML test results
- **Import TestNG Results**: Import TestNG XML test results
- **Import NUnit Results**: Import NUnit XML test results
- **Import Robot Framework Results**: Import Robot Framework XML test results
- **Import Behave Results**: Import Behave JSON test results
- **Import Feature Files**: Import Cucumber .feature files (BDD scenarios)

### Export Operations 📤 NEW!
- **Export Cucumber Features**: Export Cucumber feature files from Xray

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Jira Cloud account with Xray Test Management plugin installed
- Jira API token for authentication

## Installation

### Option 1: Install from npm (Recommended)

The package is available on npm and can be used directly with npx:

```bash
npx @korfu/xray-mcp
```

No installation required! Continue to [Generate Jira API Token](#generate-jira-api-token) section.

### Option 2: Local Development Setup

If you want to contribute or modify the code:

#### 1. Clone the Repository

```bash
git clone https://github.com/Korfu/mcp-xray.git
cd mcp-xray
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Build the Project

```bash
npm run build
```

## Setup

### Generate Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a descriptive name (e.g., "Xray MCP Integration")
4. Copy the generated token - **you won't be able to see it again!**

### 4. Configure Environment Variables

You'll need the following environment variables:

**Required:**
- `JIRA_BASE_URL`: Your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
- `JIRA_EMAIL`: Your Jira account email
- `JIRA_API_TOKEN`: The API token from step 3

**Optional (for test steps):**
- `XRAY_CLIENT_ID`: Your Xray Cloud API client ID
- `XRAY_CLIENT_SECRET`: Your Xray Cloud API client secret

### 4.1. Get Xray Cloud API Credentials (Optional - for Test Steps)

To fetch test steps from Xray, you need Xray Cloud API credentials:

1. Log in to your Jira instance
2. Go to **Settings (⚙️)** → **Apps** → **Manage apps**
3. In the left sidebar, find **Xray** section
4. Click on **API Keys** (or **Cloud API**)
5. Click **Create API Key**
6. Give it a name (e.g., "MCP Integration")
7. Copy the **Client ID** and **Client Secret**
8. Save these securely - you won't be able to see the secret again!

**Note:** Without Xray Cloud API credentials, the MCP will still work for listing and managing tests, but test steps won't be fetched.

### 5. Add to Cursor MCP Configuration

Add the following configuration to your Cursor MCP settings file (usually at `~/.cursor/mcp.json` or similar):

**For npm installation (recommended):**
```json
{
  "mcpServers": {
    "xray": {
      "command": "npx",
      "args": ["-y", "@korfu/xray-mcp"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token-here",
        "XRAY_CLIENT_ID": "your-xray-client-id",
        "XRAY_CLIENT_SECRET": "your-xray-client-secret"
      }
    }
  }
}
```

**Important**: 
- Replace the values with your actual credentials
- `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are optional - omit them if you don't need test step details

### 6. Restart Cursor

After adding the configuration, restart Cursor IDE to load the MCP server.

## Usage

Once configured, you can use the following tools in Cursor:

### Tests
- `list_tests` - List all tests in a project
- `get_test` - Get detailed test information (may not always return steps)
- `get_test_with_steps` - **NEW!** Get detailed test information with steps (uses reliable GraphQL query)
- `create_test` - Create a new test
- `update_test` - Update an existing test

### Test Executions
- `list_test_executions` - List test executions
- `get_test_execution` - Get test execution details
- `create_test_execution` - Create a new test execution
- `update_test_run` - Update test run status

### Test Plans
- `list_test_plans` - List all test plans
- `get_test_plan` - Get test plan details
- `create_test_plan` - Create a new test plan
- `add_tests_to_test_plan` - Add tests to a plan

### Test Sets
- `list_test_sets` - List all test sets
- `get_test_set` - Get test set details

### Import Operations 🚀 NEW!
- `import_execution_results` - Import Xray JSON format results
- `import_cucumber_results` - Import Cucumber JSON results
- `import_junit_results` - Import JUnit XML results
- `import_testng_results` - Import TestNG XML results
- `import_nunit_results` - Import NUnit XML results
- `import_robot_results` - Import Robot Framework XML results
- `import_behave_results` - Import Behave JSON results
- `import_feature_file` - Import Cucumber .feature files

### Export Operations 📤 NEW!
- `export_cucumber_features` - Export Cucumber features as .feature files

## Examples

### Basic Operations

#### Get Test with Steps (RECOMMENDED)
```
Get test EXM-123 with steps
```

This uses the new `get_test_with_steps` tool which reliably fetches test steps.

Output includes test steps:
```
**Test: EXM-123**
**Summary:** Verify user login functionality

**Test Type:** Manual

**Test Steps:**

**Step 1:**
- **Action:** Navigate to the login page
- **Data:** URL: https://example.com/login
- **Expected Result:** Login page is displayed

**Step 2:**
- **Action:** Enter valid credentials and click Submit
- **Data:** Username: testuser, Password: ********
- **Expected Result:** User is successfully authenticated

**Step 3:**
- **Action:** Verify user dashboard is displayed
- **Data:** N/A
- **Expected Result:** Dashboard shows user profile and navigation menu
```

### CI/CD Integration Examples 🚀

#### Import JUnit Results
```
Import JUnit test results from file test-results/junit.xml
```

#### Import Cucumber Results
```
Import Cucumber results from file cucumber-report.json
```

#### Export Feature Files
```
Export Cucumber features for tests EXM-1,EXM-2,EXM-3
```

### Legacy Examples

### List Tests in a Project
```
List all tests in project PROJ with label "regression"
```

### Create a Test
```
Create a new manual test in project PROJ with summary "Login validation test" and description "Verify user can login with valid credentials"
```

### Update Test Run Status
```
Update test run for test PROJ-123 in execution PROJ-456 with status PASS and comment "All assertions passed"
```

### Create Test Execution
```
Create a test execution in project PROJ with summary "Sprint 5 Regression" and add tests PROJ-123, PROJ-124, PROJ-125
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Project Structure
```
XRayMCP/
├── src/
│   ├── index.ts                  # Main MCP server
│   ├── types.ts                  # TypeScript interfaces
│   ├── services/
│   │   └── XrayCloudService.ts   # Xray Cloud API service (GraphQL + REST)
│   └── tools/
│       ├── tests/                # Test operations
│       │   ├── listTests.ts
│       │   ├── getTest.ts
│       │   ├── createTest.ts
│       │   └── updateTest.ts
│       ├── test-executions/      # Test execution operations
│       │   ├── listTestExecutions.ts
│       │   ├── getTestExecution.ts
│       │   ├── createTestExecution.ts
│       │   └── updateTestRun.ts
│       ├── test-plans/           # Test plan operations
│       │   ├── listTestPlans.ts
│       │   ├── getTestPlan.ts
│       │   ├── createTestPlan.ts
│       │   └── addTestsToTestPlan.ts
│       ├── test-sets/            # Test set operations
│       │   ├── listTestSets.ts
│       │   └── getTestSet.ts
│       ├── import/               # Import operations (NEW!)
│       │   ├── importExecutionResults.ts
│       │   ├── importCucumberResults.ts
│       │   ├── importJUnitResults.ts
│       │   ├── importTestNGResults.ts
│       │   ├── importNUnitResults.ts
│       │   ├── importRobotResults.ts
│       │   ├── importBehaveResults.ts
│       │   └── importFeatureFile.ts
│       └── export/               # Export operations (NEW!)
│           └── exportCucumberFeatures.ts
├── dist/                         # Compiled JavaScript output
├── XRAY_CLOUD_API_V2_ENDPOINTS.md     # API documentation
├── XRAY_CLOUD_V2_IMPLEMENTATION.md    # Implementation details
├── package.json
├── tsconfig.json
└── README.md
```

## API Architecture

### Xray Cloud API v2 - Dual Approach

This MCP server uses **two complementary APIs** provided by Xray Cloud:

#### 1. GraphQL API (for Queries)
- **Endpoint:** `https://xray.cloud.getxray.app/api/v2/graphql`
- **Used For:** Fetching test details with steps
- **Why:** Xray Cloud exposes test steps only via GraphQL, not REST

```graphql
query {
  getTest(issueId: "EXM-123") {
    issueId
    steps {
      id
      action
      data
      result
    }
  }
}
```

#### 2. REST API v2 (for Import/Export)
- **Base URL:** `https://xray.cloud.getxray.app/api/v2`
- **Used For:** Importing test results, exporting features
- **Endpoints:**
  - `POST /import/execution/*` - Import results (multiple formats)
  - `POST /import/feature` - Import BDD features
  - `GET /export/cucumber` - Export BDD features

### Authentication
All operations use JWT Bearer tokens obtained via:
```
POST /api/v2/authenticate
Body: { client_id, client_secret }
Response: "eyJhbGciOiJIUzI1NiI..."
```

Tokens are:
- Cached for 50 minutes
- Automatically refreshed
- Stored in memory only (not persisted)

## Troubleshooting

### Authentication Issues
- Verify your Jira email and API token are correct
- Ensure the API token has the correct permissions
- Check that your Jira base URL is correct (should not end with a slash)

### "Test issue type not found" Error
- Ensure Xray is installed in your Jira instance
- Verify the project has Xray enabled
- Check that you have permission to create issues in the project

### Connection Issues
- Verify your internet connection
- Check if your Jira instance is accessible
- Ensure the MCP server is running (check Cursor's MCP logs)

### Test Not Found
- Verify the test key is correct (e.g., PROJ-123)
- Ensure you have access to the test
- Check that the test exists in Jira

### MCP Server Not Loading
- Verify the path to `dist/index.js` is correct in your Cursor configuration
- Ensure Node.js is installed and accessible from the command line
- Check Cursor's MCP server logs for error messages
- Make sure you've run `npm run build` to compile the TypeScript code

### Test Steps Not Appearing
- Ensure you've configured `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` in your MCP configuration
- Verify your Xray Cloud API credentials are correct
- Check that your Xray license includes API access
- The test must be a Manual test type (Cucumber and Generic tests have different step formats)
- Check Cursor's MCP logs for authentication errors

## API Endpoints Used

This MCP uses the following Jira and Xray API endpoints:

- **Jira REST API v3**: `/rest/api/3/search/jql`, `/rest/api/3/issue/*` for general issue operations
- **Xray Cloud API v2**: `https://xray.cloud.getxray.app/api/v2/*` for test steps and detailed test information (optional)

## Security Notes

- Keep your Jira API token secure and never commit it to version control
- Keep your Xray Cloud API credentials (Client ID and Secret) secure
- Use environment variables or secure configuration management for credentials
- The API token should only have the minimum required permissions
- Consider rotating your API tokens regularly
- Xray API credentials are separate from Jira credentials and provide access to test data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Related Resources

- [Xray Documentation](https://docs.getxray.app/)
- [Xray REST API](https://docs.getxray.app/space/XRAY/301468387/REST+API)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT License - see LICENSE file for details

## Author

Korfu

## Acknowledgments

- Built following the Model Context Protocol specification
- Inspired by the BitbucketMCP implementation pattern
- Uses Xray Test Management for Jira by Xblend

