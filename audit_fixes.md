# npm audit report

esbuild  <=0.24.2
Severity: moderate
esbuild enables unknown website to send unknown requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
No fix available
node_modules/esbuild
  vite  0.11.0 - 6.1.6
  Depends on vulnerable versions of esbuild
  node_modules/vite
    lovable-tagger  *
    Depends on vulnerable versions of vite
    node_modules/lovable-tagger

3 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.
