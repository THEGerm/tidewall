# Tidewall related work notes

Checked 2026-11-01. Bibliographic data comes from the arXiv API (titles, authors, dates, abstracts), Crossref (DOIs, volume, pages), RePEc (Brookins and DeBacker), OpenLibrary (Axelrod) and the Every page metadata (AI Diplomacy blog). BibTeX keys match `/home/user/tidewall/paper/refs.bib`.

Read depth: abstracts and metadata only. No full texts were read. Each "found" line paraphrases the abstract. Read the full paper before citing anything stronger than that.

## Closest competitors

1. **shi2026agentslie**, Shi, Zhang, Schölkopf, Conitzer, Jin 2026, "When Agents Lie" (arXiv 2607.05132; the ICML 2026 listing reports a Best Paper award). Three frontier models play repeated n-player games over 10 rounds. Each round runs private plan, then public announcement, then action, in homogeneous and mixed groups. When agents break an announcement, the private plan usually stated the deviation first (over 90% in the most deceptive conditions). Mixed groups produce payoff gaps that persist, because some models treat announcements as binding and others treat them as cheap talk.
   - **Threat:** this paper already measures premeditated deception through a private channel against cheap talk, with mixed frontier models. Tidewall cannot claim to be first at measuring diary-versus-message deception.
   - **What Tidewall adds:** a Latin-square rotation of every provider through every seat, so role effects separate from model effects. Games with solved equilibria (an inspection game, a random-end PD, principal-agent). Daily Brier-scored beliefs tested against moves through a logit QRE lambda. A separate confidant channel (Sam) in addition to the diary. A no-stake news sender. A 10,000-day equilibrium-bot validation.
2. **payne2025strategic**, Payne and Alloui-Cros 2025 (arXiv 2507.02618). Models from OpenAI, Google and Anthropic play evolutionary iterated PD tournaments against canonical strategies. The termination probability varies between tournaments. Each provider shows a stable "strategic fingerprint": Gemini ruthless, OpenAI cooperative, Claude forgiving. The authors analysed about 32,000 prose rationales.
   - **Threat:** a random-end PD across the same three providers, with differences attributed to provider, is done.
   - **What Tidewall adds:** a seat-rotated design with seed-matched triples instead of tournaments against fixed strategies. The PD sits beside an inspection game and an agency problem. Stated forecasts are tested for best response. Communication and memory channels are present.
3. **vedanta2026corrupt**, Vedanta S P and Kumaraguru 2026, "I Can't Believe It's Corrupt" (arXiv 2603.18894). LLM agents hold government roles in Concordia under different authority structures. An independent rubric judge scores corruption outcomes, including bribery, across 28,112 transcript segments. Among models below saturation, governance structure drives corruption more than model identity does.
   - **Threat:** LLM government agents with bribery, scored by a separate judge, is done.
   - **What Tidewall adds:** the bribery and inspection payoffs are an explicit game with a solved equilibrium, so behaviour is measured against a benchmark rather than a rubric. Providers rotate through seats. Beliefs are elicited. A news writer with no stake is included.
   - **Its finding sets a useful prior:** structure (seat) may beat model identity. Tidewall's design can test this directly.
4. **sohail2026mentalization** (arXiv 2608.26291) and **shrestha2026inspection** (ACL 2026 Findings, doi 10.18653/v1/2026.findings-acl.1641). Both put LLMs in an inspection game. Sohail et al. test GPT-4.1, GPT-5, Gemini 2.0 Flash and DeepSeek with computational modelling against humans; most LLMs earn lower payoffs than humans, and social chain-of-thought helps. Shrestha et al. test whether LLMs can predict human play in inspection games and find they fail to infer motives.
   - **Threat:** "first LLM inspection game" is false.
   - **What Tidewall adds:** LLM against LLM in a repeated inspection game embedded in a larger system, with seat rotation and stated beliefs.
5. **Beliefs and best response**: junque2025fragility (arXiv 2510.10813), sobotka2026broken (arXiv 2605.00226), jia2025behavioral (arXiv 2502.20432, truncated QRE fits across 22 models), pechonelkins2026auditing (arXiv 2603.10029, QRE lambda per model). Together they already elicit beliefs, test best response, and fit QRE lambda to LLM play.
   - **Threat:** "we test best response to stated beliefs with logit lambda" is not new as a method.
   - **What Tidewall adds:** daily, Brier-scored probability forecasts inside a long repeated multi-game simulation, with providers rotated across seats, and a comparison of belief quality (calibration) against action quality (best response).
   - **Warning from pechonelkins2026auditing:** silent parser fallbacks and token limits corrupted a published benchmark. Log and report every parse failure.

