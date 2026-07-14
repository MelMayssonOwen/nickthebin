# GEO / LLM Visibility — Part A Report

Date: 14 July 2026

## Applied

- Added separate allow blocks for all requested AI search, user-retrieval and training crawlers, while retaining the canonical sitemap reference.
- Added stable `Organization` and `WebSite` entities to every document head and linked them to the product/article entities.
- Explicitly typed the playable product as both `VideoGame` and `SoftwareApplication`.
- Added `datePublished` and `dateModified` to the article schema and exposed matching dates in the article byline. No FAQ schema exists, so none was fabricated.
- Kept both public pages indexable with unrestricted snippets and retained their canonical URLs.
- Kept key game facts and the complete article in the initial server-delivered HTML. No visual, auth or payment behavior changed.

## Integrity notes

- The deployed project is a dependency-free static HTML site served by nginx, not Next.js. The requested root-layout schema was therefore placed directly in each document head.
- No verified public external brand profile is present in the repository or brand material. `sameAs` is intentionally an empty array so the schema contains no invented or dead identity links.
- Article publication and editorial modification dates remain 5 June 2026; the article body has not been substantively changed since publication.

## Verification

`npm run build` performs dependency-free checks for crawler blocks, snippet eligibility, schema structure, visible dates, sitemap entries and JavaScript syntax.
