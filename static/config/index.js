import ForgeUI, { render, Fragment, TextField, Form, MacroConfig } from '@forge/ui';

const Config = () => (
  <MacroConfig>
    <Form>
      <TextField name="jql" label="JQL Query" description="Enter a JQL query to filter issues" />
    </Form>
  </MacroConfig>
);

export const run = render(<Config />);
