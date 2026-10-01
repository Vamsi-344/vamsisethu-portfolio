---
title: "A Custom Domain Email I Already Paid For: iCloud+ + Hostinger"
description: "I thought a professional you@yourdomain.com meant buying email hosting at my registrar. Turns out my existing iCloud+ 50GB plan already included it. Here is the full setup on Hostinger DNS."
date: "Sep 20 2026"
spaces:
  - homelab
---

For the longest time I assumed that getting a proper `hello@vamsisethu.com`
address meant paying for an email plan somewhere — usually the mailbox add-on
your domain registrar upsells you at checkout. I already owned the domain, I had
a working portfolio at [vamsisethu.com](https://vamsisethu.com), and the last
missing piece felt like it needed a separate subscription.

It didn't. I was already paying for it.

## The realization

I have an **iCloud+ 50GB plan** — the cheap one, mostly there so my phone
backups and photos stop nagging me. Sitting quietly inside that plan is a feature
called **Custom Email Domain**. It lets you attach a domain you own to iCloud
Mail and receive/send mail from addresses on that domain, using the iCloud inbox
you already have.

No registrar mailbox. No second email provider. No extra monthly fee. The plan I
was already paying for covered it.

The mental model that had tripped me up:

- **What I thought I needed:** buy an email mailbox from Hostinger (my registrar),
  create `hello@vamsisethu.com` there, log into a separate webmail.
- **What actually happened:** iCloud *becomes* the mailbox. I define the address,
  point DNS at Apple, and the mail lands in my normal iCloud inbox.

## How iCloud Custom Email Domain actually works

The key thing to internalize: **there is no separate mailbox to create.** When you
add a domain and type in the address you want, iCloud creates that address and
attaches it to your existing iCloud Mail account. Incoming mail flows like this:

```
Someone emails  hello@vamsisethu.com
        │
        ▼
DNS MX record says "deliver to Apple"
        │
        ▼
Lands in my iCloud inbox  (same place my @icloud.com mail arrives)
```

You read it in the Mail app or at [icloud.com/mail](https://www.icloud.com/mail),
signed in with your normal Apple ID. No new account, no new password.

### Requirements

- An **iCloud+** subscription (any paid tier — the 50GB plan counts; the free
  5GB tier does not).
- A **domain you own** with access to its DNS records.
- Up to 5 domains, and up to 3 addresses per domain.

## The setup

### 1. Start in the Apple wizard

Go to [icloud.com/icloudplus](https://www.icloud.com/icloudplus) →
**Custom Email Domain** → **Add a domain you own**. Enter the domain
(`vamsisethu.com`) and the address you want to create (`hello@vamsisethu.com`).

Apple then hands you a set of DNS records to add. Keep that tab open — you'll
copy the exact values from it.

### 2. Clear the registrar's default mail records

My domain is on **Hostinger**. The catch here is that Hostinger auto-creates its
own MX records (pointing at `mail.hostinger.com`) and an SPF record. Those will
fight with iCloud, so in **hPanel → Domains → DNS / Nameservers** I deleted:

- the existing **MX** records pointing at Hostinger
- the existing **SPF** `TXT` record (`v=spf1 include:_spf.mail.hostinger.com ...`)

> Leftover registrar MX records are the number one reason mail "disappears" — they
> quietly keep stealing delivery even after you add Apple's records.

### 3. Add Apple's records in Hostinger's DNS Zone

Hostinger's add-record form uses **Type / Name / Points to / Priority / TTL**.
The mapping:

| Type  | Name                | Value / Points to                     | Priority |
|-------|---------------------|---------------------------------------|----------|
| TXT   | `@`                 | `apple-domain=XXXXXXXXXXXX`           | —        |
| MX    | `@`                 | `mx01.mail.icloud.com`                | 10       |
| MX    | `@`                 | `mx02.mail.icloud.com`                | 20       |
| TXT   | `@`                 | `v=spf1 include:icloud.com ~all`      | —        |
| CNAME | `sig1._domainkey`   | *(DKIM target Apple generates)*       | —        |

A few Hostinger-specific notes that saved me some head-scratching:

- Use `@` for the root domain in the **Name** field.
- For the DKIM record, enter just `sig1._domainkey` — Hostinger appends the
  domain automatically. Do **not** type the full
  `sig1._domainkey.vamsisethu.com`.
- If you have any other legitimate sender, **merge** it into a single SPF record
  (`v=spf1 include:icloud.com include:otherservice.com ~all`). Two separate
  `v=spf1` records break SPF entirely.
- Keep Hostinger's own email hosting **off** for this domain so it doesn't re-add
  its MX records later.

### 4. Verify

Back in the Apple wizard, click **Finish Setup**. If it complains the records
aren't found, that's just DNS propagation — wait 15–60 minutes and retry.

Then confirm the address itself is listed and active under the domain
(**Custom Email Domain → your domain**). Verifying the domain is *not* enough —
the address has to exist on Apple's side before it can receive anything.

## Wiring it into the portfolio

The whole point was to put a real address on the site. My portfolio is Astro,
and the contact email lives in one place — `src/consts.ts`:

```ts
export const SITE: Site = {
  NAME: "Vamsi Krishna Sethu",
  EMAIL: "hello@vamsisethu.com", // was a gmail address
  // ...
};
```

`SITE.EMAIL` feeds the homepage contact link in `src/pages/index.astro`, so a
one-line change updates both the visible text and the `mailto:` link. A quick
`pnpm build` confirmed it compiled clean.

I also set `hello@vamsisethu.com` as the **default send-from** address in iCloud
Mail, so replies to contacts go out from the domain rather than my `@icloud.com`
address.

## Gotchas worth remembering

- **It's all-or-nothing per domain.** MX can only point to one provider, so once
  you hand `vamsisethu.com` to Apple, Apple handles *all* mail for it. You can't
  split `hello@` to iCloud and `sales@` to another host on the same domain.
- **No catch-all.** Every address must be explicitly defined.
- **Migrating from an existing mailbox?** Changing MX moves *new* mail to iCloud;
  it won't import old mail sitting on the previous provider. Back that up first.
- **Verify vs. create.** A verified domain with zero addresses receives no mail.
  Creating the address is a separate step.

## The lesson

The satisfying part wasn't the DNS — it was realizing I'd nearly paid for
something I already owned. If you have any paid iCloud+ tier and a domain, you
already have professional custom-domain email. Check before you buy the
registrar's mailbox add-on.
