import { AxiosInstance } from 'axios';
import { Config } from '../../types.js';

export const addTestsToTestPlanTool = {
  name: 'add_tests_to_test_plan',
  description: 'Add tests to an existing test plan',
  inputSchema: {
    type: 'object',
    properties: {
      test_plan_key: {
        type: 'string',
        description: 'Test Plan issue key (e.g., PROJ-789)',
      },
      test_keys: {
        type: 'string',
        description: 'Comma-separated test keys to add',
      },
    },
    required: ['test_plan_key', 'test_keys'],
  },
};

export async function addTestsToTestPlan(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const testPlanKey = args.test_plan_key;
    const testKeys = args.test_keys
      .split(',')
      .map((t: string) => t.trim());

    console.error(`Adding tests to test plan: ${testPlanKey}`);

    // Add tests to plan using Xray API
    await axiosInstance.post(
      `/rest/raven/1.0/api/testplan/${testPlanKey}/test`,
      {
        add: testKeys,
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added tests to test plan ${testPlanKey}

**Tests Added:** ${testKeys.join(', ')}

View at: ${config.JIRA_BASE_URL}/browse/${testPlanKey}`,
        },
      ],
    };
  } catch (error: any) {
    console.error('Error adding tests to test plan:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error adding tests to test plan: ${
            error.response?.data?.errorMessages?.[0] ||
            error.response?.data?.error ||
            error.message ||
            'Unknown error'
          }`,
        },
      ],
    };
  }
}

