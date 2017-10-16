---
title: Predoc Course 2017
layout: default
permalink: "/predoc2017/"
---

This practical provides an introduction into variant discovery and genotyping. We will cover single-nucleotide variants, short insertions and deletions (InDels) and large structural variants. All data of this practical has been anonomyzed and subsampled to speed up the analyses.

***Rare Disease Genetics***

We will start with a [rare disease][rd] case that we analyzed in 2012. This infant of consanguineous parents suffered from severe combined immunodeficiency and the details are described in this [publication][cd].

[rd]: https://www.ncbi.nlm.nih.gov/pubmed/23999272
[cd]: https://www.ncbi.nlm.nih.gov/pubmed/23561803

***Alignment and Quality Control***

We will first map the data to the Human reference genome using [bwa][bw]. To speed up the mapping the reference genome needs to be indexed.

```bash
cd /data/rddata/
bwa index chr7.fa
```

Once the index has been built we can map the paired-end [FASTQ][fq] data against the reference and convert it to BAM

```bash
bwa mem chr7.fa read1.fq.gz read2.fq.gz | samtools view -bT chr7.fa - > rd.bam
```

[bw]: https://github.com/lh3/bwa
[fq]: https://en.wikipedia.org/wiki/FASTQ_format


