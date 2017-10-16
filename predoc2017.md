---
title: Predoc Course 2017
layout: default
permalink: "/predoc2017/"
---

This practical provides an introduction into variant discovery and genotyping. We will cover single-nucleotide variants, short insertions and deletions (InDels) and large structural variants. All data of this practical has been anonomyzed and subsampled to speed up the analyses.

***Rare Disease Genetics***

We will start with a [rare disease](https://www.ncbi.nlm.nih.gov/pubmed/23999272) case that we analyzed in 2012. This infant of consanguineous parents suffered from severe combined immunodeficiency and the details are described in this [publication](https://www.ncbi.nlm.nih.gov/pubmed/23561803).

***Alignment and Quality Control***

We will first map the data to the Human reference genome using [bwa](https://github.com/lh3/bwa). To speed up the mapping the reference genome needs to be indexed.

```bash
cd /data/rddata/
bwa index chr7.fa
```

Once the index has been built we can map the paired-end [FASTQ](https://en.wikipedia.org/wiki/FASTQ_format) data against the reference and convert it to [BAM](http://www.htslib.org).

```bash
bwa mem chr7.fa read1.fq.gz read2.fq.gz | samtools view -bT chr7.fa - > rd.bam
```

Using [samtools](http://www.htslib.org) we can have a look at the header and the first few alignment records:

```shall
samtools view -H rd.bam
samtools view rd.bam | head
```

Please familiarize yourself with the [BAM](http://www.htslib.org) format, the required fields present in every bam alignment record are explained below:


| Col   | Field    | Description                              |
|-------|----------|------------------------------------------|
|  1    |   QNAME  |    Query template NAME                   |
|  2    |   FLAG   |    bitwise FLAG                          |
|  3    |   RNAME  |    Reference sequence NAME               |
|  4    |   POS    |    1-based leftmost mapping POSition     |
|  5    |   MAPQ   |    MAPping Quality                       |
|  6    |   CIGAR  |    CIGAR string                          |
|  7    |   RNEXT  |    Ref. name of the mate/next read       |
|  8    |   PNEXT  |    Position of the mate/next read        |
|  9    |   TLEN   |    observed Template LENgth              |
|  10   |   SEQ    |    segment SEQuence                      |
|  11   |   QUAL   |    ASCII of Phred-scaled base QUALity+33 |

The bitwise FLAG can be decoded using the [explain flag tool](https://broadinstitute.github.io/picard/explain-flags.html) from the picard distribution.






