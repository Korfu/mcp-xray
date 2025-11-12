import { AxiosInstance } from 'axios';
import { Config, JiraIssue, XrayTestStep } from '../../types.js';
import { XrayCloudService } from '../../services/XrayCloudService.js';

export const getTestTool = {
  name: 'get_test',
  description: 'Get detailed information about a specific test by its key',
  inputSchema: {
    type: 'object',
    properties: {
      test_key: {
        type: 'string',
        description: 'Test issue key (e.g., PROJ-123)',
      },
    },
    required: ['test_key'],
  },
};

export async function getTest(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const testKey = args.test_key;

    console.error(`Fetching test details for: ${testKey}`);

    // Get the test issue
    const response = await axiosInstance.get<JiraIssue>(
      `/rest/api/3/issue/${testKey}`,
      {
        params: {
          fields: 'summary,description,status,priority,labels,components,created,updated,assignee,reporter,issuetype,customfield_*',
        },
      }
    );

    const test = response.data;
    const fields = test.fields;

    // Try to get test steps from Xray Cloud API
    let testSteps: XrayTestStep[] = [];
    let xrayTestData: any = null;
    
    try {
      const xrayService = XrayCloudService.getInstance(config);
      
      if (xrayService.isConfigured()) {
        console.error('Fetching test steps from Xray Cloud API...');
        xrayTestData = await xrayService.getTest(testKey);
        
        // Extract steps from Xray Cloud response
        if (xrayTestData && xrayTestData.steps) {
          testSteps = xrayTestData.steps.map((step: any, index: number) => ({
            id: step.id,
            index: index + 1,
            step: step.action || '',
            data: step.data || '',
            result: step.expectedResult || step.result || '',
          }));
        }
      } else {
        console.error('Xray Cloud API not configured. Test steps will not be fetched.');
        console.error('To enable test steps, set XRAY_CLIENT_ID and XRAY_CLIENT_SECRET environment variables.');
      }
    } catch (stepError: any) {
      console.error('Could not fetch test steps from Xray Cloud:', stepError.message);
      // Continue without steps
    }

    // Build test details output
    let testDetails = `**Test: ${test.key}**

**Summary:** ${fields.summary}

**Description:**
${fields.description?.content?.[0]?.content?.[0]?.text || fields.description || 'No description'}

**Details:**
- Status: ${fields.status.name}
- Priority: ${fields.priority?.name || 'Not set'}
- Assignee: ${fields.assignee?.displayName || 'Unassigned'}
- Reporter: ${fields.reporter?.displayName || 'Unknown'}
- Labels: ${fields.labels?.join(', ') || 'None'}
- Components: ${fields.components?.map((c) => c.name).join(', ') || 'None'}
- Created: ${new Date(fields.created).toLocaleString()}
- Updated: ${new Date(fields.updated).toLocaleString()}`;

    // Add test steps if available
    if (testSteps.length > 0) {
      testDetails += '\n\n**Test Steps:**\n';
      testSteps.forEach((step, index) => {
        testDetails += `
${index + 1}. **Action:** ${step.step}
   **Data:** ${step.data || 'N/A'}
   **Expected Result:** ${step.result || 'N/A'}`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: testDetails,
        },
      ],
    };
  } catch (error: any) {
    console.error('Error fetching test details:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching test details: ${
            error.response?.data?.errorMessages?.[0] ||
            error.message ||
            'Unknown error'
          }`,
        },
      ],
    };
  }
}

