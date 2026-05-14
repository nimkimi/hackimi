# Feature: Email Newsletter / Subscriber List

## Context

A newsletter builds a direct audience of potential clients over time. Visitors who aren't ready to hire today might be in 6 months — an email list keeps Nima top of mind. Pairs naturally with the blog: each article becomes a newsletter issue. Long-term compounding growth with no ongoing ad spend.

## Scope

**In scope:**
- Email capture form: name + email, a clear value proposition ("Monthly tips for small business owners building their web presence")
- Integrate with an email platform: Resend (already used for the contact form) + a list management layer, or a dedicated newsletter tool (Buttondown, ConvertKit, Beehiiv)
- Placement: bottom of blog articles, homepage footer, possibly a dedicated banner
- Double opt-in to stay GDPR-compliant (required for Norwegian subscribers)
- Unsubscribe link in every email

**Out of scope:**
- Automated drip sequences (add later)
- Paid newsletter tiers

## Open Questions

- Use Resend + a simple list in a database, or a dedicated newsletter tool (Buttondown is simplest; Beehiiv has the best growth features)?
- Publish frequency: monthly is realistic for a solo dev — confirm before committing
- What's the lead magnet or value prop to drive sign-ups beyond "subscribe for updates"?
