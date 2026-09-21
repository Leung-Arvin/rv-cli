-- Corrections submitted with `feedback <Correction>`.
CREATE TABLE IF NOT EXISTS feedback (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	correction TEXT NOT NULL,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_created_at ON feedback (created_at DESC);