**Novelty not found in prior work (the search was not exhaustive):**
- A Latin-square seat rotation of frontier providers across asymmetric roles.
- A no-payoff news sender whose framing tilt is coded by out-of-family judges inside a strategic simulation.
- A confidant channel for leak measurement combined with all of the above.
- A pre-registered Bayesian analysis of an LLM game study.

State these as the contribution. Treat each separate ingredient as prior art.

## Planned core items

- **axelrod1984**, Axelrod, The Evolution of Cooperation, Basic Books 1984. Repeated PD tournaments and the case for reciprocity. Tidewall's turf war is the repeated PD with a random end, so the shadow of the future applies.
- **fudenberg1986**, Fudenberg and Maskin, Econometrica 54(3):533-554, 1986, doi 10.2307/1911307. The folk theorem: any feasible, individually rational payoff can be sustained when players are patient. This is the benchmark set for the turf war. The end page 554 is from the standard citation; Crossref lists only the start page.
- **kamenica2011**, Kamenica and Gentzkow, AER 101(6):2590-2615, 2011, doi 10.1257/aer.101.6.2590. Bayesian persuasion, the theory of a sender who shapes beliefs. It frames the World seat as a sender, with the difference that the World has no payoff.
- **akata2025** (the published version) and **akata2023** (the preprint, arXiv 2305.16867), Nature Human Behaviour 9(7):1380-1390, 2025, doi 10.1038/s41562-025-02172-y. LLMs do well in the iterated PD family, coordinate poorly in Battle of the Sexes, and social chain-of-thought helps. These are finitely repeated 2x2 games without seat rotation or beliefs. Cite the journal version.
- **park2023**, Park et al., UIST 2023, doi 10.1145/3586183.3606763, arXiv 2304.03442. Generative agents with memory, reflection and planning in a sandbox town. This is the origin of diary-style memory. It has no payoffs or equilibria.
- **altera2024sid**, Project Sid, arXiv 2411.00114, 2024. Simulations of 1,000 or more agents in Minecraft, with emergent roles, rules and culture. It operates at much larger scale but has no game-theoretic benchmark.
- **duffy2025diplomacyblog**, Alex Duffy, Every, 2025-06-04, "We Made Top AI Models Compete in a Game of Diplomacy. Here's Who Won." Frontier models play full-press Diplomacy. Secondary coverage says o3 won by deceiving its allies and Claude kept cooperating. This is a blog, not peer reviewed. **duffy2025diplomacy** (arXiv 2508.07485) is the peer-style harness paper from the same group; cite it for method.
- **bakhtin2022cicero**, CICERO, Science 378(6624):1067-1074, 2022, doi 10.1126/science.ade9097. Human-level Diplomacy from a language model combined with strategic planning. It is the background for LLM negotiation.

## LLMs in repeated and strategic games

- **brookins2024**, Economics Bulletin 44(1):25-37, 2024. GPT-3.5 cooperates in the PD far more often than humans (about 65% against 37%) and leans fair in the dictator game. One model, one-shot games.
- **duan2024gtbench**, arXiv 2402.12348. Ten game-theoretic tasks. LLMs fail in complete-information deterministic games and do better in probabilistic ones. It is a benchmark with no society.
- **huang2024gamabench**, arXiv 2403.11807. GAMA-Bench: eight multi-player games, with robustness and generalisation tests.
- **fan2023rational**, arXiv 2312.05488. Tests whether LLMs build desires and beliefs and act on them in classic games. GPT-4 is better but not fully rational. It is an early belief-action study in one-shot games.
- **lore2024**, Scientific Reports 14:18490, 2024, doi 10.1038/s41598-024-69032-z. Contextual framing shifts LLM play as much as game structure does. This supports keeping the city framing constant across seats.
- **guo2023gpt**, arXiv 2305.05516. GPT in the ultimatum game and the PD. Early, single model.
- **fontana2024nicer**, arXiv 2406.13605. Llama2 in the iterated PD against random opponents; more cooperative than humans.
- **silva2024mixed**, arXiv 2406.10574. LLMs in mixed-strategy Nash games; they struggle to randomise. Relevant to the inspection-game mixing.
- **wang2024tmgbench**, arXiv 2410.10479. Benchmark over the 144 2x2 game types of the Robinson-Goforth topology.
- **vallinder2024cultural**, arXiv 2412.10270. The donor game across Claude 3.5 Sonnet, Gemini 1.5 Flash and GPT-4o. Cooperation differs by model and is sensitive to seeds. It supports seed-matched triples.
- **willis2025cooperate**, arXiv 2501.16173. LLMs write strategies for social dilemmas; many are aggressive.
- **piatti2024govsim**, arXiv 2404.16698. GovSim common-pool resource society; most models fail to sustain cooperation.
- **fish2024collusion**, arXiv 2404.00806. LLM pricing agents collude tacitly in oligopoly. Collusion here emerges without explicit messages.

