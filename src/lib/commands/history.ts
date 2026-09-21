/**
 * Shell History: Up walks backwards, Down walks forwards, and stepping past the
 * newest Entry gives You back the empty Line rather than sticking.
 */
export class History {
	private entries: string[] = [];
	private cursor = 0;

	push(line: string): void {
		const trimmed = line.trim();
		if (!trimmed || this.entries.at(-1) === trimmed) {
			this.cursor = this.entries.length;
			return;
		}
		this.entries.push(trimmed);
		this.cursor = this.entries.length;
	}

	previous(): string | undefined {
		if (this.cursor === 0) return this.entries[0];
		this.cursor -= 1;
		return this.entries[this.cursor];
	}

	next(): string | undefined {
		if (this.cursor >= this.entries.length - 1) {
			this.cursor = this.entries.length;
			return '';
		}
		this.cursor += 1;
		return this.entries[this.cursor];
	}
}
