---
layout: post
title: Contemplations of a future true believer
date: 2026-03-22
summary: The launch industry is restructuring itself around a bet I can't evaluate from where I'm standing. I can only build the hardware I'm told to build, hope the demand is real, and figure out what comes next.
---

## *But there are no winners in the game*[^1]

### I. The Dream

I've had an interest in spaceflight for as long as I remember. I grew up during the wind down of the Space Shuttle program, gained consciousness as the initial "new space" cohort was gaining ground, and came of age as it was in full swing. About a decade ago things were truly looking up: I had just watched both SpaceX and Blue Origin successfully land a booster from space, New Glenn and the [Interplanetary Transport System](https://en.wikipedia.org/wiki/ITS_launch_vehicle)[^2] had just been announced, and I decided *this is it, I want to spend my life building these magnificent machines.*

Fast forward eight years and [I got my shot](https://tech.lgbt/@abbyfluoroethane/113240494137689875).

{% include fedi-post.html url="https://tech.lgbt/@abbyfluoroethane/113240494137689875" %}

### II. Three Weeks In...

Talk about getting oneshotted by a hypersonic MIRV to the skull. Less than a month on the job it felt like all of my optimism faded to nothing. I had barely dipped my toes in the water, why was I jaded?

Let's call it mismanagement of expectations. I came into Blue Origin with the ripe naïve optimism of my childhood. Fuck yeah, rockets! We're building the future at breakneck pace *for the benefit of Earth!!!* 

Wow, shut the fuck up idiot. No you aren't, you actually just entered into the single most bureaucratic mess in the aerospace industry. You're gonna build the same thing three times due to design changes, watch your friends get laid off and hired back for no reason, wait three weeks for parts for something needed a month ago, and watch your competitor run circles around you in your own backyard **and you will like it.**

Perhaps the thing that hit hardest was how little the people building alongside me seemed to just not care. To them this isn't necessarily a dream come true, it's just a paycheck. You would be shocked how many people I've had to inform that Project Kuiper[^3] is, in fact, an Amazon thing, not Blue Origin. They're not wrong for this—it *is* just a job—but as an enthusiast that knows the ins and outs of damn near every semi-major player in the industry it was definitely a culture shock that stung a little. I found myself wondering if someone like myself—whose enthusiasm, not experience got them the job—had a place in this role.

<div class="img-center-sm">
  <img src="https://www.blueorigin.com/_next/image?url=https%3A%2F%2Fd1o72l87sylvqg.cloudfront.net%2Fredstone%2Fgallery-blue-origin-new-glenn-ng-1-liftoff-horizontal.jpg&w=3840&q=75" alt="New Glenn NG-1 liftoff">
</div>

It's a weird feeling getting your dream job and feeling nothing but emptiness. I regained most of the excitement after the first launch of New Glenn—which, thank god, actually hit me the way I needed it to—but the disillusionment lingered. We weren't doing this for the benefit of anyone but a small group of billionaires and the Space Force, the good things—science, exploration, and discovery—were just a secondary side effect. It was hard not to let burnout seep in given where the launch industry started pivoting midway through 2025.

### III. Launch Services for the Agentic Era, I Guess...

*Trust me, that hurt me to write as much as it hurt you to read.*

As outlined in [this article](https://lavieohana.medium.com/starship-iv-the-future-cc07c4b66544) by friend Lavie Ohana, the launch industry is rapidly restructuring itself around a single demand signal that might not be real in five years. Blue Origin recently filed paperwork with the FCC for up to 51,600 orbital datacenter satellites under the name "Project Sunrise."[^4] SpaceX filed for a million satellites in January.[^5]

These aren't speculative startups—these are two industry stalwarts betting the next decade of their launch manifest, not to mention their entire futures, on AI compute demand holding. New Glenn exists in part because of Project Sunrise and Terawave. Starship's business case entirely depends on deploying Starlink—and now orbital datacenters—at scale.

<div class="img-float-right">
    <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Sputnik_asm.jpg" alt="Sputnik">
</div>

Lavie argues this could be the thing that ushers in the next revolution—not evolution—in the launch industry, an event on the same scale as the first flight of R7 and launch of *Sputnik*. According to napkin math **space based datacenters already pencil out** when using the rough economics of current launch vehicles and Starlink as a stand-in. In fact—if going off just power generation—Starlink already sits at ~0.2% of datacenter power demand, a truly staggering figure. If successful this serves as effectively an infinite money glitch that enables a true space-industrial complex. This could be our bridge to the rest of the solar system, a gateway to worlds we could only dream of exploring in the next 10 generations.

But what happens if the money dries up three years into a 10 year buildout? What exactly does this half-built bridge look like, and what exactly happens to these companies now saddled with the debt needed to make the sorts of capital expenditure needed for space based datacenters? We've seen this before: Iridium survived the dot-com bust, but Motorola and the people who built it didn't.

I can pretty much guarantee you I'll no longer have a job. Nor will my coworkers. Nor will the hundreds of thousands of people—maybe millions in total human capital—needed to even lay the groundwork. A mid-buildout bubble pop will decimate the global launch industry, and it feels like I'm watching it hitch its future to a bet I can't evaluate from where I'm standing. I can only build the hardware I'm told to build and hope the demand is real.

### IV. A Look In the Mirror

I use AI[^6] tools constantly. I wake up to a summary of my unread emails in Obsidian, I use Claude Code to build software, and I regularly use Claude for copyediting and sussing out various ideas I get before sinking too much time into them. I am far and away *not* anti-AI, I am *not* a luddite, and I personally consider myself to be somewhat on the accelerationist side of the argument. 

If the argument for space datacenters is "it's cheaper than building on earth," the correct response isn't *"Hell yeah let's go to space."* The correct response is *"Why the fuck is it cheaper than building on earth?"* That's not a technology problem, it's a policy failure.

A 100MW AI datacenter costs $3.5-5.5 billion to stand up and nearly a billion a year to run. That's real money but it's not insurmountable money—hyperscalers spend this routinely. The issue isn't the sticker price, it's what's *inside* that price.

Roughly half the construction cost is electrical infrastructure. Not the servers, not the building, but getting power to the building. Not to mention grid interconnection timelines in constrained markets can run between two and four years before you flip a single switch. That delay alone—the time-value-of-money on a billion-dollar facility sitting idle—might be the single biggest hidden cost in the whole equation. 

The bottleneck isn't generation—it's transmission, grid interconnection, permitting, and regulatory frameworks designed for an era that built one power plant a decade. *That's* where space starts to pencil out. Not because orbit is cheap, but because the ground is artificially expensive.

That said, power generation is the largest non-hardware operational cost for datacenters. As Technology Connections recently laid out on YouTube, solar is already the cheapest electricity generation source in history. Global investment in solar in 2024 exceeded investment in all other electricity generation technologies combined. We could easily capitalize on this to make terrestrial compute even cheaper, yet we choose to continue burning dinosaurs instead of building.

<div class="img-float-left">
    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Sequoyah_Nuclear_Generating_Station.jpg" alt="Tennessee Valley Authority Sequoyah Generating Station">
</div>

The Tennessee Valley Authority was created in 1933 as a federally-owned corporation to provide electricity, flood control, and economic development to the Tennessee Valley. It's now the sixth-largest power supplier and largest public utility in the country, and it receives no taxpayer funding—it operates on its own revenue. 

The government identified a region with broken infrastructure, created an entity with the authority to cut through the bullshit, and built the grid. Electric rates in the Tennessee Valley are among the lowest in the nation nearly a century later. We literally have a proof of concept for the government building energy infrastructure at scale when it decides to. This isn't a fantasy, we've done it before. The question is whether we have the political will to do it again.

California HSR makes me question if we *do* have the political will. Voters approved a $9.95 billion bond in 2008 with a projected total cost of $33 billion. Seventeen years later, the total has ballooned to $126.2 billion—$18 billion spent and no track laid as of 2026. This isn't because trains are hard—the world builds high-speed rail routinely—but because the regulatory and institutional apparatus made it nearly impossible. 

**This is explicitly not an anti-regulation argument.** Environmental review exists for good reasons, but when the process turns a $33 billion train into a $126 billion train that might run out of money before laying track, the implementation is broken. The goal of regulation is protection, it currently results in paralysis.

If we fixed energy policy and permitting—if we could build on earth the way the TVA proved we can—space-based datacenters wouldn't pencil out. The entire forcing function that could revolutionize launch and compute in one go only exists because terrestrial infrastructure is broken. The dream of a space-industrial complex is being underwritten by dysfunction. 

As it stands my job security depends on the continued brokenness of Earth-side infrastructure. The better we get at building things on the ground, the less reason there is to build them in space. Under no circumstances should it be cheaper to launch infrastructure into orbit than to build it on the ground. And yet here we are.

### V. Burning the House Down Instead of Remodeling

Ground-based datacenter hardware has a robust afterlife. Hyperscalars can resell GPUs and recover over half of the original purchase price. Microsoft achieved a 90.9% reuse and recycling rate of servers and components in fiscal year 2024. Google has resold over 44 million hardware components from its data centers since 2015. Older compute gets cascaded down—training GPUs become inference GPUs, then get donated to universities for research, then get sold to hobbyists or harvested for components. Refurbishing equipment uses a fraction of the energy than producing a new device. 

When a terrestrial datacenter decommissions hardware, that silicon, gold, aluminum, steel, and lithium goes somewhere useful. When an orbital datacenter decommissions hardware, it burns up on reentry. Every material that could have been reclaimed instead becomes atmospheric pollution. *There is no secondhand market in orbit.* Orbital datacenters effectively burn the house down instead of remodeling.

Reentering satellites generated an estimated 17 metric tons of aluminum oxide in 2022 alone. with planned megaconstellations, that rises to over 360 metric tons per year— compounds that catalyze ozone depletion. These particles could take up to 30 years to drift down to the stratosphere, meaning the damage we seed now won't fully manifest for decades. We spent forty years repairing the ozone layer after CFCs. **We're now proposing to deposit hundreds of metric tons of ozone-depleting compounds annually as a *feature* of the business model.**

The entire pitch for orbital datacenters is "free solar power, no land costs." But orbital night still exists for most orbital regimes, thermal management in vacuum is genuinely harder than on the ground, and every component needs to be rad-hardened. The efficiency gains on the power side get eaten by the complexity costs on every other side.

This is an engineering solution to a policy problem, and it's a worse engineering solution than the terrestrial alternative if you fix the policy.

### VI. And Yet, Here We Are

None of this is an exit speech. After everything—the disillusionment, the burnout, watching an entire industry bet its future on a demand signal that might evaporate in six months—I still want to build rockets. I just can't keep doing it like this.

I'm being drawn somewhere smaller, faster, and full of people who actually give a shit about what they're building. I don't plan on leaving the industry, but I'm done with _this version_ of it. The same thing that got me into aerospace—enthusiasm, not experience—is the same thing pushing me to find a place where it actually matters. I'm not running from rockets, I'm running toward a version of the work that doesn't feel like building someone else's monument.

<div class="img-center-sm">
  <img src="{{site.baseurl}}/assets/images/sfo-landing.png" alt="Plane landing">
</div>

I don't know if it gets better, nor can I promise myself a happy ending. The industry might collapse under its own hype, my next job might be worse, the bubble might pop before I get settled, but the alternative is staying in a role where you've already felt the emptiness. Existing in an organization whose mission I've already seen through, building toward a future I'm not sure I believe in.

I'm not a true believer. Not yet, at least. Maybe not in the same way I was at age 11 watching two boosters land for the first time, but I haven't ruled it out. My belief isn't dead, it just needs different soil. I'm taking a leap to find out if that soil exists.

I have a lot of growth and change on the horizon. I don't have all the answers to the problems laid out here—*I don't think anyone truly does*—but I do know that if we don't solve the existential problems we're facing today *there are no winners in the game.*

---
### Footnotes

[^1]: [Magdalena Bay - You Lose! on Apple Music](https://music.apple.com/us/album/you-lose/1570541671?i=1570541929)

[^2]: Oh holy hell what a mess of an article. Searching "SpaceX ITS" redirects to [SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship), which leads you to [SpaceX Starship design history](https://en.wikipedia.org/wiki/SpaceX_Starship_design_history), which FINALLY leads to the horribly named [ITS launch vehicle](https://en.wikipedia.org/wiki/SpaceX_Starship_design_history) article.

[^3]: Yes, I know Kuiper is now Amazon Leo. Nobody calls it that.

[^4]: [https://fccprod.servicenowservices.com/icfs?id=ibfs_application_summary&number=SAT-LOA-20260310-00118](https://fccprod.servicenowservices.com/icfs?id=ibfs_application_summary&number=SAT-LOA-20260310-00118)

[^5]: [https://fccprod.servicenowservices.com/icfs?id=ibfs_application_summary&number=SAT-LOA-20260108-00016](https://fccprod.servicenowservices.com/icfs?id=ibfs_application_summary&number=SAT-LOA-20260108-00016)

[^6]: God I hate the term AI. This shit *is* useful, but it *isn't* intelligent. Feels like the misnomer of the century. I digress.