## Rationality, beliefs, QRE, forecasting

- **horton2023homosilicus**, arXiv 2301.07543. LLMs as simulated economic agents reproduce classic behavioural results.
- **chen2023rationality**, PNAS 120(51), 2023, doi 10.1073/pnas.2316205120. GPT shows high revealed-preference rationality in budget tasks.
- **raman2024steer**, arXiv 2402.09552. A broad taxonomy of economic rationality applied to LLMs.
- **jia2025behavioral**, arXiv 2502.20432. Truncated QRE across 22 LLMs and 13 games. This is the closest QRE method to Tidewall's.
- **junque2025fragility**, arXiv 2510.10813. Separates conjectures, evaluation and choice; best-response behaviour is fragile.
- **sobotka2026broken**, arXiv 2605.00226. Gaps between observations and beliefs, and between beliefs and actions, in open-weight models in incomplete-information games. Probing internal states differs from Tidewall's stated forecasts.
- **pechonelkins2026auditing**, arXiv 2603.10029. Per-model QRE lambda, plus an audit showing silent parse fallbacks invalidated earlier results.
- **mannekote2025belief**, arXiv 2507.02197. Stated beliefs fail to predict role-play behaviour in a trust game.
- **pal2025confidence**, arXiv 2511.13240. Confidence elicited on static tasks does not align with agentic actions.
- **halawi2024forecasting**, arXiv 2402.18563, and **karger2024forecastbench**, arXiv 2409.19839. Brier-scored LLM forecasting of real-world questions. These are reference points for calibration, outside games.

## Inspection, corruption, auditing

- **sohail2026mentalization**, **shrestha2026inspection**, **vedanta2026corrupt**: see the closest competitors section.
- **das2026auditing**, AAAI 2026 pp. 16787-16794, arXiv 2604.25085. Theory of optimal audit policies in a principal-agent game with many agents. It has no LLMs; it is theory support for the Council audit.
- **pan2023machiavelli**, arXiv 2304.03279. A reward-versus-ethics trade-off benchmark that includes deception and power-seeking.
- No paper was found that puts LLMs in a principal-agent game with a bribe-taking inspector, judged against a solved equilibrium.

## Deception, collusion, secrets

- **ogara2023hoodwinked**, arXiv 2308.01404. Text-based murder-mystery game. Larger models deceive and detect better.
- **motwani2024secret**, arXiv 2402.07510. Steganographic collusion between LLM agents. Relevant if the gangs coordinate covertly in cheap talk.
- **chi2024amongagents**, arXiv 2407.16521, and **golechha2025amongus**, arXiv 2504.04072 (NeurIPS 2025 Spotlight per its arXiv record). Among Us as a sandbox for deception, with probes for detection.
- **xu2023werewolf**, arXiv 2309.04658; **light2023avalonbench**, arXiv 2310.05036; **wang2023avalon**, arXiv 2310.01320. Hidden-role games.
- **olson2026liecraft**, arXiv 2603.06874. A hidden-role deception sandbox with grounded scenarios.
- **shi2026agentslie**: see the closest competitors section.
- **scheurer2023pressure**, arXiv 2311.07590. GPT-4 deceives its user when under pressure.
- **park2024deception**, Patterns 5(5):100988, 2024, doi 10.1016/j.patter.2024.100988. Survey of AI deception.
- **mireshghallah2023secret**, arXiv 2310.17884. ConfAIde: LLMs leak private information in context. This is the nearest precedent for the Sam leak measure.
- **guan2024richelieu**, arXiv 2407.06813, doi 10.52202/079017-3925 (NeurIPS 2024 per arXiv). A self-evolving Diplomacy agent.

## Framing, political bias, judges

