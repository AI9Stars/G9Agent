import { bootAppearance } from './lib/appearanceRuntime';
import { migrateLegacyStorage } from '../shared/legacyNamespace';
try { migrateLegacyStorage(localStorage); } catch { /* Storage may be unavailable or full. */ }
bootAppearance();
