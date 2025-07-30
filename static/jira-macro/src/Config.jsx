import React, { useState, useEffect } from 'react';
import { view, Emitter } from '@forge/bridge';

import Textfield from '@atlaskit/textfield';
import Form, { Field } from '@atlaskit/form';

// A simple list of common Jira fields
const commonJiraFields = [
  { label: 'Summary', value: 'summary' },
  { label: 'Assignee', value: 'assignee' },
  { label: 'Reporter', value: 'reporter' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
  { label: 'Due Date', value: 'duedate' },
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
];

function Config() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const emitter = new Emitter();
    
    // Function to handle the form submission event from Confluence
    const onConfigSave = () => {
        // 'data' holds the current state of your form
        return data;
    };

    emitter.on('com.atlassian.confluence.macro.config.submit', onConfigSave);

    // Initial data load
    view.getContext().then(context => {
      const initialData = context.extension.macro.config || { jql: '', columns: ['summary', 'status'] };
      setData(initialData);
    });

    // Cleanup listener on component unmount
    return () => {
        emitter.off('com.atlassian.confluence.macro.config.submit', onConfigSave);
    };
  }, [data]); // Rerun effect if data changes

  if (!data) {
    return 'Loading configuration...';
  }
  
  return (
    <Form onSubmit={() => {}}>
      {({ formProps }) => (
        <form {...formProps} style={{ padding: '2em' }}>
          <Field label="JQL Query or Filter" name="jql" isRequired>
            {({ fieldProps }) => (
              <Textfield
                {...fieldProps}
                placeholder="project = 'PROJ' AND status = 'To Do'"
                value={data.jql}
                onChange={(e) => setData({ ...data, jql: e.target.value })}
              />
            )}
          </Field>
          <Field label="Columns to display (comma-separated)" name="columns">
            {({ fieldProps }) => (
               <Textfield
                {...fieldProps}
                placeholder="summary,assignee,status"
                value={data.columns.join(',')}
                onChange={(e) => setData({ ...data, columns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            )}
          </Field>
        </form>
      )}
    </Form>
  );
}

export default Config;
