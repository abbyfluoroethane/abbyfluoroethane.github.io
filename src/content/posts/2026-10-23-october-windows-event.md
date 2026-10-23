---
title: "October Windows Event: An Insider turned Mac user's take"
date: 2026-10-23
subtitle: "Yes, I was sad that Windows 11 Mobile wasn't unveiled. No, I didn't have any hope left."
---

So I got invited to a Windows media event. Why? I have no clue! I can only imagine this was a perk of reminiscing about Windows Phone with a few Microsoft employees at the San Francisco Windows Insider event back in July. Thanks for putting in the good word, friends. Tile gang till I die <3

Oh, before we get too far in the weeds — I haven’t run Windows on my own machine since early 2025. That is, until a few weeks ago. More on that later.

### One free Uber Black later…

Thanks to Microsoft, I had a $90 Uber credit to travel the few miles from my apartment to the venue. So, what do you do when you're given an effectively unlimited transportation budget and your daily driver is Muni? You get an Uber Black while wearing jeans and a t-shirt. That's what you do.

This was my second event invite as a Windows Insider and my first ever media event. It was held in a small-ish venue in the Dogpatch neighborhood of San Francisco, aptly named *Dogpatch Studios*. In retrospect, I don't know if I really understood what I had gotten myself into. At the very least I knew it wasn't going to be as low-key as the July meetup. This was a big-news-making event headlined by Satya Nadella and Jensen Huang, two of the most powerful men in the world right now.

What I didn't expect was to run into Austin Evans — who I will admit I've looked up to for most of my life — before I even got through the security line. After meandering through the venue for a few minutes and chugging an iced coffee, I found my way to my seat: Microsoft employees to my left and, coincidentally, Austin and crew directly in front of me. Soon enough, Satya, the big man himself, walked out to open up the keynote.

### Let the buzzwords begin!

Satya kicked things off with the three pillars of building "the frontier ecosystem": Trust, Intelligence, and AI in the flow of human ambition. Remember that last one. We'll come back to it.

Then Pavan took the stage to talk about "enabling apps for anyone's agent," and this is where things got genuinely nerdy. Windows is getting Execution Containers, which are basically Windows-flavored Docker *for the agentic era*, plus OS-level restrictions for agents. As far as I can tell, each agent gets something like its own Windows account, with permissions fine-grained all the way down to the individual API call. Microsoft pitched it as making Windows the "most secure platform for agents." Buzzwords aside, locking the robots in a box before handing them the keys is the right order of operations, so I'll allow it.

Then Jensen walked out, and my god, he was so close I could smell the leather moisturizer.

The local AI segment is where my skepticism started to crack. MAI Code 1.1, DeepSeek V4 Flash, and llama.cpp are all coming to Windows ML for local use. The best demo of the day had a GPT-6.1 Luna coordinator directing three MAI Code 1.1 subagents running right there on the laptop. The whole idea is to use an expensive cloud model for the actual work while shoving overhead like PR merging and issue reviews to a handful of small, quick, and basically free local agents.

And then they showed search. Windows search. *That actually works.* I shit you not, this was the thing that got the loudest applause of the entire keynote. I flat out didn't believe it, but there it was on stage: semantic search surfacing files nearly instantaneously. It's accelerated by locally running ML models — not explicitly LLMs — which immediately got the ITARpilled part of me wondering whether it can actually run fully offline. More on search later. Trust me.

Not everything landed. The Surface Laptop Ultra got an involuntary "my god, it's beautiful" out of me (RIP Surface Connect, turns out you can just make a magnetic USB-C charger). The generative image demo right after it got markedly fewer claps from the room. It was honestly really cringe. RTX Spark laptops went up for preorder that same morning, and the show wrapped with Satya and Jensen on stage together for a panel discussion on AI and the future of computing.

Listen, I’m not even *that* much of an AI hater. I burn hella tokens in Claude Code, the same model is going to proofread this before it goes live (hii claude!!), and I’m generally very optimistic about the future of the technology — especially with local models and hybrid workflows. But come on man, “AI in the flow of human ambition???” What is that even supposed to mean! Alas, the buzzwords didn’t stop me from enjoying the many demos available to play around with after the buzzslop deluge ended.

### I wanna **~~fuck~~** touch **~~my~~** your **computer**[^1]

Once the keynote wrapped, the floor opened up for demos, and the Surface Laptop Ultra was the obvious main character. It's a brick, but a gorgeous one: just under four and a half pounds of aluminum with a 15-inch mini-LED panel that gets scary bright, plus the new magnetic USB-C port where Surface Connect used to live. The real party trick is the trackpad. It's the biggest one Microsoft has ever put on a Surface, it's fully haptic, and it talks back to you as you use Windows itself. Hover over a close button, snap a window, or drag a file into a folder and you get a little bump under your finger. It’s very similar to the haptic feedback in my MX Master 4, which I do enjoy.

The gaming demos were the other surprise, because this thing runs on an ARM chip. Microsoft had *Gears of War: E-Day* running at 120 fps (with DLSS 4.5 and frame generation doing a lot of the heavy lifting, *a lot*), and Fortnite and Pragmata were running through emulation without any obvious hiccups. All that for a cool $2,600 starting price, which is about where my wallet started screaming for mercy.

Another demo of note was hosted by a few GitHub engineers. It was a real world, unscripted demo of the dynamic workflows using MAI Code 1.1. Obviously, a model small enough to fit in 128GB of RAM with room to spare for all the other processes on the machine isn’t going to be the most accurate or capable, but it’s fast and seemed good enough for simple tasks to be handed off with little supervision. After some prodding, it seems like we may soon see an open weight release of an MAI Code model, but that didn’t come from an official spokesperson.

