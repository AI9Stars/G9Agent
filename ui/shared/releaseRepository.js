export const RELEASE_REPOSITORY = 'AI9Stars/G9Agent';
export const LEGACY_RELEASE_REPOSITORY = 'AI9Stars/9GClaw';

/** Older installed clients require this exact wire identity after the rename. */
export function manifestRepository(repository) {
  return repository === RELEASE_REPOSITORY ? LEGACY_RELEASE_REPOSITORY : repository;
}

/** Only this known repository rename is an alias; other repositories stay strict. */
export function releaseRepositoryMatches(actual, expected) {
  return actual === expected || expected === RELEASE_REPOSITORY && actual === LEGACY_RELEASE_REPOSITORY;
}
