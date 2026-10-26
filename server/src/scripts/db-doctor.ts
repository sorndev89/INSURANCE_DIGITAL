import { closeDb } from '../db/index.js';
import { runDatabaseDoctor } from '../db/doctor/index.js';
import { printDoctorReport } from '../db/doctor/report.js';
import { shouldFailDoctor, type DoctorFailOn, type DoctorMode } from '../db/doctor/types.js';
import { env } from '../config/env.js';

const args = process.argv.slice(2);

const readArg = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const hasFlag = (name: string) => args.includes(name);

const requestedMode = (readArg('--mode') || '').trim().toLowerCase();
const mode = (hasFlag('--repair')
  ? 'repair'
  : requestedMode ||
    (env.dbDoctorMode === 'off' ? 'check' : env.dbDoctorMode)) as DoctorMode;

if (!['off', 'report', 'check', 'repair'].includes(mode)) {
  console.error(`[db-doctor] invalid mode: ${mode}`);
  process.exit(1);
}

const failOn = (readArg('--fail-on') ||
  env.dbDoctorFailOn ||
  'critical') as DoctorFailOn;

const dataChecks = hasFlag('--no-data')
  ? false
  : hasFlag('--deep')
    ? 'deep'
    : env.dbDoctorDataChecks;

const run = async () => {
  const report = await runDatabaseDoctor({
    mode,
    failOn,
    dataChecks,
    audit: !hasFlag('--no-audit'),
    triggeredBy: 'cli',
    appVersion: env.appVersion,
  });

  if (hasFlag('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printDoctorReport(report);
  }

  process.exitCode = shouldFailDoctor(report, failOn) ? 1 : 0;
};

run()
  .catch((error) => {
    console.error(`[db-doctor] fatal error: ${(error as Error).message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb().catch(() => undefined);
  });
