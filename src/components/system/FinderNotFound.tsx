import Link from 'next/link';
import { SystemAlertDialog } from './SystemAlertDialog';

export function FinderNotFound() {
  return (
    <SystemAlertDialog
      titleBar="Finder"
      title="The requested item could not be found."
      description="The address you typed, or the link you followed, does not lead to an item on this disk. Return to the desktop and try again."
      iconVariant="warning"
      titleId="finder-not-found-title"
      descriptionId="finder-not-found-description"
      actions={
        <Link href="/" className="btn primary">
          Go to Desktop
        </Link>
      }
    />
  );
}
