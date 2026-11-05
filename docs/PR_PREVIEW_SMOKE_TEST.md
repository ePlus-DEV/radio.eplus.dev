# GitHub Pages PR Preview Smoke Test

This documentation-only pull request validates the existing PR Preview workflow.

- The source is a same-repository branch targeting `develop`.
- The preview pipeline should build a representative noindex static site and publish it to `ePlus-DEV/onair-pr-previews`.
- This test does not change product UI, station catalog, release configuration, or production SEO.

After checking the deployed preview, close this test PR without merging. The cleanup job should remove only its temporary preview directory.
