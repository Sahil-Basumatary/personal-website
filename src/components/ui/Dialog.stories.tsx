import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dialog } from './Dialog';
import { Button } from './Button';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger>
        <Button>Show Error Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon variant="error" />
          <Dialog.Body>
            <Dialog.Title>Application Error</Dialog.Title>
            <Dialog.Description>
              An unexpected error occurred while processing your request. Please
              try again later or contact me if the problem persists.
            </Dialog.Description>
          </Dialog.Body>
        </Dialog.Header>
        <Dialog.Actions>
          <Dialog.Close>
            <Button variant="primary">OK</Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Warning: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger>
        <Button>Show Warning Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon variant="warning" />
          <Dialog.Body>
            <Dialog.Title>Save Changes?</Dialog.Title>
            <Dialog.Description>
              You have unsaved changes. Do you want to save them before closing?
            </Dialog.Description>
          </Dialog.Body>
        </Dialog.Header>
        <Dialog.Actions>
          <Dialog.Close>
            <Button>Don&apos;t Save</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="primary">Save</Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Info: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger>
        <Button>Show Info Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon variant="info" />
          <Dialog.Body>
            <Dialog.Title>About This Application</Dialog.Title>
            <Dialog.Description>
              Version 1.0.0 - Built with React and TypeScript. This is my
              fathers first ever mac inspired desktop portfolio showcasing
              modern web and software development skills.
            </Dialog.Description>
          </Dialog.Body>
        </Dialog.Header>
        <Dialog.Actions>
          <Dialog.Close>
            <Button variant="primary">OK</Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Dialog>
        <Dialog.Trigger>
          <Button>Error</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon variant="error" />
            <Dialog.Body>
              <Dialog.Title>Error</Dialog.Title>
              <Dialog.Description>Something went wrong.</Dialog.Description>
            </Dialog.Body>
          </Dialog.Header>
          <Dialog.Actions>
            <Dialog.Close>
              <Button variant="primary">OK</Button>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
      <Dialog>
        <Dialog.Trigger>
          <Button>Warning</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon variant="warning" />
            <Dialog.Body>
              <Dialog.Title>Warning</Dialog.Title>
              <Dialog.Description>
                Please proceed with caution.
              </Dialog.Description>
            </Dialog.Body>
          </Dialog.Header>
          <Dialog.Actions>
            <Dialog.Close>
              <Button variant="primary">OK</Button>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
      <Dialog>
        <Dialog.Trigger>
          <Button>Info</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon variant="info" />
            <Dialog.Body>
              <Dialog.Title>Information</Dialog.Title>
              <Dialog.Description>
                Here is some helpful information.
              </Dialog.Description>
            </Dialog.Body>
          </Dialog.Header>
          <Dialog.Actions>
            <Dialog.Close>
              <Button variant="primary">OK</Button>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </div>
  ),
};
