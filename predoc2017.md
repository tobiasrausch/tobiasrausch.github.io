---
title: Predoc Course 2017
layout: default
permalink: "/predoc2017/"
---

# Predoc Course 2017

This practical provides an introduction into variant discovery and genotyping. We will cover single-nucleotide variants, short insertions and deletions (InDels) and large structural variants. All data of this practical has been anonomyzed and subsampled to speed up the analyses.

## Rare Disease Genetics

We will start with a [rare disease](https://www.ncbi.nlm.nih.gov/pubmed/23999272) case that we analyzed in 2012. This infant of consanguineous parents suffered from severe combined immunodeficiency and the details are described in this [publication](https://www.ncbi.nlm.nih.gov/pubmed/23561803).

## Reference Indices

We will first map the data to the Human reference genome using [BWA](https://github.com/lh3/bwa). To speed up the mapping the reference genome needs to be indexed. BWA uses an FM-Index which is built around the [Burrows-Wheeler transform](https://de.wikipedia.org/wiki/Burrows-Wheeler-Transformation).

```bash
cd /data/rddata/
bwa index chr7.fa
ls -rt1 chr7.fa*
```

It is also useful to build an index of the FASTA reference file using [SAMtools](http://www.htslib.org) to allow a quick extraction of subsequences from the reference genome.

```bash
samtools faidx chr7.fa
```

We can now, for instance, extract 50bp from position 10017.

```bash
samtools faidx chr7.fa chr7:10017-10067
```

***Exercises***

* What is the length of chr7?
* What is the GC-content of chr7? (hint: bedtools nuc)
* What is the proportion of Ns in chr7?

## Alignment

Once the index has been built we can map the paired-end [FASTQ](https://en.wikipedia.org/wiki/FASTQ_format) data against the reference and convert it to [BAM](http://www.htslib.org).

```bash
bwa mem chr7.fa read1.fq.gz read2.fq.gz | samtools view -bT chr7.fa - > rd.bam
```

Using [samtools](http://www.htslib.org) we can have a look at the header and the first few alignment records:

```bash
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

We need to sort the alignments and can then also built an index to allow a random extraction of alignments.

```bash
samtools sort -o rd.srt.bam rd.bam
samtools index rd.srt.bam
```

## Mark Duplicates and Alignment Quality Control

Unless you are using a PCR-free library, PCR duplicates are common in DNA-sequencing and should be flagged prior to variant calling.

```bash
bammarkduplicates I=rd.srt.bam O=rd.rmdup.bam M=rd.metrics.tsv index=1 rmdup=0
```

SAMtools flagstat computes some basic alignment statistics such as the number of properly paired reads and singletons.

```bash
samtools flagstat rd.rmdup.bam
```

[Alfred](https://github.com/tobiasrausch/alfred) can be used to compute the insert size distribution, the coverage distribution and alignment error rates.

```bash
alfred qc -r chr7.fa -o stats rd.rmdup.bam
cat stats.metrics.tsv | datamash transpose | column -t
```

All distribution files are simple tab-delimited text files that can be easily visualized in [R](https://www.r-project.org/).


```R
library(ggplot2)
cov=read.table("stats.coverage.tsv", header=T)
p=ggplot(data=cov, aes(x=Coverage, y=Count))
p=p + geom_line()
p=p + coord_cartesian(xlim=c(0,50))
p
isize=read.table("stats.isize.tsv", header=T)
q=ggplot(data=isize, aes(x=InsertSize, y=Count))
q=q + geom_line(aes(group=Layout, color=Layout))
q=q + coord_cartesian(xlim=c(0,600))
q
quit()
```

***Exercises***

* What is the median coverage of the data set?
* What is the meaning of the different library layouts (F+, F-, R+, R-)?
* What is the duplicate fraction in the library?
* Would it make sense to sequence this library deeper to achieve 30x coverage?


## Variant Calling

Once the alignment is sorted and duplicates are marked we can run a variant caller such as [FreeBayes](https://github.com/ekg/freebayes) to scan the alignments for differences compared to the reference.

```bash
freebayes --fasta-reference chr7.fa -b rd.rmdup.bam -v snv.vcf
```

Compressing and indexing of the output VCF file will again speed up random access to the file.

```bash
bgzip snv.vcf
tabix snv.vcf.gz
```

The [VCF](https://samtools.github.io/hts-specs) format has multiple header lines starting with the hash # sign. Below the header lines is one record for each variant. The record format is described in the below table:

| Col | Field  | Description         |
|-----|--------|---------------------|
| 1   | CHROM  | Chromosome name |
| 2   | POS    | 1-based position. For an indel, this is the position preceding the indel. |
| 3   | ID     | Variant identifier. Usually the dbSNP rsID. |
| 4   | REF    | Reference sequence at POS involved in the variant. For a SNP, it is a single base. |
| 5   | ALT    | Comma delimited list of alternative sequence(s). |
| 6   | QUAL   | Phred-scaled probability of all samples being homozygous reference. |
| 7   | FILTER | Semicolon delimited list of filters that the variant fails to pass. |
| 8   | INFO   | Semicolon delimited list of variant information. |
| 9   | FORMAT | Colon delimited list of the format of individual genotypes in the following fields. |
| 10+ | Samples| Individual genotype information defined by FORMAT. |

You can look at the header of the VCF file using grep, '-A 1' includes the first variant record in the file:

```shell
bcftools view snv.vcf.gz | grep "^#" -A 1
```

Using [BCFtools](https://samtools.github.io/bcftools/bcftools.html) we can generate some useful summary statistics such as the [transition/transversion ratio](https://en.wikipedia.org/wiki/Transversion).

```shell
bcftools stats snv.vcf.gz | grep "TSTV"
```

***Exercises***

* How many SNPs have been called (hint: bcftools stats, SN tag)?
* How many InDels have been called (hint: bcftools stats, SN tag)?
* How many C>T mutations have been called (hint: bcftools stats, ST tag)?


## Filtering Variants

In most applications researchers use external ground truth data to calibrate a variant calling pipeline. In our case we do not know the ground truth so we will illustrate some filtering options based on summary statistics such as the transition/transversion ratio. In most species, transitions are far more likely than transversions and for humans we would expect a transition/transversion ratio of approximately 2.

```shell
bcftools stats snv.vcf.gz | grep "TSTV"
bcftools filter -i '%QUAL>20' snv.vcf.gz  | bcftools stats | grep "TSTV"
bcftools filter -e '%QUAL<=20 || %QUAL/AO<=2 || SAF<=2 || SAR<=2' snv.vcf.gz  | bcftools stats | grep "TSTV"
```

Another useful bulk metric is the length of indels in exons because most InDel polymorphisms should be in-frame. In order to check this we first need to get exon coordinates.

```R
library(GenomicFeatures)
db=makeTxDbFromUCSC(genome="hg19", tablename="ccdsGene")
ex=keepStandardChromosomes(reduce(exons(db), ignore.strand=T))
df=data.frame(chr=seqnames(ex), start=start(ex), end=end(ex))
write.table(df, "exons.bed", quote=F, row.names=F, sep="\t")
```

The exon file needs to be compressed and indexed to calculate in-frame and out-frame InDel statistics.

```shell
bgzip exons.bed
tabix -S 1 -s1 -b2 -e3 exons.bed.gz
bcftools stats -E exons.bed.gz snv.vcf.gz | grep "FS"
```

As you can see, we have only one in-frame exonic InDel because our data is downsampled. This metric is most useful for a large population VCF file with hundreds of samples. Similarly, [heterozygosity](https://en.wikipedia.org/wiki/Zygosity) is a useful metric for such population cohorts, which tends to be higher in Africans compared to Europeans or East Asians. In our case we move on with our simple threshold based filtering and subset the VCF to exonic variants.

```shell
bcftools filter -O z -o exon.vcf.gz -R <(zcat exons.bed.gz | tail -n +2) -e '%QUAL<=20 || %QUAL/AO<=2 || SAF<=2 || SAR<=2' snv.vcf.gz
bcftools stats exon.vcf.gz | egrep "SN|TSTV"
```

***Exercises***

* Plot the InDel length distribution of all called InDels (hint: bcftools stats, IDD tag).

## Variant Annotation

Variant annotation and classification is a challenging process. You can

* use transcript annotations from Ensembl, UCSC or RefSeq
* there is a long list of mutation prediction tools such as PolyPhen, MutationTaster or Sift
* you can annotate variants with allele frequency information from variation archives such as dbSNP, ExAC or gnomAD
* you can check the expression of genes in your studied tissue using GTEx.

In the recent years a number of convenient pipelines have been developed that ease the annotation of variants with some of the above information. In this practical we will use [VEP](http://www.ensembl.org/info/docs/tools/vep/index.html) because it can be run directly online. We first dump all SNPs in a VEP compliant format which you can
then copy and paste into the VEP application. Make sure you use the hg19/GRCh37 version available [here](http://grch37.ensembl.org/Homo_sapiens/Tools/VEP).

```shell
bcftools query -f "%CHROM\t%POS\t%ID\t%REF\t%ALT\n" exon.vcf.gz
```

A working variant annotation and classification pipeline can easily reduce an initial call set of several thousands of exonic variants to a handful mutation candidates. In a rare disease setting additional power can be gained by taking advantage of the suspected inheritance model (autosomal recessive, autosomal dominant, etc.). 

```shell
bcftools query -f "%CHROM\t%POS\t%ID\t%REF\t%ALT\t[%GT]\n" exon.vcf.gz
```

***Excerises***

* What would be a useful additional filter in our case given that the index patient has consanguineous parents?
* How could we use variation archives to further filter the list of exonic variants?
* Which annotation features could be used to rank the mutation list for a clinician?


## Variant Validation

Once a putative causative variant has been identified these are usually validated in the index patient using PCR and Sanger sequencing. If a specific inheritance model is suspected the parents are also tested. For the likely causative variant we will design primers using [Primer3Plus](https://www.ncbi.nlm.nih.gov/pubmed/17485472) available on [gear.embl.de](https://gear.embl.de). We will first select a left primer in the preceeding sequence of the mutation and then a right primer in the suceeding sequence.

```shell
samtools faidx chr7.fa chr7:2954300-2954850
samtools faidx chr7.fa chr7:2954900-2955450
```

The primers are locally unique and have the appropriate Tm but they are not necessarily unique in the entire genome. We can use [In-silico PCR](https://genome.ucsc.edu/cgi-bin/hgPcr) to check genome-wide uniqueness. Try different combinations of left and right primers and possibly change parameters in Primer3Plus to generate further candidates until you found a good pair of primers to validate the mutation.

We do not have the time to run the PCR experiment and sequence the breakpoint mutation but the Sanger validations of the original study are shown in sanger.png.

***Excerises***

* Why should we not put the primers directly next to the mutation?
* Why did we not select primers more than 1000bp away from the mutation?
