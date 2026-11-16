# Funding Michigan Teachers auth.md

This file is for AI agents and other automated clients acting for a person.
It says what access this site needs (none) and how to help someone donate,
get involved, or get help from us.

Funding Michigan Teachers (FMT) is a student-led 501(c)(3) nonprofit based in
Okemos, Michigan (EIN 93-4485967). Site: https://www.fundingmichiganteachers.org

## Access: no account, no registration, no credentials

- There are no user accounts on this site. Nobody signs up or logs in to
  donate, ask for help, or volunteer.
- There is no agent registration. This site has no `/agent/auth` endpoint,
  no OAuth authorization server, and no OAuth metadata under `/.well-known/`.
- There are no API keys or tokens to obtain, so there is no credential to
  send. Do not send an `Authorization` header.
- Supported registration methods: none. Everything below is public.
- The only sign-in on this site is for the FMT team's own admin tools. It is
  not for visitors or agents, and there is nothing to register for.

## Reading the site

Every public page is available as Markdown. Request it with the header
`Accept: text/markdown`:

```
curl -H "Accept: text/markdown" https://www.fundingmichiganteachers.org/about
```

Without that header you get the normal web page. Each Markdown page ends with
a list of the site's other pages.

## What an agent can and cannot do here

- You can read any public page, and give the person the right page or a
  prepared link from the sections below.
- A person has to finish each action in a browser: payment details, form
  answers and consent come from them. Do not submit our forms or start a
  payment for someone without them.
- The paths under `/api/` exist for this site's own pages and for our
  payment processor. They are not a public API, and there is nothing useful
  for an agent to call there. Requests that submit data (POST) are refused
  unless they come from the site's own pages.

## Donate

Page: https://www.fundingmichiganteachers.org/donate

The person picks an amount and where it goes, then pays with Apple Pay,
Google Pay or a card through Stripe. FMT never sees or stores the card
number. Gifts are tax-deductible to the extent allowed by law.

You can prepare the page for them with these optional query parameters:

| Parameter | Values |
| --- | --- |
| `amount` | Whole dollars, from 1 to 100000 |
| `frequency` | `once` or `monthly` |
| `designation` | `school:okemos`, `school:east-lansing` or `school:haslett` for one school's fund. Leave it out for where the need is greatest. |

Example: https://www.fundingmichiganteachers.org/donate?amount=50&frequency=monthly&designation=school:okemos

A designation is a preference FMT honors. If that fund is already fully
funded, the gift goes where it is needed most.

Other ways to give:

- Michigan 10¢ cans and bottles, with free pickup in the Greater Lansing
  area: https://www.fundingmichiganteachers.org/returnables
- FMT shirts and sweatshirts. This is a purchase, not a donation, so it is
  not tax-deductible: https://www.fundingmichiganteachers.org/shop
- Business sponsorship, from $250 a year:
  https://www.fundingmichiganteachers.org/sponsors

## Get involved

- Students: the Youth Internship Program (unpaid, about 5 hours a week,
  October to June): https://www.fundingmichiganteachers.org/internship
- Schools: bring FMT's programs to your building, at no cost to the school:
  https://www.fundingmichiganteachers.org/for-schools
- Teachers: collect returnables in your classroom:
  https://www.fundingmichiganteachers.org/for-teachers#returnables
- Businesses: sponsor staff meals, a school or a whole year:
  https://www.fundingmichiganteachers.org/sponsors
- Everyone: what we do and when, on the home page:
  https://www.fundingmichiganteachers.org/

## Get help from us

- Michigan teachers: ask for classroom supplies or project funding. There
  is no application and no cost:
  https://www.fundingmichiganteachers.org/for-teachers
- The schools we work in today, each with its own page:
  https://www.fundingmichiganteachers.org/schools
- Anything else: email hello@fundingmichiganteachers.org

## Privacy and accessibility

- What we collect and why: https://www.fundingmichiganteachers.org/privacy
- Accessibility: https://www.fundingmichiganteachers.org/accessibility
