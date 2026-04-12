import fs from "fs";

export default async function globalTeardown() {
	for (const file of [
		"express_inertia_e2e.db",
		"express_inertia_e2e.db-shm",
		"express_inertia_e2e.db-wal",
	]) {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			console.log(`Removed ${file}`);
		}
	}
}