The least popular demo booth may actually be my favorite of them all. There was no AI, no video games, no DLSS, and not even Windows! It was a booth showing off the stunning industrial design of Surface Laptop Ultra, yet another absolute banger from the Surface hardware team. Seeing that they still have the chops after all these years really makes me wish there was more Surface Duo hardware released.

### The life of an esoteric hardware hoarder

I would never dare to show up to a function like this empty handed. In my bag were my beloved Surface Duo and a Lumia 950, because if you're going to spend an afternoon in a room full of Microsoft people and pre-release hardware, you might as well bring your favorite artifacts.

The plan was to boot Windows 10X on the Surface Duo on the way to the event. I got it running by some miracle of ~~God~~ Claude, but Windows 10X had other plans the minute I walked through security. It went a little something like uhh — unlock Duo, try to connect to WiFi, then boom — BSOD on your Nintendo DS ahh phone, *go fuck yourself, nerd.*

A canceled operating system crashing at an event about the future of Windows felt about right.

The Duo still picked up the slack even while running Android. Austin and a few others noticed it while I was using it to talk to friends about the hardware demos we were checking out. It turns out a dual-screen phone Microsoft unceremoniously killed nearly half a decade ago still catches some attention in a sea of hybrid-AI-local-codegen-laptops.

A bit later on, I got to talk with James McGuire, the Windows Insider Program lead, and a few others about the Duo and the 950. For the few of you who also care too much about this stuff: fear not, I spent more time than is polite demanding a revival of Duo, Windows 10X, and Windows Phone to any Microsoft employee willing to give me the bandwidth. Maybe one day it’ll pay off, you never know.

I walked away from the event feeling an odd combination of optimism and dread. Which is a lot of feelings for a Mac user to have about Windows.

### Why I care at this point

I've been a Windows Insider since before the program existed. Much to my mother's chagrin, I installed my first beta — the Windows 8.1 Preview — on the family computer at the ripe age of nine years old. I just *couldn't wait* to get my hands on the latest version of the operating system I loved. I continued to stay on the bleeding edge the next year when the Windows 10 Technical Preview was released in October 2014. From that point on I eagerly installed the latest updates as soon as I could — first in a virtual machine, then on a spare laptop a family member was throwing out, then finally joining the Beta channel (then called "Slow Ring") full time in 2016 on both my laptop and my phone.

This trend continued until I reached a breaking point in early 2025. The problem? Windows sucked to use! After Copilot reappeared for the n-teenth time, I switched to Fedora Linux full time that March, then macOS on my laptop in December. This year I've fully transitioned to macOS, after deciding that Linux's UX jank was just too annoying for me.

I don’t want to hate using Windows. I’ve been on the bleeding edge for over half my life. Hell, I rode Windows Phone (and Zune, Surface Duo, Windows RT, list goes on) into the ground. My disdain for the current state of Windows comes from a place of love. I desperately want to see the platform I’ve spent so long championing succeed not because it’s the standard everyone begrudgingly uses, but because it’s the best goddamn option.

I want Microsoft to keep building special things. Just like they did with the then-revolutionary Zune software, or with the great battery life my Surface RT had at a time when most Windows laptops couldn’t manage four hours, or even with the unorthodox hardware we saw with Surface Duo.

### Closing thoughts

So, about that "until a few weeks ago."

The weekend after the event I did something I swore I was done doing: I installed the latest Insider Beta build on `gonggong`, my main non-Mac machine. This was no easy feat, it took a lot of peer pressure from the folks at the event and some dangerous curiosity, but the deed was done. *I needed to try that new search.*

Before anyone gets too excited: this isn't the Windows commercial off-the shelf. I built my image with UUP dump, a tool that lets you put together your own Windows install without the bundled junk, and stripped out Copilot, Xbox, the Start menu ads, and more. The list could literally go on forever. So yes, the Windows I'm using is not the Windows you are using. Keep that in mind for the rest of this.

That said, after almost two years away, I've been using it semi-regularly, and… it's fine? Good, even? Bare minimum it’s a lot more stable than it was last time I was daily driving! It's not perfect. Microsoft can pitch Windows as the best-in-the-world platform for developers, but nothing beats a real UNIX shell. That’s something Windows inherently can’t have, and WSL, as good as it is, still feels like a Linux VM bolted onto the side. It’s a big pain point for me, even though it’s nice to run my engineering software without having to compile a custom fork of WINE. But for the first time in a long time, I don't feel like I'm constantly fighting Windows.

Honestly, the thing I'm most excited about after marinating on this event for two weeks is search.

Listen(!!) search that actually worked is the thing that made eight-year-old me fall in love with macOS while I was stuck waiting for Windows 7 to dig up files buried deep in my Documents folder. Mind you, this is on a fairly fresh install with not that many files, but holy shit it works! I've used Spotlight for years, and I'll be honest: it matches up pretty damn well.

So, am I crawling back to Windows? Not yet. Ask me again when stock Windows doesn't need a deslopping to feel this good. And as for Copilot, the thing that drove me off in the first place, it isn’t as pervasive as it used to: even on my mostly stock work laptop Notepad isn’t trying to sell me tokens anymore.

I do have a fear (for my MacBook Neo, at least) that Microsoft might *finally* be turning over a new leaf with Windows. Time will tell if this stays true, but I’m patient. Don’t disappoint me guys.

[^1]: Ninajirachi - Fuck My Computer
