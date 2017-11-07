---
layout: default
title: Tobias Rausch
---

In-silico PCR
---

We recently set-up a method, called [Silica](https://gear.embl.de/silica) to run an [in-silico PCR](https://gear.embl.de/silica) across entire genomes. Contrary to other approaches, we specifically designed the algorithm for an efficient and sensitive primer binding search on complete genomes using the [Succinct Data Structure Library](https://github.com/simongog/sdsl-lite). Each candidate binding site is then evaluated using the [Primer3Plus](https://gear.embl.de/primer3plus) temperature evaluation method. [Silica](https://gear.embl.de/silica) outputs all amplicons and primer binding sites and should be ideally suited for checking multiplexed PCR primers. Try it out! Any feedback is very welcome!

