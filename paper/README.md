# Paper

The arXiv preprint, in LaTeX. Skeleton since 1 Nov 2026: every section names its sources in a comment, with `\todo{}` where text goes.

- `main.tex` pulls in `sections/` in order.
- `refs.bib` holds verified references only.
- `figures/` is filled by the analysis code after the study.

Build with `latexmk -pdf main.tex` or `tectonic main.tex`. Target: arXiv cs.GT, cross-listed to cs.AI and econ.TH.