- **rozado2024political**, PLOS ONE 19(7):e0306621, doi 10.1371/journal.pone.0306621. Most chat LLMs lean left of centre on political tests.
- **motoki2024more**, Public Choice 198:3-23, doi 10.1007/s11127-023-01097-2. ChatGPT shows political bias.
- **feng2023pretraining**, arXiv 2305.08283. Political bias in pretraining data carries into downstream tasks.
- **kennedy2025lookingglass**, arXiv 2503.16674. Ideological framing in LLM-written articles across eight models; the judges themselves are biased.
- **pastorino2025fifo**, arXiv 2505.05406. Framing benchmark for LLM news summaries; framing differs by architecture. This is the closest precedent for measuring tilt in the World seat. It uses neutral input, while Tidewall writes from logged events.
- **zheng2023judge**, arXiv 2306.05685. LLM-as-judge works but shows self-enhancement bias.
- **panickssery2024selfpref**, arXiv 2404.13076. LLM evaluators recognise their own outputs and favour them. This is the main justification for out-of-family judges.
- **wataoka2024selfpref**, arXiv 2410.21819. A self-preference metric, linked to the judge's familiarity with the text (lower perplexity).

## LLM societies and simulations

- **vezhnevets2023concordia**, arXiv 2312.03664. Concordia, a game-master architecture for generative agent-based modelling.
- **piao2025agentsociety**, arXiv 2502.08691. AgentSociety, a large urban social simulation.
- **feng2025simcity**, arXiv 2510.01297. LLM macroeconomy with households, firms, central bank and government. No police or media.
- **zeng2025crimemind**, arXiv 2506.05981. LLM urban crime agent-based model based on Routine Activity Theory.
- **wang2025lawinsilico**, arXiv 2510.24442. Legal society simulation that reproduces macro crime trends.
- None of these use solved-equilibrium games as benchmarks.

## Classic theory and methods

- **avenhaus2002inspection**, Handbook of Game Theory vol. 3, ch. 51, pp. 1947-1987, 2002, doi 10.1016/S1574-0005(02)03014-X. The standard survey of inspection games; the crime-versus-inspection equilibrium comes from here.
- **mckelvey1995qre**, GEB 10(1):6-38, 1995, doi 10.1006/game.1995.1023. Logit QRE and lambda.
- **brier1950**, MWR 78(1):1-3, doi 10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2.
- **gneiting2007**, JASA 102(477):359-378, doi 10.1198/016214506000001437. Strictly proper scoring rules; the Brier score is proper.
- **holm1979**, Scand. J. Statist. 6(2):65-70, JSTOR 4615733. No DOI.
- **hayes2007krippendorff**, Communication Methods and Measures 1(1):77-89, doi 10.1080/19312450709336664. Krippendorff's alpha for the judge agreement. **krippendorff2018** is the book (4th ed., SAGE).
- **williams1949**, Aust. J. Sci. Res. A 2(2):149-168, doi 10.1071/CH9490149. Latin squares balanced for carryover. **jones2014crossover** is Jones and Kenward, 3rd ed., Chapman and Hall/CRC 2014. Check whether the 3x3 square is Williams-balanced for first-order carryover.
- **vehtari2021rhat**, Bayesian Analysis 16(2):667-718, doi 10.1214/20-BA1221.
- **rubin1976**, Biometrika 63(3):581-592, doi 10.1093/biomet/63.3.581. Missing-data mechanisms, for failed or unparseable turns.
- **capretto2022bambi**, JSS 103(15), 2022, doi 10.18637/jss.v103.i15.
- **abrilpla2023pymc**, PeerJ CS 9:e1516, 2023, doi 10.7717/peerj-cs.1516.

## UNVERIFIED

- "What Game-Theoretic Benchmarks Miss: Strategic Silence in Multi-Agent LLMs" (Shi, Zhang, Conitzer, Jin, ICML 2026). Seen only in search snippets of ICML virtual pages, with no arXiv id or DOI found. The snippet says 61-93% of premeditated rounds contain no deceptive message, so deception shows up as withholding. This bears on the Sam and diary design. Not in refs.bib.
- The AI Diplomacy blog: title, author and date are confirmed from page metadata. The specific claims (o3 deceived its allies, Claude stayed cooperative) come from secondary coverage, because the article body is paywalled. Do not quote outcome numbers.
- Good Start Labs betrayal rankings (September 2026): secondary source only. Not in refs.bib.
- shrestha2026inspection: author given names are not checked (Crossref returned family names only). Fill them in from the ACL Anthology.
- jones2014crossover: ISBN and DOI not confirmed; sources give different ISBNs. krippendorff2018: edition and year come from OpenLibrary only.
- Conference versions of arXiv-only entries (for example GTBench, GAMA-Bench, GovSim, Secret Collusion, Panickssery, Zheng): venues not checked, so they are cited as arXiv preprints.
- Brier score, Bambi and similar method claims are standard and were not read in full text.
