# app-portal

A reference client portal application built on the Insites platform. It pairs a public-facing marketing website with an authenticated portal area covering account registration, company details, billing and Stripe-based payments, feedback workflows, and Google Places address lookup.

This repository is published as a worked example of a production Insites app. It is intended as a starting point and learning resource for teams building portals, member areas, or transactional sites on Insites.

## Stack

- **Liquid** templates for pages, partials, and email notifications
- **GraphQL** queries and mutations against the Insites schema (see `modules/*/public/graphql/`)
- **Vue web components** consumed from `insites-components-v2` (the `<ins-*>` element family)
- **Stripe** for payment flows (`modules/portal/public/views/partials/stripe/`)
- **Google Places (New)** for address autocomplete in the portal forms

The codebase is organised into four Insites modules:

| Module | Purpose |
| --- | --- |
| `modules/portal` | Authenticated portal: account registration, company profile, pay bills, feedback |
| `modules/website` | Public marketing site, layout partials, news listing |
| `modules/client` | Shared client API call partials |
| `modules/ins_forms` | Form definitions and email notification templates |

## Getting started

This is a **reference implementation**. To run it you need an Insites instance with cloudshell deploy access. The repository expects to be deployed with the standard Insites tooling against an instance you control.

High-level steps:

1. Provision an Insites instance (or use an existing one).
2. Configure the `feedback_database_id` constant and any Stripe and Google Maps API keys on the instance.
3. Deploy the modules to the instance using your preferred Insites deployment workflow.

For the full Insites platform documentation, including how to set up an instance and deploy modules, see [docs.insites.io](https://docs.insites.io).

## Repository layout

```
modules/
  portal/      # authenticated portal app
  website/    # public site
  client/      # shared client-side API helpers
  ins_forms/  # form definitions + email notifications
public/        # static assets and headers
vercel.json    # static asset cache headers
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. All commits must be signed off under the Developer Certificate of Origin (DCO) using `git commit -s`.

By participating in this project you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text and [NOTICE](NOTICE) for attribution.
