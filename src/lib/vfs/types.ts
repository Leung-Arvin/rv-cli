export interface FileNode {
	kind: 'file';
	name: string;
	path: string;
	text: string;
	description?: string;
	date?: string;
}

export interface DirNode {
	kind: 'dir';
	name: string;
	path: string;
	description?: string;
	children: Map<string, VfsNode>;
}

export type VfsNode = FileNode | DirNode;

export interface VirtualFileSystem {
	root: DirNode;
}
