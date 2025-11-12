import { AxiosInstance } from 'axios';
import { Config, TestStatus } from '../../types.js';

export const updateTestRunTool = {
  name: 'update_test_run',
  description: 'Update the result of a test run within a test execution',
  inputSchema: {
    type: 'object',
    properties: {
      test_execution_key: {
        type: 'string',
        description: 'Test Execution issue key (e.g., PROJ-456)',
      },
      test_key: {
        type: 'string',
        description: 'Test issue key (e.g., PROJ-123)',
      },
      status: {
        type: 'string',
        description: 'Test run status',
        enum: ['PASS', 'FAIL', 'TODO', 'EXECUTING', 'ABORTED'],
      },
      comment: {
        type: 'string',
        description: 'Comment about the test run (optional)',
      },
      defects: {
        type: 'string',
        description: 'Comma-separated defect keys (optional)',
      },
    },
    required: ['test_execution_key', 'test_key', 'status'],
  },
};

export async function updateTestRun(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const testExecutionKey = args.test_execution_key;
    const testKey = args.test_key;
    const status: TestStatus = args.status;
    const comment = args.comment;
    const defects = args.defects
      ? args.defects.split(',').map((d: string) => d.trim())
      : [];

    console.error(
      `Updating test run for ${testKey} in execution ${testExecutionKey}`
    );

    // Build the update payload
    const updateData: any = {
      status: status,
    };

    if (comment) {
      updateData.comment = comment;
    }

    if (defects.length > 0) {
      updateData.defects = defects;
    }

    // Update the test run using Xray API
    await axiosInstance.put(
      `/rest/raven/1.0/api/testexec/${testExecutionKey}/test/${testKey}/status`,
      updateData
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated test run

**Test:** ${testKey}
**Test Execution:** ${testExecutionKey}
**Status:** ${status}
${comment ? `**Comment:** ${comment}` : ''}
${defects.length > 0 ? `**Defects:** ${defects.join(', ')}` : ''}

View at: ${config.JIRA_BASE_URL}/browse/${testExecutionKey}`,
        },
      ],
    };
  } catch (error: any) {
    console.error('Error updating test run:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error updating test run: ${
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

