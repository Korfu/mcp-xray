# Xray Cloud API Setup Guide

This guide explains how to configure Xray Cloud API to fetch test steps in the XRay MCP.

## What This Enables

With Xray Cloud API configured, the MCP will be able to fetch:
- ✅ Detailed test steps (Action, Data, Expected Result)
- ✅ Test step attachments
- ✅ Additional test metadata from Xray Cloud

Without Xray Cloud API:
- ⚠️ Test listing still works
- ⚠️ Test metadata (summary, status, priority) still works
- ❌ Test steps will not be fetched

## Step-by-Step Setup

### 1. Generate Xray Cloud API Credentials

1. **Log in to Jira** at your instance (e.g., https://your-instance.atlassian.net)

2. **Navigate to Apps Settings:**
   - Click the **⚙️ Settings** icon (top right)
   - Select **Apps** from the dropdown
   - Click **Manage apps** in the left sidebar

3. **Find Xray Settings:**
   - In the left sidebar, scroll down to find the **Xray** section
   - Click on **API Keys** or **Cloud API**
   
   > **Note:** If you don't see this option, you may not have admin permissions or Xray might not be installed.

4. **Create New API Key:**
   - Click **Create API Key** button
   - Give it a descriptive name (e.g., "MCP Integration" or "Test Automation")
   - Click **Generate** or **Create**

5. **Save Your Credentials:**
   ```
   Client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   ⚠️ **IMPORTANT:** Save these immediately! The Client Secret is only shown once.

### 2. Update Your MCP Configuration

Edit your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "xray": {
      "command": "node",
      "args": ["/Users/korfu/ownProjects/XRayMCP/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-instance.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "XRAY_CLIENT_ID": "your-xray-client-id-here",
        "XRAY_CLIENT_SECRET": "your-xray-client-secret-here"
      }
    }
  }
}
```

### 3. Restart Cursor

After updating the configuration:
1. Save the `mcp.json` file
2. Completely quit Cursor
3. Restart Cursor

### 4. Test the Configuration

Try fetching a test with steps:

```
Get test EXM-123
```

You should now see output like:

```
**Test: EXM-123**

**Summary:** Verify bookmarking content from content page

**Description:**
Verify user is be able to toggle bookmark for content on the Content Page

**Details:**
- Status: New
- Priority: Medium
...

**Test Steps:**

1. **Action:** Login to expert
   **Data:** dev env: https://your-app-dev.example.com/
   **Expected Result:** User logged in

2. **Action:** Click on Meny-> Bokmerker
   **Data:** None
   **Expected Result:** Modal with the view of the list of saved (bookmarked) articles is displayed
```

## Troubleshooting

### "Xray Cloud API not configured" message

This means the `XRAY_CLIENT_ID` or `XRAY_CLIENT_SECRET` environment variables are not set or empty.

**Solution:** Add them to your `mcp.json` configuration and restart Cursor.

### "Failed to authenticate with Xray Cloud" error

Possible causes:
1. **Invalid credentials** - Double-check your Client ID and Secret
2. **Network issues** - Ensure you can reach xray.cloud.getxray.app
3. **Expired credentials** - Regenerate your API key in Xray settings

**Solution:** Verify credentials are correct, or generate new ones.

### "Could not fetch test steps" error

Possible causes:
1. **Authentication failed** - See above
2. **Test has no steps** - The test might not have any steps defined
3. **Wrong test type** - Only Manual tests have visible steps in this format
4. **API permissions** - Your Xray license may not include API access

**Solution:** 
- Check the test in Jira UI to verify it has steps
- Ensure it's a Manual test type
- Contact your Jira admin about Xray license

### Steps still not showing

1. Check Cursor's MCP logs for error messages
2. Try running the MCP server directly to see console output:
   ```bash
   cd /Users/korfu/ownProjects/XRayMCP
   JIRA_BASE_URL="https://your-instance.atlassian.net" \
   JIRA_EMAIL="your-email" \
   JIRA_API_TOKEN="your-token" \
   XRAY_CLIENT_ID="your-client-id" \
   XRAY_CLIENT_SECRET="your-secret" \
   node dist/index.js
   ```

## Security Best Practices

- 🔒 Never commit API credentials to version control
- 🔒 Store credentials in environment variables or secure vaults
- 🔒 Rotate API keys periodically
- 🔒 Use separate API keys for different environments (dev/prod)
- 🔒 Limit API key permissions to minimum required

## API Usage

The Xray Cloud API:
- Uses OAuth2 authentication
- Tokens expire after 1 hour
- The MCP automatically refreshes tokens as needed
- Cached tokens are stored in memory only (not persisted)

## References

- [Xray Cloud API Documentation](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- [Xray Authentication](https://docs.getxray.app/display/XRAYCLOUD/Authentication+-+REST+v2)
- [Jira API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

