const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(
	path.join(__dirname, "../components/vault/history.ts"),
	"utf8",
);
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const history = { exports: {} };
new Function("module", "exports", compiled)(history, history.exports);
const { snapshotsInRange, lastSnapshotPerDay, snapshotDate } = history.exports;

function snapshot(id, date) {
	return { id, createdAt: date.toISOString(), totalUah: id, totalUsd: id };
}

test("one-month range clamps month-end dates instead of rolling into March", () => {
	const now = new Date(2026, 2, 31, 12);
	const before = snapshot(1, new Date(2026, 1, 27, 12));
	const included = snapshot(2, new Date(2026, 1, 28, 12));
	assert.deepEqual(snapshotsInRange([before, included], "1m", now), [included]);
});

test("daily history keeps the final saved balance of each local day", () => {
	const first = snapshot(1, new Date(2026, 3, 1, 9));
	const latest = snapshot(2, new Date(2026, 3, 1, 17));
	const nextDay = snapshot(3, new Date(2026, 3, 2, 9));
	assert.deepEqual(lastSnapshotPerDay([first, latest, nextDay]), [
		latest,
		nextDay,
	]);
});

test("SQLite timestamps are interpreted as UTC", () => {
	assert.equal(
		snapshotDate("2026-04-01 12:00:00").toISOString(),
		"2026-04-01T12:00:00.000Z",
	);
});
