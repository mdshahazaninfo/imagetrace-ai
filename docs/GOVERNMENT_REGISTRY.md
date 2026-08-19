# Bangladesh Government Trusted Source Registry

Source: `Bangladesh Government Websites Master List - 2026-08-19.xlsx` supplied for the ImageTrace AI project.

The normalized registry contains 325 source records across ministries/divisions, directorates, major agencies, administrative divisions, districts, key e-services and official directories. It contains 314 unique domains.

## Verification behavior

1. Google Vision Web Detection returns full/partial image matches and pages with matching images.
2. ImageTrace normalizes the returned host name.
3. An exact host match against the uploaded master registry is labelled `Bangladesh Government source (master-list match)`.
4. Other `.gov.bd` hosts can be labelled as a government-domain candidate, but are **not** treated as a master-list verified source.
5. A registry miss is never treated as proof that a government source does not exist, because the source workbook itself notes that live official directories are broader and continuously maintained.

## Name-based public search

When the user supplies a public name they already know, the app searches:

- Bangladesh Government pages, then filters/ranks against the trusted registry
- Wikipedia
- public Facebook search candidates
- public Instagram search candidates
- official websites / organization profiles
- news and articles

These results are textual/public-web candidates. They are not biometric identity claims and do not prove social-account ownership.

## Database

Run `supabase/schema.sql`, then with Supabase server credentials configured:

```bash
npm run sync-government-sources
```

The static JSON registry remains a server-side fallback so government verification still works even when the database is temporarily unavailable.
