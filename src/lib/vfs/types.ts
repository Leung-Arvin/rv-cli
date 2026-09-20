export interface FileNode {
	kind: 'file';
	name: string;
	path: string;
	text: string;
	description?: string;
	date?: string;
	/** Set for Images. Their Bytes live at this URL rather than in `text`. */
	url?: string;
	mediaType?: string;
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
