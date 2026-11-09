# Documentation media

Public README images, animations, videos, community graphics and their existing source exports. Media pointers are managed by Git LFS where configured in [.gitattributes](../.gitattributes).

Preserve this existing asset collection during general cleanup, including source formats and variants. A dedicated media change should check README links, source/derived relationships and LFS object identity before replacing or deleting files. Review new media content and metadata for private information and preserve attribution and licenses. Temporary UI review screenshots belong in ignored local output directories.

The README headers use [banner-compact.png](banner-compact.png) and [banner-compact-dark.png](banner-compact-dark.png), exported at 496 × 144 from the matching SVG files. These editable wrappers embed the original light/dark artwork unchanged and clip the obsolete name suffix. The original [banner.png](banner.png) remains preserved. Runtime icons and wordmarks have separate inputs in [the brand asset generator](../scripts/rebuild-brand-assets.mjs).
