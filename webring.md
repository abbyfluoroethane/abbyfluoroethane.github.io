---
title: Webring
app_name: Extras
---

# Webring

*Coming soon!*

---

## What's a Webring?

A webring is a collection of websites linked together in a circular structure. Each member site has "previous" and "next" links that let visitors travel through the ring, discovering new sites along the way. They were a staple of the early web and are making a comeback as part of the indie web revival.

## The Plan

I'm working on setting up a webring for friends and like-minded personal sites. Here's what I'm considering:

### Option A: Self-hosted JSON ring
- A `members.json` file in this repo listing all member sites
- A small JavaScript snippet that each member embeds on their site
- The snippet renders previous/next navigation links
- Fully self-contained, no external dependencies

### Option B: Manual prev/next links
- Each member manually adds links to their neighbors in the ring
- Simpler but harder to maintain as members join/leave
- Most authentic to how webrings originally worked

### Option C: webri.ng platform
- Use [webri.ng](https://webri.ng/) — an open-source webring hosting service
- Easiest to set up, handles member management
- Less control over styling and behavior

## Requirements

To join the webring, a site should:
- Be a personal website or blog
- Have some original content
- Be maintained (not abandoned)
- Include the webring navigation widget

## Interested?

If you'd like to join once this is up and running, [open an issue](https://github.com/abbyfluoroethane/abbyfluoroethane.github.io/issues) or sign the [guestbook](/guestbook)!
