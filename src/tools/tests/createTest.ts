import { AxiosInstance } from 'axios';
import { Config, JiraIssue } from '../../types.js';

export const createTestTool = {
  name: 'create_test',
  description: 'Create a new test in Jira with Xray',
  inputSchema: {
    type: 'object',
    properties: {
      project_key: {
        type: 'string',
        description: 'Jira project key (e.g., PROJ)',
      },
      summary: {
        type: 'string',
        description: 'Test summary/title',
      },
      description: {
        type: 'string',
        description: 'Test description (optional)',
      },
      test_type: {
        type: 'string',
        description: 'Test type: Manual, Cucumber, or Generic (default: Manual)',
        enum: ['Manual', 'Cucumber', 'Generic'],
        default: 'Manual',
      },
      labels: {
        type: 'string',
        description: 'Comma-separated labels (optional)',
      },
      priority: {
        type: 'string',
        description: 'Priority name (e.g., High, Medium, Low)',
      },
    },
    required: ['project_key', 'summary'],
  },
};

export async function createTest(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const projectKey = args.project_key;
    const summary = args.summary;
    const description = args.description || '';
    const testType = args.test_type || 'Manual';
    const labels = args.labels
      ? args.labels.split(',').map((l: string) => l.trim())
      : [];
    const priority = args.priority;

    console.error(`Creating test in project: ${projectKey}`);

    // Get project info to find Test issue type ID
    const projectResponse = await axiosInstance.get(
      `/rest/api/3/project/${projectKey}`
    );
    const projectId = projectResponse.data.id;

    // Get issue type ID for Test
    const issueTypesResponse = await axiosInstance.get(
      `/rest/api/3/issue/createmeta`,
      {
        params: {
          projectKeys: projectKey,
          expand: 'projects.issuetypes.fields',
        },
      }
    );

    const project = issueTypesResponse.data.projects[0];
    const issueTypes: Array<{ id: string; name: string }> = project.issuetypes;

    // Xray's Jira issue type is named "Test" by default, but many tenants
    // customize it to "Xray Test" (and a few to other variants like
    // "Test Case"). Look for the configured name first, then well-known
    // defaults, then any case-insensitive match on /^(xray\s+)?test$/.
    const candidateNames = [
      process.env.XRAY_TEST_ISSUE_TYPE_NAME,
      'Test',
      'Xray Test',
    ].filter((n): n is string => Boolean(n));

    const testIssueType =
      issueTypes.find((type) => candidateNames.includes(type.name)) ??
      issueTypes.find((type) => /^(xray\s+)?test$/i.test(type.name));

    if (!testIssueType) {
      const available = issueTypes.map((t) => t.name).join(', ') || '(none)';
      throw new Error(
        `Xray Test issue type not found in project ${projectKey}. ` +
          `Tried: ${candidateNames.join(', ')}. ` +
          `Available issue types in this project: ${available}. ` +
          `If Xray uses a custom issue type name here, set the ` +
          `XRAY_TEST_ISSUE_TYPE_NAME env var to that name.`
      );
    }

    // Build the issue creation payload
    const issueData: any = {
      fields: {
        project: {
          key: projectKey,
        },
        summary: summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description,
                },
              ],
            },
          ],
        },
        issuetype: {
          id: testIssueType.id,
        },
      },
    };

    // Add labels if provided
    if (labels.length > 0) {
      issueData.fields.labels = labels;
    }

    // Add priority if provided
    if (priority) {
      issueData.fields.priority = { name: priority };
    }

    // Create the test issue
    const response = await axiosInstance.post<JiraIssue>(
      '/rest/api/3/issue',
      issueData
    );

    const testKey = response.data.key;

    // Set test type using Xray API if not Manual (Manual is default)
    if (testType !== 'Manual') {
      try {
        await axiosInstance.put(`/rest/raven/1.0/api/test/${testKey}`, {
          testType: testType,
        });
      } catch (typeError) {
        console.error('Could not set test type:', typeError);
        // Continue anyway, test is created
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created test: ${testKey}
          
**Summary:** ${summary}
**Type:** ${testType}
**Project:** ${projectKey}
${labels.length > 0 ? `**Labels:** ${labels.join(', ')}` : ''}
${priority ? `**Priority:** ${priority}` : ''}

View at: ${config.JIRA_BASE_URL}/browse/${testKey}`,
        },
      ],
    };
  } catch (error: any) {
    console.error('Error creating test:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error creating test: ${
            error.response?.data?.errorMessages?.[0] ||
            error.response?.data?.errors
              ? JSON.stringify(error.response.data.errors)
              : error.message ||
                'Unknown error'
          }`,
        },
      ],
    };
  }
}

