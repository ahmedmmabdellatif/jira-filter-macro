import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getJiraIssues', async (req) => {
  const { jql, columns } = req.payload;

  if (!jql) {
    return { issues: [], total: 0, error: 'JQL query is required.' };
  }

  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${columns.join(',')}`);

    const data = await response.json();

    if (!response.ok) {
      console.error('Jira API Error:', JSON.stringify(data, null, 2));
      const errorMessage = data.errorMessages ? data.errorMessages.join(' ') : `HTTP ${response.status}`;
      return { issues: [], total: 0, error: `Failed to fetch from Jira: ${errorMessage}` };
    }

    const issues = data.issues.map(issue => {
      let mappedIssue = { key: issue.key };
      columns.forEach(col => {
        mappedIssue[col] = issue.fields[col];
      });
      return mappedIssue;
    });

    return {
      issues: issues,
      total: data.total,
      error: null
    };

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { issues: [], total: 0, error: 'An unexpected error occurred while fetching issues.' };
  }
});

export const run = resolver.getDefinitions();
