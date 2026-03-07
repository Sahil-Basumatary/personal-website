export interface FileNode {
  name: string;
  kind: 'file';
  content: string;
}

export interface FolderNode {
  name: string;
  kind: 'folder';
  children: Record<string, FSNode>;
}

export interface AppNode {
  name: string;
  kind: 'app';
  component: string;
}

export interface AliasNode {
  name: string;
  kind: 'alias';
  target: string;
}

export type FSNode = FileNode | FolderNode | AppNode | AliasNode;
