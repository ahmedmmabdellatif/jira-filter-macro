import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import DynamicTable from '@atlaskit/dynamic-table';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';
import '@atlaskit/css-reset';

// A simple map for status colors
const statusColorMap = {
  'To Do': 'default',
  'In Progress': 'inprogress',
  'Done': 'success',
  'Backlog': 'default',
  'Selected for Development': 'inprogress'
};

function App() {
  const [context, setContext] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContextAndIssues = async () => {
      try {
        const viewContext = await view.getContext();
        setContext(viewContext);

        const macroConfig = viewContext.extension.macro.config || {};
        const jql = macroConfig.jql || 'status = "In Progress"'; // Default JQL
        const columns = macroConfig.columns || ['summary', 'assignee', 'reporter', 'status']; // Default columns

        const result = await invoke('getJiraIssues', { jql, columns });
        setData(result);
      } catch (e) {
        console.error("Error fetching data:", e);
        setData({ issues: [], error: 'Failed to load issue data.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchContextAndIssues();
  }, []);

  if (isLoading) {
    return <Spinner size="xlarge" />;
  }

  if (data?.error) {
    return <div>Error: {data.error}</div>;
  }

  if (!data?.issues || data.issues.length === 0) {
    return <div>No issues found.</div>;
  }

  const head = {
    cells: [
      { key: 'key', content: 'Key', isSortable: true },
      ...context.extension.macro.config.columns.map(col => ({
        key: col,
        content: col.charAt(0).toUpperCase() + col.slice(1), // Capitalize
        isSortable: true
      }))
    ]
  };

  const rows = data.issues.map((issue, index) => ({
    key: `row-${index}-${issue.key}`,
    cells: [
      {
        key: 'key',
        content: <a href={`/browse/${issue.key}`} target="_blank" rel="noopener noreferrer">{issue.key}</a>
      },
      ...context.extension.macro.config.columns.map(col => {
        let cellContent = issue[col];
        if (typeof cellContent === 'object' && cellContent !== null) {
          if (col === 'status') {
            const appearance = statusColorMap[cellContent.name] || 'default';
            cellContent = <Lozenge appearance={appearance}>{cellContent.name}</Lozenge>;
          } else {
            cellContent = cellContent.displayName || cellContent.name || 'N/A';
          }
        }
        return { key: col, content: cellContent || 'Unassigned' };
      })
    ]
  }));


  return (
    <DynamicTable
      head={head}
      rows={rows}
      rowsPerPage={10}
      defaultPage={1}
      loadingSpinnerSize="large"
      isLoading={isLoading}
      isFixedSize
    />
  );
}

export default App;
