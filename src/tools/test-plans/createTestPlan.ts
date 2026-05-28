import { AxiosInstance } from 'axios';
import { Config, JiraIssue } from '../../types.js';

export const createTestPlanTool = {
  name: 'create_test_plan',
  description: 'Create a new test plan in Jira with Xray',
  inputSchema: {
    type: 'object',
    properties: {
      project_key: {
        type: 'string',
        description: 'Jira project key (e.g., PROJ)',
      },
      summary: {
        type: 'string',
        description: 'Test plan summary/title',
      },
      description: {
        type: 'string',
        description: 'Test plan description (optional)',
      },
      tests: {
        type: 'string',
        description: 'Comma-separated test keys to add to plan (optional)',
      },
    },
    required: ['project_key', 'summary'],
  },
};

export async function createTestPlan(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const projectKey = args.project_key;
    const summary = args.summary;
    const description = args.description || '';
    const tests = args.tests
      ? args.tests.split(',').map((t: string) => t.trim())
      : [];

    console.error(`Creating test plan in project: ${projectKey}`);

    // Get issue type ID for Test Plan
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

    // Xray's Jira issue type for plans is named "Test Plan" by default, but
    // some tenants customize it to "Xray Test Plan". Mirror the matching
    // strategy used by createTestExecution for consistency.
    const candidateNames = [
      process.env.XRAY_TEST_PLAN_ISSUE_TYPE_NAME,
      'Test Plan',
      'Xray Test Plan',
    ].filter((n): n is string => Boolean(n));

    const testPlanIssueType =
      issueTypes.find((type) => candidateNames.includes(type.name)) ??
      issueTypes.find((type) => /^(xray\s+)?test\s+plan$/i.test(type.name));

    if (!testPlanIssueType) {
      const available = issueTypes.map((t) => t.name).join(', ') || '(none)';
      throw new Error(
        `Test Plan issue type not found in project ${projectKey}. ` +
          `Tried: ${candidateNames.join(', ')}. ` +
          `Available issue types in this project: ${available}. ` +
          `If Xray uses a custom issue type name here, set the ` +
          `XRAY_TEST_PLAN_ISSUE_TYPE_NAME env var to that name.`
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
          id: testPlanIssueType.id,
        },
      },
    };

    // Create the test plan issue
    const response = await axiosInstance.post<JiraIssue>(
      '/rest/api/3/issue',
      issueData
    );

    const testPlanKey = response.data.key;

    // Add tests to plan if provided
    if (tests.length > 0) {
      try {
        await axiosInstance.post(
          `/rest/raven/1.0/api/testplan/${testPlanKey}/test`,
          {
            add: tests,
          }
        );
      } catch (testError) {
        console.error('Could not add tests to plan:', testError);
        // Continue anyway
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created test plan: ${testPlanKey}
          
**Summary:** ${summary}
**Project:** ${projectKey}
${tests.length > 0 ? `**Tests Added:** ${tests.join(', ')}` : ''}

View at: ${config.JIRA_BASE_URL}/browse/${testPlanKey}`,
        },
      ],
    };
  } catch (error: any) {
    console.error('Error creating test plan:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error creating test plan: ${
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

