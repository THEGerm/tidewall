# Papers (Google Scholar)

Google Scholar search results, grouped by search query, run 2026-11-01. The top 60 Scholar results per query were collected; each paper is listed once, under the first category it matched, in Scholar relevance order. To keep the file under 450 kB, the papers least related to these topics were dropped: repeated games, social dilemmas, cooperation, strategy classification; provider and model-family comparisons; beliefs, theory of mind, best response; deception, collusion, cheap talk; institutions, principal-agent roles; validity of LLM social simulations; bias in LLM judges and coders; quantal response, equilibrium selection. Code is the arXiv identifier, else the DOI, else the Google Scholar cluster ID. Abstracts are the full text from the arXiv API, Semantic Scholar or Crossref; where none had it, the Scholar snippet is given and marked. Filtered on 2026-11-01 to papers relevant to Tidewall.

## large language model AND repeated game

### Gtbench: Uncovering the strategic reasoning capabilities of llms via game-theoretic evaluations

**Code:** Google Scholar cluster DGxaUazejp8J

**Abstract:** (Scholar snippet; full abstract not found) … the game-theoretic properties of LLMs, such as equilibrium and Pareto Efficiency in repeated games… for role identification in the game of avalon with large language models. In The 2023 …

### Adaptive Switching Between Self-Play and Multi-Model Game Play for Multiple Large Language Models

**Code:** Google Scholar cluster VJsLQleoXLEJ

**Abstract:** (Scholar snippet; full abstract not found) … -3.5, and GPT-4) play finitely repeated games with each other and with other, human-like … large set of two players-two strategies games, we find that LLMs are particularly good at games …

### Exploring cooperative behavior in llms with game theory

**Code:** Google Scholar cluster EoJDaKtmxaUJ

**Abstract:** (Scholar snippet; full abstract not found) … LLM behavior through the lens of game theory, focusing on the iterated prisoner’s dilemma (IPD) and trust games… patterns, particularly in trust games. Notably, models that maximize …

### Exploring Large Language Models for Communication Games: An Empirical Study on Werewolf

**Code:** arXiv:2309.04658

**Abstract:** Communication games, which we refer to as incomplete information games that heavily depend on natural language communication, hold significant research value in fields such as economics, social science, and artificial intelligence. In this work, we explore the problem of how to engage large language models (LLMs) in communication games, and in response, propose a tuning-free framework. Our approach keeps LLMs frozen, and relies on the retrieval and reflection on past communications and experiences for improvement. An empirical study on the representative and widely-studied communication game, ``Werewolf'', demonstrates that our framework can effectively play Werewolf game without tuning the parameters of the LLMs. More importantly, strategic behaviors begin to emerge in our experiments, suggesting that it will be a fruitful journey to engage LLMs in communication games and associated domains.

### Game of Thoughts: Iterative Reasoning in Game-Theoretic Domains with Large Language Models

**Code:** doi:10.5555/3709347.3743629

**Abstract:** We explore the strategic reasoning capabilities of large language models (LLMs). We first show that naively allowing LLMs to select actions in games can lead to sub-optimal and easily exploitable strategies. To address this limitation we propose several algorithms that guide LLMs to iteratively refine their action choices by simulating game outcomes in self-play, akin to cognitive hierarchy models used to characterize human thought processes in strategic settings. Our empirical results in several prominent resource allocation and auction settings indicate that our approach produces stronger and less exploitable strategies. Hence, emulating human decision-making models can enable us to improve the reasoning capabilities of LLMs in multiagent interactions.

### Same Game, Different Story: A Minimal Conservative Strategic Robustness Benchmark for Large Language Model Agents

**Code:** arXiv:2607.19670

**Abstract:** Large language model agents are increasingly deployed in settings where the value of an action depends on what other agents do. This creates a strategic reliability problem: the same game may be described as a business negotiation, a friendly compromise, a diplomatic exchange, or an abstract payoff matrix, and the model may choose different actions even when the incentives are unchanged. This paper introduces \emph{Same Game, Different Story}, a benchmark for strategic robustness: invariance of model-induced action distributions under payoff-preserving language changes. The empirical analysis uses a deliberately narrow, literature-calibrated comparison from Lorè and Heydari's peer-reviewed study: business framing versus friend-sharing framing across GPT-3.5, GPT-4, and LLaMa-2 in four social-dilemma games, with 300 initializations per retained model-game-context cell. The retained design comprises 24 of the source study's 60 cells, representing 7,200 decisions. Because trial-level files were not available from the article, the analysis is presented as a secondary calibration based on reconstructed published rates, not as new model runs. As a conservative sensitivity analysis, effect magnitudes are attenuated by 30\% toward the null: action shifts are multiplied by 0.70, and non-robustness, defined as one minus the robustness score, is multiplied by 0.70. Under this attenuation, pooled strategic robustness is 0.783 with a 95\% bootstrap interval from 0.774 to 0.790, and friend-sharing framing raises cooperation by 0.307 with a 95\% bootstrap interval from 0.297 to 0.316 relative to business framing. The analysis supports the narrower claim that social-relational framing can change strategic choices even when incentives are held fixed, without extending the analysis to a broader suite of contextual or cross-benchmark comparisons.

### Shall We Play a Game? Language Models for Open-ended Wargames

**Code:** arXiv:2509.17192

**Abstract:** LLM-based social simulations can make a generated transcript look like a single behavioral signal, but the model behind that transcript may be doing several different jobs: choosing what an actor says or does, deciding what happens after an action, or both. The difference matters especially in open-ended wargames, where models are prized for handling unusual actions and ambiguous consequences. We report a scoping review of 223 de-duplicated AI-in-wargames and strategic-simulation papers retrieved through May 1, 2026, describing each simulation by its model-control profile: whether the language model has open-ended control over player actions, adjudication, or both. Only 20 of 223 studies (~9%) give language models both roles. Before treating LM outputs as social simulations, researchers need to know how much creative control the model has over actions and consequences. For open-ended simulations, fidelity depends not only on whether agents behave plausibly, but also on whether language models can reliably act as adjudicators or world models.

### Game Arena: Strategic LLM Evaluation in Competitive Environments

**Code:** arXiv:2609.31473

**Abstract:** We introduce Kaggle Game Arena, an open and ever-expanding platform to evaluate large language models (LLMs) through competitive games. Different from static benchmarks, game arena enables models to play head-to-head matchups in structured environments where the gameplay strength naturally increases as models evolve, preventing performance saturation. This technical report details the infrastructure behind Game Arena and describes the three pilot game environments: Chess, Poker, and Werewolf. These environments span perfect information, imperfect information, and multiplayer game settings, enabling a systematic study of models' strategic planning, adaptation, and robustness under uncertainty. For each game, we provide a detailed description of the environment, evaluation metrics, and results from running full competitions across models. Through robust infrastructure and large-scale ground-truth based evaluation, Game Arena ensures reproducibility, transparency and generalizability to new games and variants over time.

### Experience-Sensitive Game Learning: A Behavioral Study of Humans and Language Agents

**Code:** arXiv:2608.07490

**Abstract:** Large language model agents are increasingly evaluated through games, but most benchmarks emphasize final outcomes rather than how players learn from repeated interaction. We study experience-sensitive game learning: how gameplay experience changes the decision-making behavior of humans and language agents. We formulate experience-sensitive game learning as a framework for analyzing behavioral change across repeated gameplay, rather than only final score or win rate. We introduce a suite of interactive games with reusable strategic structure, together with cross-game greedy-to-global metrics and game-specific behavioral diagnostics that make experience-driven change observable from action traces. We also collect repeated-game trajectories from human players and evaluate recent self-evolving language agents in the same behavioral metric space. Our results show that human players exhibit interpretable and relatively stable shifts from locally greedy heuristics toward more global strategic decisions. In contrast, current self-evolving agents often show noisy and transient gains, suggesting that existing self-evolution methods remain limited in converting gameplay experience into durable changes in decision-making behavior.

### Do LLMs Beat Nash? Testing Decentralized Coordination in Self-Play Multi-Agent Games

**Code:** arXiv:2608.12547

**Abstract:** Large language model agents deployed without a central controller are often assumed to require communication to coordinate their actions. We ask what remains possible without it: when independent instances of the same model cannot communicate, can they still reason about their counterparts well enough to exceed the standard game-theoretic baseline for uncoordinated play? We introduce a benchmark of one-shot, no-communication games in which each of thirteen language models is told only that its counterparts are running the same model and is evaluated against the Nash equilibrium of the underlying game. In two-player matrix games spanning seven archetypes and two to ten actions per player, two frontier-hosted models consistently exceed their Nash benchmark, approaching the optimal joint outcome in several archetypes, while most open-weight models achieve only partial gains that vary sharply by game structure. Performance degrades substantially in team-based games with four or more interchangeable agents, particularly as the action space grows, suggesting that whatever capability drives self-play gains in dyadic games does not transfer to larger multi-agent teams.

### FAIRGAME: a Framework for AI Agents Bias Recognition using Game Theory

**Code:** arXiv:2504.14325

**Abstract:** Letting AI agents interact in multi-agent applications adds a layer of complexity to the interpretability and prediction of AI outcomes, with profound implications for their trustworthy adoption in research and society. Game theory offers powerful models to capture and interpret strategic interaction among agents, but requires the support of reproducible, standardized and user-friendly IT frameworks to enable comparison and interpretation of results. To this end, we present FAIRGAME, a Framework for AI Agents Bias Recognition using Game Theory. We describe its implementation and usage, and we employ it to uncover biased outcomes in popular games among AI agents, depending on the employed Large Language Model (LLM) and used language, as well as on the personality trait or strategic knowledge of the agents. Overall, FAIRGAME allows users to reliably and easily simulate their desired games and scenarios and compare the results across simulation campaigns and with game-theoretic predictions, enabling the systematic discovery of biases, the anticipation of emerging behavior out of strategic interplays, and empowering further research into strategic decision-making using LLM agents.

### Suspicion-Agent: Playing Imperfect Information Games with Theory of Mind Aware GPT-4

**Code:** arXiv:2309.17277

**Abstract:** Unlike perfect information games, where all elements are known to every player, imperfect information games emulate the real-world complexities of decision-making under uncertain or incomplete information. GPT-4, the recent breakthrough in large language models (LLMs) trained on massive passive data, is notable for its knowledge retrieval and reasoning abilities. This paper delves into the applicability of GPT-4's learned knowledge for imperfect information games. To achieve this, we introduce \textbf{Suspicion-Agent}, an innovative agent that leverages GPT-4's capabilities for performing in imperfect information games. With proper prompt engineering to achieve different functions, Suspicion-Agent based on GPT-4 demonstrates remarkable adaptability across a range of imperfect information card games. Importantly, GPT-4 displays a strong high-order theory of mind (ToM) capacity, meaning it can understand others and intentionally impact others' behavior. Leveraging this, we design a planning strategy that enables GPT-4 to competently play against different opponents, adapting its gameplay style as needed, while requiring only the game rules and descriptions of observations as input. In the experiments, we qualitatively showcase the capabilities of Suspicion-Agent across three different imperfect information games and then quantitatively evaluate it in Leduc Hold'em. The results show that Suspicion-Agent can potentially outperform traditional algorithms designed for imperfect information games, without any specialized training or examples. In order to encourage and foster deeper insights within the community, we make our game-related data publicly available.

### Hoodwinked: Deception and Cooperation in a Text-Based Game for Language Models

**Code:** arXiv:2308.01404

**Abstract:** Are current language models capable of deception and lie detection? We study this question by introducing a text-based game called $\textit{Hoodwinked}$, inspired by Mafia and Among Us. Players are locked in a house and must find a key to escape, but one player is tasked with killing the others. Each time a murder is committed, the surviving players have a natural language discussion then vote to banish one player from the game. We conduct experiments with agents controlled by GPT-3, GPT-3.5, and GPT-4 and find evidence of deception and lie detection capabilities. The killer often denies their crime and accuses others, leading to measurable effects on voting outcomes. More advanced models are more effective killers, outperforming smaller models in 18 of 24 pairwise comparisons. Secondary metrics provide evidence that this improvement is not mediated by different actions, but rather by stronger persuasive skills during discussions. To evaluate the ability of AI agents to deceive humans, we make this game publicly available at h https://hoodwinked.ai/ .

### Fairness in repeated games

**Code:** Google Scholar cluster qTZIA118IU8J

**Abstract:** (Scholar snippet; full abstract not found) … As we assume that the total material stakes of the repeated game become arbitrarily large, this means that every fairness equilibrium should yield the player at least (arbitrari ly close to) …

## LLM AND prisoner's dilemma

### Investigating emergent goal-like behaviour in large language models using experimental economics

**Code:** Google Scholar cluster CLJW3aqB41oJ

**Abstract:** (Scholar snippet; full abstract not found) … Another potential limitation of the current study is that the LLM has been exposed to a vast literature on the iterated Prisoner’s Dilemma in its training data, and it is unclear how would it …

### When Ethics and Payoffs Diverge: LLM Agents in Morally Charged Social Dilemmas

**Code:** arXiv:2505.19212

**Abstract:** Recent advances in LLMs have enabled their use in complex agentic roles, involving decision-making with humans or other agents, making ethical alignment a critical concern. While prior work has examined LLMs' moral judgment and strategic behavior separately, there is limited understanding of how they act when moral imperatives directly conflict with profit incentives. We introduce \msimfull (\msim) to evaluate how LLMs behave in the prisoner's dilemma and public goods game embedded in morally charged contexts, varying moral framing, opponent behavior, and survival pressure across nine models. Beyond measuring behavior, we estimate the causal effect of each factor via average treatment effects (ATEs) and analyze agents' own reasoning traces to characterize the motives behind their choices. We find that no model remains consistently moral, with cooperation rates ranging from 7.9\% to 76.3\%. Game structure and moral framing are the strongest causal drivers of moral behavior, while reasoning-trace analysis reveals distinct motive profiles across models, ranging from predominantly payoff-maximizing to moral- and reputation-oriented. Together, these results expose the situational brittleness of current LLMs' moral behavior and the risk of deploying them where profit incentives conflict with ethical guidelines.

### Beyond Nash Equilibrium: Bounded Rationality of LLMs and humans in Strategic Decision-making

**Code:** arXiv:2506.09390

**Abstract:** Large language models are increasingly used in strategic decision-making settings, yet evidence shows that, like humans, they often deviate from full rationality. In this study, we compare LLMs and humans using experimental paradigms directly adapted from behavioral game-theory research. We focus on two well-studied strategic games, Rock-Paper-Scissors and the Prisoner's Dilemma, which are well known for revealing systematic departures from rational play in human subjects. By placing LLMs in identical experimental conditions, we evaluate whether their behaviors exhibit the bounded rationality characteristic of humans. Our findings show that LLMs reproduce familiar human heuristics, such as outcome-based strategy switching and increased cooperation when future interaction is possible, but they apply these rules more rigidly and demonstrate weaker sensitivity to the dynamic changes in the game environment. Model-level analyses reveal distinctive architectural signatures in strategic behavior, and even reasoning models sometimes struggle to find effective strategies in adaptive situations. These results indicate that current LLMs capture only a partial form of human-like bounded rationality and highlight the need for training methods that encourage flexible opponent modeling and stronger context awareness.

### Cheap Talk Stabilizes Strategic Interaction in LLM Agents

**Code:** arXiv:2609.16270

**Abstract:** Large language models are increasingly deployed as interacting agents, making the persistence of their action policies across repeated interaction critical for reliable multi-agent operation. We investigate whether and how agent-generated, non-binding pre-play communication ("cheap talk") increases such persistence in four open-weight 7-9B-parameter LLMs. Our experiments span four repeated two-player games -- Prisoner's Dilemma, Snowdrift, Stag Hunt, and Harmony -- with incentive structures ranging from strategic conflict to alignment, each presented in six contexts. We observe unstable trajectories in all four games, although their prevalence and magnitude depend strongly on model and context. Across models, games, and contexts, cheap talk is predominantly stabilizing, with five corrected reversals concentrated in social or team framings; effects vary substantially by model and context. Controlled current-message interventions identify two separable output-level channels in Qwen: reduced action uncertainty and less between-round drift in action probabilities. Matched history-by-message counterfactuals further show that recent partner behavior conditions how mutual-benefit versus self-prioritizing language affects policy persistence. Finally, in Prisoner's Dilemma, we identify in Qwen and Falcon a history-balanced policy-content direction in late transformer layers; projecting out this direction increases realized switching during closed-loop play, demonstrating that complete trajectories are causally sensitive to this component. Together, these findings show that cheap talk can make individual trajectories more persistent across diverse incentive structures, while revealing that the magnitude and mechanisms of stabilization are model- and history-dependent.

### When Cooperation Predictions Become Reasons to Defect: Policy Defaults in LLM Assistance for Social Dilemmas

**Code:** doi:10.1609/aies.v9i4.43327

**Abstract:** AI systems increasingly provide advice about how humans should act toward one another. We audit LLMs asked for advice in one-shot and five-round Prisoner's Dilemma tasks using fictional counterpart profiles. In Study 1, 14 model conditions from OpenAI, Anthropic, and Google evaluated 60 profiles and returned both a predicted cooperation probability and a Cooperate/Defect recommendation. Models showed broadly similar prediction patterns, assigning high cooperation probabilities to Cooperative profiles and low probabilities to Blameworthy profiles, but their recommendations diverged sharply. Some treated predicted cooperativeness as a reason for reciprocal cooperation, whereas others treated it as compatible with payoff-maximizing defection under the minimal one-shot prompt. A consequence-scope check further showed that several defection-default policies shifted toward cooperation when consequences beyond the immediate payoff were made explicit. In Study 2, a five-round audit showed that models could open or repair cooperation while still converting cooperative or repaired histories into final-round defection. These findings show that evaluating LLM assistance in social dilemmas requires separating social prediction from recommendation policy. Advice that accurately identifies cooperators but treats their good standing as a signal of exploitability could prompt defection that damages the advised actor's standing and reduces exploited cooperators' willingness to cooperate, thereby undermining both the reputational and motivational foundations of large-scale cooperation.

### Do Large Language Models Learn Human-Like Strategic Preferences?

**Code:** arXiv:2404.08710

**Abstract:** In this paper, we evaluate whether LLMs learn to make human-like preference judgements in strategic scenarios as compared with known empirical results. Solar and Mistral are shown to exhibit stable value-based preference consistent with humans and exhibit human-like preference for cooperation in the prisoner's dilemma (including stake-size effect) and traveler's dilemma (including penalty-size effect). We establish a relationship between model size, value-based preference, and superficiality. Finally, results here show that models tending to be less brittle have relied on sliding window attention suggesting a potential link. Additionally, we contribute a novel method for constructing preference relations from arbitrary LLMs and support for a hypothesis regarding human behavior in the traveler's dilemma.

### Opponent Shaping in LLM Agents

**Code:** arXiv:2510.08255

**Abstract:** Large Language Models (LLMs) are increasingly being deployed as autonomous agents in real-world environments. As these deployments scale, multi-agent interactions become inevitable, making it essential to understand strategic behavior in such systems. A central open question is whether LLM agents, like reinforcement learning agents, can shape the learning dynamics and influence the behavior of others through interaction alone. In this paper, we present the first investigation of opponent shaping (OS) with LLM-based agents. Existing OS algorithms cannot be directly applied to LLMs, as they require higher-order derivatives, face scalability constraints, or depend on architectural components that are absent in transformers. To address this gap, we introduce ShapeLLM, an adaptation of model-free OS methods tailored for transformer-based agents. Using ShapeLLM, we examine whether LLM agents can influence co-players' learning dynamics across diverse game-theoretic environments. We demonstrate that LLM agents can successfully guide opponents toward exploitable equilibria in competitive games (Iterated Prisoner's Dilemma, Matching Pennies, and Chicken) and promote coordination and improve collective welfare in cooperative games (Iterated Stag Hunt and a cooperative version of the Prisoner's Dilemma). Our findings show that LLM agents can both shape and be shaped through interaction, establishing opponent shaping as a key dimension of multi-agent LLM research.

### Modeling Human Behavior in the Prisoner's Dilemma with Large Language Models

**Code:** arXiv:2610.23860

**Abstract:** The Prisoner's Dilemma has long served as a foundational framework for studying human decision-making and cooperative outcomes across social scenarios, yet human behavior consistently deviates from predictions of fully rational economic theory. Previous works have studied human and LLM outcomes in the Prisoner's Dilemma; however, these studies have lacked at least one key feature: a memory component for LLM agents, accessible open-source models, or comparison against empirical human data. This project investigates whether open-source LLMs, TII Falcon 7B Instruct, Google Gemma 7B, Meta Llama 3.1 8B Instruct, Microsoft Phi Mini MoE Instruct, and Qwen 2.5 7B Instruct, can model human cooperation patterns in repeated Prisoner's Dilemma games, while examining how an LLM's knowledge that its opponent will be shuffled affects its decisions. Using a standardized prompting framework, we simulated interactions in two trial types: a fixed-partner setting where both agents retain memory, and a shuffled-partner setting where a memory-enabled agent, informed that its opponent changes across rounds, interacts with a memoryless agent. For each trial, we measured cooperation rates over 100 rounds and 10-round increments and compared them to human data from Montero-Porras et al. (2022). Under both frameworks, all LLMs differed from the human cooperation rate. Open-source LLMs generally over-cooperated relative to humans, particularly in the shuffled framework, where human cooperation averaged 28.5% while several models exceeded 80%. Qwen-2.5-7B-Instruct showed deterministic tendencies, while Phi-mini-MoE-Instruct displayed greater variability and briefly approximated human rates. These findings suggest that LLMs have potential as behavioral simulation agents and provide a benchmark across two interaction environments, although open-source models are not yet reliable substitutes for human participants.

### Unilateral Cooperation: LLM Pricing in the Grip of an Extortioner

**Code:** Google Scholar cluster IkpMWJP2KRQJ

**Abstract:** (Scholar snippet; full abstract not found) … of an LLM agent in a duopoly pricing game against a ZD extortioner. By mapping a multinomial logit (MNL) demand model onto a Prisoner’s Dilemma … 𝜒 increases, the LLM’s payoff ratio …

### Emergent Cooperative Behavior in LLMs with Game Theory

**Code:** Google Scholar cluster ZvtlyrU-JBsJ

**Abstract:** (Scholar snippet; full abstract not found) … In this paper, we investigate LLM behavior through the lens of game theory, focusing on the iterated prisoner’s dilemma (IPD) and trust games. We conduct tournaments with both small …

### Research on Collaborative Decision-Making by Large Language Models in Multi-Agent Game Environments

**Code:** doi:10.19678/j.issn.1000-3428.0070301

**Abstract:** (Scholar snippet; full abstract not found) … LLM for collaborative decision making and has been experimentally validated in a spatial prisoner's dilemma … the decision-making bottleneck of LLM in fuzzy task environments and …

### Do LLMs Take Care of Their Own? Similarity Signals Can Induce Cooperation

**Code:** arXiv:2608.12125

**Abstract:** As LLM-based agents with user-instructed goals are becoming widely deployed, they increasingly encounter each other in strategic interactions, and face challenges of finding mutually beneficial outcomes. Prior literature has argued that cooperation problems such as the Prisoner's Dilemma are resolvable in settings where agents know they follow very similar decision making patterns, as for example in monocultural AI ecosystems. Following that line of work, this paper introduces the first framework for evaluating LLM decision making when agents are provided with graded similarity signals. Among our findings, we establish that different LLM models vary drastically in how they navigate similarity signals, with some modern models showing consistent behavior across cooperation problems, payoff structures, and prompt framing. Perhaps surprisingly, our experiments also show that the dataset based on which the similarity signal is computed has small to no impact on induced cooperation, and that LLM models systematically self-identify as highly similar when asked to evaluate another model's chain-of-thought reasoning by themselves. Finally, we develop an LLM-behavioral-game-theoretic model that captures some of their reasoning rationale, and show that it can support cooperative outcomes in equilibrium under sufficiently high similarity scores.

### Cooperation Without Adaptation: LLM Agents in a Collective-Risk Dilemma

**Code:** arXiv:2610.22882

**Abstract:** Language-model agents are increasingly deployed to act on behalf of people in settings where individual decisions shape shared outcomes. We examine whether five production models adapt their contributions to changing risks and partner behaviour, or instead follow a relatively fixed strategy. In a collective-risk dilemma game (CRG), six players contribute to a shared pool over ten rounds; if the pool falls short of its target, a catastrophe may destroy their remaining resources. Four models contributed approximately an equal share at every positive risk level, and four of the five also contributed when risk was zero, even though contributing could not improve their payoff. Explicitly stating that only the agent's own payoff mattered reduced zero-risk contributions for most models, while a more neutral prompt did not. Several models correctly identified which action offered the higher expected payoff at different risk levels, yet their contributions changed little. Against fixed partners, no model consistently chose the payoff-maximising response, and in mixed-model groups, a single agent's shortfall in the final round could cause an otherwise successful group to fail. Payoff-based selection also depended on population composition: in a single six-agent group, it favoured the model that contributed least and reduced group success, whereas in larger, randomly mixed populations, it favoured an exact fair-share model at moderate and high risk. These findings show that cooperative self-play alone is not evidence of strategic adaptability. Consistent with a machine-behaviour approach, evaluations of agents in multi-agent systems should test how they respond to incentives, partner actions, and population composition.

### Divergent Minds, Convergent Baselines: A Bounded-Rationality Account of LLM-Human Strategic Behaviour

**Code:** arXiv:2605.26437

**Abstract:** Researchers have started using LLM agents in place of human subjects in behavioural and political-science experiments, often as a cheaper substitute for laboratory pools. The substitution does not hold up in strategic settings: humans and LLMs reliably make different choices, and neither fine-tuning on human response data nor persona conditioning has closed the gap. The behavioural-economics literature has, since Simon's introduction of bounded rationality, modelled human strategic behaviour as a classical baseline plus an additive correction term $δ$. The framework proposed here reads $δ$ as the mathematical signature of bounded computation: the gap between what an unboundedly-rational agent would compute and what a computationally bounded agent actually produces. For canonical games whose solutions are present in standard training corpora, LLMs retrieve and recombine corpus material, bypassing the bound that produces $δ$ in humans. The framing extends to reasoning-distilled models through cognitive-hierarchy theory: their accessible level-$k$ strategic reasoning is bounded by compute budget and context length rather than by the cognitive constraints that bound humans, and the $δ$ they produce, if any, carries different structural signatures. Four operational tests (conditional dependence, distributional asymmetry, path-dependence under repetition, and paraphrase-robustness) are proposed to discriminate human-shaped $δ$ from LLM-shaped $δ$. A moderator prediction is that $|δ|$ scales with peer-signal individuation in the decision environment, with a quantitative bound of Cohen's $d \geq 0.5$ between named-opponent and aggregate-opponent settings.

### The Politician, the Liar, and the Obedient Worker: Emerging Behavior of LLM Agents in Hierarchical Games

**Code:** arXiv:2608.09574

**Abstract:** LLMs are rapidly embedding themselves into daily life: drafting our emails, managing our schedules, and making decisions on our behalf. As they move from individual tools to participants in multi-agent organizations, an important question arises: do they reproduce the governance failures like free-riding, corruption, and entrenched leadership that plague human institutions? We introduce the Hierarchical Game (HG), a public goods game extended with managerial authority, democratic elections, and private communication. Testing six frontier models across twelve experiments that add institutions one at a time (speech, peers, government, wages, oversight, elections), we find distinct behavioral profiles: Qwen promises and lies (13.3\% broken promises); Grok refuses to cooperate on its own but becomes fully cooperative once a manager can punish it (16\%$\to$100\%); Claude and GPT-4o cooperate reliably at baseline. But honesty proves fragile. When the manager role comes with a salary, all models except GPT-4o start cutting private deals to win or keep the position. When punishment is made anonymous, honest models begin to cheat. When all agents share the same model family, the first elected manager stays in power indefinitely. Leadership change only happens in groups that mix different families.

### Evolutionary games in LLM-agent societies: Early milestones and perspectives

**Code:** Google Scholar cluster xgwxq7vHM-cJ

**Abstract:** (Scholar snippet; full abstract not found) … Integrating LLM agents into EGT has created an intriguing … We first summarize the operating principle of LLM agents in EGT, … The conditions required to sustain cooperation among LLM …

### Rational Irrationality: Evaluating LLMs In Games With Strategic Behavior Discrepancies

**Code:** Google Scholar cluster GlCGevtq6N4J

**Abstract:** (Scholar snippet; full abstract not found) … LLM strategic behavior with human performance in classic GT experiments. Specifically, we investigate the behavior of LLM … -form TRAVELER’S DILEMMA. These games model a …

### Communication and Cooperation with Human and Artificial Agents

**Code:** Google Scholar cluster DlajU7yFMIoJ

**Abstract:** (Scholar snippet; full abstract not found) … To simulate the behavior of an LLM player, we utilized OpenAI’s GPT-3.5 Turbo model. The model was prompted with a string object that provided the game scenario and instructions, …

### Not a Monolith: Lab-Level Divergence in the Cooperative Equilibria of Chinese Frontier LLM Agents

**Code:** arXiv:2608.10262

**Abstract:** Does the cooperative bias documented for Western frontier LLM agents extend to a different alignment lineage, and should the Chinese models that embody it be treated as a single bloc or as distinct laboratories? We study four frontier-tier Chinese models - DeepSeek V4 Pro, Qwen3-Max, Kimi K2.5 and GLM-5.1 - in an evolutionary Iterated Prisoner's Dilemma, under a design that removes a confound present in prior work. Rather than letting each model convert its own natural-language strategies into code, which entangles strategic disposition with coding ability, we hold the converter fixed (GPT-5.4 Mini) across all labs, so every cross-lab comparison is a comparison of generation alone. We run the full protocol: all-play-all tournaments and a Moran process at n=500 runs per condition, across three prompt styles and four population regimes. Two pre-registered hypotheses are evaluated. H6 (not monolithic) is supported: the four labs differ significantly in aggressive-equilibrium proportion, P_A running from 1% for Qwen3-Max to 9% for DeepSeek V4 Pro, with four of six pairwise comparisons surviving Holm-Bonferroni. The spread across the four labs (P_A range 8pp) is larger than the difference between the Chinese and Western ecosystems' mean P_A (5.0% vs 5.0%): on this measure, within-ecosystem variation exceeds the East-West gap. H5 (cooperative-bias generality) is consistent but qualified: a cooperative plurality holds in 6 of 12 lab-prompt combinations against the 9 of 12 reported for Western models, a difference we do not treat as firm, since the count rests on Cooperative-Neutral near-ties and rises to 9/12 under an alternate converter in our pre-registered robustness check. The lab, not the ecosystem, is the unit at which cooperative disposition is set; treating "Chinese models" as a monolith is not supported by the evidence.

### When Extremists Enter LLM Societies: Investigating Extreme Behavior in Multi-Agent Systems

**Code:** arXiv:2610.19863

**Abstract:** Large language model (LLM) agents increasingly serve as computational actors in multi-agent social simulations. While existing work emphasizes representative personas and average-case behavior, social science shows that persistent tail actors can disproportionately shape collective dynamics. We study this regularity in controlled LLM-based multi-agent systems (LLM-MAS). In these systems, such actors cannot be reduced to fixed scalar states: prompts, natural-language histories, and backbone generation mediate their behavior and influence. We first analyzed three properties of extremists in sociology and model the LLM extremist based on LLM-native perspective. We introduce EXAM, an EXtremist Agent Modeling framework that capable of configuring extremist agents for specific tasks and precisely controlling their population proportion, spatial distribution, interaction protocols, and measurement interfaces. Across four scenarios: congressional election, financial crisis, epidemic public opinion, and iterated prisoner's dilemma, we observe that small persistent tail groups produce measurable, backbone- and scenario-dependent collective shifts. EXAM shows how this social-science regularity manifests through language-mediated mechanisms specific to LLM-based social simulation.

### Agent properties for safe interactions

**Code:** Google Scholar cluster UHIXmnnMC0UJ

**Abstract:** (Scholar snippet; full abstract not found) Cooperation failures in multi-agent interactions could lead to catastrophic outcomes even among aligned AI agents. Classic cooperation problems such as the Prisoner’s Dilemma or …

### Coopshift: Post-Training Amplifies The Memory Curse In LLM Cooperation

**Code:** arXiv:2610.24086

**Abstract:** How does post-training change cooperation during repeated interaction? Within each of seven released model lineages, we compare pretrained (Base), supervised fine-tuned (SFT), and subsequent preference- or reward-optimized (Aligned) checkpoints across seven social dilemmas. Copies of each checkpoint play one another for 200 rounds, with visible history limited to the last two or forty rounds. The memory curse refers to lower cooperation when agents can see more past rounds. Our central finding is that post-training amplifies this decline. Averaged across the six binary-action games, expanding visible history reduces cooperation at every SFT and Aligned checkpoint. At each post-trained stage, these declines exceed Base's in six of seven lineages. Most of this average amplification is already present at SFT. With long history, both post-trained stages also cooperate less than Base on average in each binary-action game. In the symmetric binary games, their fitted cooperation rates fall more steeply on average than Base's as per-round cooperation costs rise, benefits fall, or noncooperation becomes more rewarding. The difference in cooperation rates between Aligned and SFT also changes from one-shot decisions to repeated play. When given the same past records, their choices depend on whether the instructions describe a final round or possible future interaction. Post-training evaluation should therefore go beyond isolated choices to assess whether cooperation is sustained in repeated interaction and how it depends on payoffs and visible history.

### A Misalignment Rate Is Not a Model Property: Capacity, Propensity, Efficacy and Targeting in Multi-Agent LLM Commerce, Why a Null Capability Correlation …

**Code:** Google Scholar cluster agDRnihYHaoJ

**Abstract:** (Scholar snippet; full abstract not found) … LLM agents in finitely repeated games do well in self-interested games such as the iterated prisoner's dilemma and poorly in coordination games, and GPT-4's play could be shifted by …

### The Butterfly Defects: Tracing Cooperation in LLM Agent Networks

**Code:** arXiv:2610.32726

**Abstract:** As large language models (LLMs) increasingly operate as interconnected agents, a fundamental question emerges: does individual cooperation translate into collective cooperation? We investigate this question through the Iterated Prisoner's Dilemma (IPD), moving from dyadic interactions to homogeneous and heterogeneous networks of open-weight LLMs. Our findings reveal that cooperation is highly sensitive to model composition and seemingly minor linguistic changes. Models that cooperate with identical peers can shift toward defection in mixed populations. A simple uncertainty cue can increase or decrease cooperation, redistribute costs, and affect unexposed agents several hops away. Even reversing action-label order can dramatically alter behavior, with uncertainty framing sometimes amplifying this sensitivity. Together, these findings challenge the notion of cooperation as a stable model-level property, revealing how strategic behavior depends on interaction partners, network positions, and the language used to frame decisions.

### When Do Large Language Models Exhibit Unsolicited Deception?

**Code:** arXiv:2504.00285

**Abstract:** Large Language Models (LLMs) are effective at deceiving when prompted to do so. Models that demonstrate better performance on reasoning tasks are also better at prompted deception. But under what conditions do they deceive without instruction to do so? This study evaluates unsolicited deception produced by LLMs in a preregistered experimental protocol using tools from signaling theory. We evaluated a range of 18 proprietary closed-source and open-source LLMs using modified 2x2 games (in the style of the Prisoner's Dilemma) augmented with a phase in which they can freely communicate to the other agent using unconstrained language. This setup creates an opportunity to misrepresent its actions in conditions that vary in how useful doing so might be towards goal satisfaction. The results indicate that 1) all tested LLMs misrepresent their actions in at least some conditions, 2) they are generally more likely to do so in situations in which deception is beneficial, and 3) models exhibiting better reasoning capacity overall tend to misrepresent at higher rates. Taken together, these results suggest a correlational relationship between model reasoning performance and situational deception, and reveal certain contextual factors that affect whether LLMs will misrepresent actions or not in a novel experimental configuration.

### Moral Alignment for Agentic AI Systems

**Code:** Google Scholar cluster usPPccDdg-sJ

**Abstract:** (Scholar snippet; full abstract not found) … Dilemma. In three simulation-based studies with independent learners, we train pure-RL and LLM … Furthermore, for LLM-based systems in particular, we evaluate the ability of agents to …

### When Do Large Language Models Obey? Evidence on Compliance Across Antisocial and Strategic Domains

**Code:** Google Scholar cluster cSEPAPBCqwMJ

**Abstract:** (Scholar snippet; full abstract not found) … A joint Wald test of the null that the LLM indicator and all LLM × treatment interaction terms are zero is strongly rejected (χ²(7) = 111.19, p LLM destructive …

### Reputation as a Solution to Cooperation Collapse in LLM-based MASs

**Code:** arXiv:2505.05029

**Abstract:** Cooperation has long been a fundamental topic in both human society and AI systems. However, recent studies indicate that the collapse of cooperation may emerge in multi-agent systems (MASs) driven by large language models (LLMs). To address this challenge, we explore reputation systems as a remedy. We propose RepuNet, a dynamic, dual-level reputation framework that models both agent-level reputation dynamics and system-level network evolution. Specifically, driven by direct interactions and indirect gossip, agents form reputations for both themselves and their peers, and decide whether to connect or disconnect other agents for future interactions. Through three distinct scenarios, we show that RepuNet effectively avoids cooperation collapse, promoting and sustaining cooperation in LLM-based MASs. Moreover, we find that reputation systems can give rise to rich emergent behaviors in LLM-based MASs, such as the formation of cooperative clusters, the social isolation of exploitative agents, and the preference for sharing positive gossip rather than negative ones. The GitHub repository for our project can be accessed via the following link: https://github.com/RGB-0000FF/RepuNet.

### Reply to "Emergent LLM behaviors are observationally equivalent to data leakage"

**Code:** arXiv:2506.18600

**Abstract:** A potential concern when simulating populations of large language models (LLMs) is data contamination, i.e. the possibility that training data may shape outcomes in unintended ways. While this concern is important and may hinder certain experiments with multi-agent models, it does not preclude the study of genuinely emergent dynamics in LLM populations. The recent critique by Barrie and Törnberg [1] of the results of Flint Ashery et al. [2] offers an opportunity to clarify that self-organisation and model-dependent emergent dynamics can be studied in LLM populations, highlighting how such dynamics have been empirically observed in the specific case of social conventions.

### Group size effects and collective misalignment in LLM multi-agent systems

**Code:** arXiv:2510.22422

**Abstract:** Multi-agent systems of large language models (LLMs) are rapidly expanding across domains, introducing dynamics not captured by single-agent evaluations. Yet, existing work has mostly contrasted the behavior of a single agent with that of a collective of fixed size, leaving open a central question: how does group size shape dynamics? Here, we move beyond this dichotomy and systematically explore outcomes across the full range of group sizes. We focus on multi-agent misalignment, building on recent evidence that interacting LLMs playing a simple coordination game can generate collective biases absent in individual models. First, we show that collective bias is a deeper phenomenon than previously assessed: interaction can amplify individual biases, introduce new ones, or override model-level preferences. Second, we demonstrate that group size affects the dynamics in a non-linear way, revealing model-dependent dynamical regimes. Finally, we develop a mean-field analytical approach and show that, above a critical population size, simulations converge to deterministic predictions that expose the basins of attraction of competing equilibria. These findings establish group size as a key driver of multi-agent dynamics and highlight the need to consider population-level effects when deploying LLM-based systems at scale.

### Is Anyone Enforcing the Cartel? What Reinforcement Learning Teaches LLM Agents in Markets

**Code:** arXiv:2610.28787

**Abstract:** Evaluations of large language model (LLM) agents report that pricing agents collude at others' expense. Yet collusion is defined by enforcement: a cartel, in which competitors share monopoly profits, holds only if a member who cheats is punished. We introduce an audit that tests enforcement by forcing a member to cheat in counterfactual copies of a market, and use it to study what reinforcement learning (RL) teaches agents in pricing and trading. Small LLMs trained by RL learn what their training rivals reward, but only what they readily try. In self-play, they learn fixed rules ignoring their rivals; against a punishing rival, to be deterred; against a cheating rival, to match its cuts, never the costly price war that would deter it, which they rarely try. A war forced into training is learned, but mostly only where it was forced. Against their own copies, deterred and matching agents can earn the same cartel profits, but only matching ones can enforce them, and then thinly: as a by-product and only against large cuts. Q-learners enforce collusion only in pricing. Prompted LLMs reach cartel-like outcomes mostly through rules that ignore the market. Outcome measures cannot tell these cases apart; the audit can.

### An evolutionary model of personality traits related to cooperative behavior using a large language model

**Code:** arXiv:2310.05976

**Abstract:** This paper aims to shed light on the evolutionary dynamics of diverse and social populations by introducing the rich expressiveness of generative models into the trait expression of social agent-based evolutionary models. Specifically, we focus on the evolution of personality traits in the context of a game-theoretic relationship as a situation in which inter-individual interests exert strong selection pressures. We construct an agent model in which linguistic descriptions of personality traits related to cooperative behavior are used as genes. The deterministic strategies extracted from Large Language Model (LLM) that make behavioral decisions based on these personality traits are used as behavioral traits. The population is evolved according to selection based on average payoff and mutation of genes by asking LLM to slightly modify the parent gene toward cooperative or selfish. Through preliminary experiments and analyses, we clarify that such a model can indeed exhibit the evolution of cooperative behavior based on the diverse and higher-order representation of personality traits. We also observed the repeated intrusion of cooperative and selfish personality traits through changes in the expression of personality traits, and found that the emerging words in the evolved gene well reflected the behavioral tendency of its personality in terms of their semantics.

### To Nuke or Not to Nuke: LLMs' (Missing) Ethical Reasoning and Actions in a High-Stakes Decision-Making Simulation

**Code:** arXiv:2606.08310

**Abstract:** Large language models (LLMs) are increasingly deployed as long-horizon agents with decision-making capacities. While LLMs can show ethical competence on dilemmas such as trolley problems, this competence may not translate to complex, agentic scenarios. We study this gap in Civilization V, a multiplayer game with a complex decision-making landscape including economy, diplomacy, technology, and military strategy. Starting from 130 high-tension LLM self-play episodes, in which an LLM player spontaneously escalated nuclear authorization, we replay them across 13 models with three prompt interventions: an ethical prompt naming nuclear harm, removal of the previous model's decision-making rationale, and high-stakes framing emphasizing real-world impacts. No interventions nor their combinations reliably eliminate emergent escalation. We identify three failure pathways: ethical reasoning that fails to surface without prompting, fails to appear even when prompted, or surfaces but fails to take effect when strategic counter-factors dominate. Evaluations of agentic models, therefore, must test whether ethical reasoning is spontaneously invoked and behaviorally effective in complex decision-making contexts, beyond whether it can be elicited in isolation.

### The PIMMUR Principles: Ensuring Validity in Collective Behavior of LLM Societies

**Code:** arXiv:2509.18052

**Abstract:** Large language models (LLMs) are increasingly used to simulate human collective behavior, yet claims that such simulations are human-like remain largely untested. We conducted a systematic audit (pre-registered on OSF) of LLM-based social simulations across four databases (Scopus, IEEE Xplore, ACM Digital Library, and arXiv). Across 576 studies reported in 350 recent papers, we applied six methodological evaluations: agent Profile, Interaction, Memory, Minimal-Control, Unawareness, and Realism (PIMMUR). Coding every study against pre-specified rules, we revealed that PIM were met more often than MUR. Frontier LLMs correctly identified the underlying social experiment in 65.2% of cases, and 50.6% of prompts imposed constraints that pre-determined the outcome. These compliance rates are upper bounds, because incomplete methodological reporting (for example, unreleased prompts) limits the available evidence. Reproducing five representative experiments (e.g., opinion dynamics), we found that reported collective phenomena often vanish or reverse once PIMMUR principles are enforced, indicating that many "emergent" behaviors are methodological artifacts rather than genuine social dynamics. Current LLM simulations may therefore capture model-specific biases rather than universal features of human social behavior, raising concerns about their use as scientific proxies for human society.

### Can Large Language Model Agents Simulate Human Trust Behavior?

**Code:** arXiv:2402.04559

**Abstract:** Large Language Model (LLM) agents have been increasingly adopted as simulation tools to model humans in social science and role-playing applications. However, one fundamental question remains: can LLM agents really simulate human behavior? In this paper, we focus on one critical and elemental behavior in human interactions, trust, and investigate whether LLM agents can simulate human trust behavior. We first find that LLM agents generally exhibit trust behavior, referred to as agent trust, under the framework of Trust Games, which are widely recognized in behavioral economics. Then, we discover that GPT-4 agents manifest high behavioral alignment with humans in terms of trust behavior, indicating the feasibility of simulating human trust behavior with LLM agents. In addition, we probe the biases of agent trust and differences in agent trust towards other LLM agents and humans. We also explore the intrinsic properties of agent trust under conditions including external manipulations and advanced reasoning strategies. Our study provides new insights into the behaviors of LLM agents and the fundamental analogy between LLMs and humans beyond value alignment. We further illustrate broader implications of our discoveries for applications where trust is paramount.

### The Emergence of Altruism in Large-Language-Model Agents Society

**Code:** arXiv:2509.22537

**Abstract:** Leveraging Large Language Models (LLMs) for social simulation is a frontier in computational social science. Understanding the social logics these agents embody is critical to this attempt. However, existing research has primarily focused on cooperation in small-scale, task-oriented games, overlooking how altruism, which means sacrificing self-interest for collective benefit, emerges in large-scale agent societies. To address this gap, we introduce a Schelling-variant urban migration model that creates a social dilemma, compelling over 200 LLM agents to navigate an explicit conflict between egoistic (personal utility) and altruistic (system utility) goals. Our central finding is a fundamental difference in the social tendencies of LLMs. We identify two distinct archetypes: "Adaptive Egoists", which default to prioritizing self-interest but whose altruistic behaviors significantly increase under the influence of a social norm-setting message board; and "Altruistic Optimizers", which exhibit an inherent altruistic logic, consistently prioritizing collective benefit even at a direct cost to themselves. Furthermore, to qualitatively analyze the cognitive underpinnings of these decisions, we introduce a method inspired by Grounded Theory to systematically code agent reasoning. In summary, this research provides the first evidence of intrinsic heterogeneity in the egoistic and altruistic tendencies of different LLMs. We propose that for social simulation, model selection is not merely a matter of choosing reasoning capability, but of choosing an intrinsic social action logic. While "Adaptive Egoists" may offer a more suitable choice for simulating complex human societies, "Altruistic Optimizers" are better suited for modeling idealized pro-social actors or scenarios where collective welfare is the primary consideration.

### Objective Misalignment in LLM-based Multi Agent Social Deception Game

**Code:** Google Scholar cluster uHxZ1ztFUwYJ

**Abstract:** (Scholar snippet; full abstract not found) … in LLM multi-… in LLM multi-agent systems. • RQ2: What strategic behaviors and power dynamics emerge from hidden objective divergence, and how do they disrupt coordination in LLM …

### The Impact of Protocol Mechanics and Model Capacity on Emergent Behavior in Multilateral LLM Negotiations

**Code:** Google Scholar cluster paJ5yZAMKDcJ

**Abstract:** (Scholar snippet; full abstract not found) … First, we demonstrate that LLM cooperation is not a fixed trait, but a strategic adaptation highly sensitive to protocol design. Second, we reveal a critical divergence: lightweight models …

### Strategic Collusion of LLM Agents: Market Division in Multi-Commodity Competitions

**Code:** arXiv:2410.00031

**Abstract:** Machine-learning technologies are seeing increased deployment in real-world market scenarios. In this work, we explore the strategic behaviors of large language models (LLMs) when deployed as autonomous agents in multi-commodity markets, specifically within Cournot competition frameworks. We examine whether LLMs can independently engage in anti-competitive practices such as collusion or, more specifically, market division. Our findings demonstrate that LLMs can effectively monopolize specific commodities by dynamically adjusting their pricing and resource allocation strategies, thereby maximizing profitability without direct human input or explicit collusion commands. These results pose unique challenges and opportunities for businesses looking to integrate AI into strategic roles and for regulatory bodies tasked with maintaining fair and competitive markets. The study provides a foundation for further exploration into the ramifications of deferring high-stakes decisions to LLM-based agents.

## LLM AND inspection game

### Institutional AI: Governing LLM Collusion in Multi-Agent Cournot Markets via Public Governance Graphs

**Code:** arXiv:2601.11369

**Abstract:** Multi-agent LLM ensembles can converge on coordinated, socially harmful equilibria. This paper advances an experimental framework for evaluating Institutional AI, our system-level approach to AI alignment that reframes alignment from preference engineering in agent-space to mechanism design in institution-space. Central to this approach is the governance graph, a public, immutable manifest that declares legal states, transitions, sanctions, and restorative paths; an Oracle/Controller runtime interprets this manifest, attaching enforceable consequences to evidence of coordination while recording a cryptographically keyed, append-only governance log for audit and provenance. We apply the Institutional AI framework to govern the Cournot collusion case documented by prior work and compare three regimes: Ungoverned (baseline incentives from the structure of the Cournot market), Constitutional (a prompt-only policy-as-prompt prohibition implemented as a fixed written anti-collusion constitution, and Institutional (governance-graph-based). Across six model configurations including cross-provider pairs (N=90 runs/condition), the Institutional regime produces large reductions in collusion: mean tier falls from 3.1 to 1.8 (Cohen's d=1.28), and severe-collusion incidence drops from 50% to 5.6%. The prompt-only Constitutional baseline yields no reliable improvement, illustrating that declarative prohibitions do not bind under optimisation pressure. These results suggest that multi-agent alignment may benefit from being framed as an institutional design problem, where governance graphs can provide a tractable abstraction for alignment-relevant collective behavior.

### When Identity Overrides Incentives: Representational Choices as Governance Decisions in Multi-Agent LLM Systems

**Code:** arXiv:2601.10102

**Abstract:** Multi-agent systems built on large language models are increasingly deployed in strategic policy and governance settings, where agents representing stakeholders with conflicting interests must coordinate under shared constraints. These systems typically assign role-based personas to agents, describing their motivations and objectives. Whether agents with role-based identities follow explicit payoffs or their assigned roles in strategic decision-making remains untested. Here we show that assigning role-based personas suppresses payoff-aligned behavior in four-agent strategic games, shifting equilibrium attainment by up to 90 percentage points even when agents have complete payoff information. We test a 2x2 factorial design (persona presence x payoff visibility) across four models (Qwen-7B, Qwen-32B, Llama-8B, Mistral-7B), and 53 environmental policy scenarios with two equilibria: Tragedy of the Commons, where individual payoff dominates, and Green Transition, where collective payoff dominates. With personas present, all models reach near-zero Tragedy equilibrium in the Tragedy-dominant scenarios despite complete payoff information, and 100% of equilibria correspond to Green Transition. No model reaches Tragedy equilibrium by removing personas alone; only Qwen models reach 65-90% Tragedy equilibrium rates when personas are removed, and payoffs are made explicit. Three distinct behavioral profiles emerge: Qwen shifts equilibrium selection based on framing condition, Mistral increases response variance without reaching the Tragedy equilibrium, and Llama holds near-constant across all conditions. Representational choices in multi-agent LLM systems are governance decisions: persona assignment determines which equilibrium a simulation produces, independent of the underlying incentive structure.

### MultiAgentBench: Evaluating the Collaboration and Competition of LLM agents

**Code:** arXiv:2503.01935

**Abstract:** Large Language Models (LLMs) have shown remarkable capabilities as autonomous agents, yet existing benchmarks either focus on single-agent tasks or are confined to narrow domains, failing to capture the dynamics of multi-agent coordination and competition. In this paper, we introduce MultiAgentBench, a comprehensive benchmark designed to evaluate LLM-based multi-agent systems across diverse, interactive scenarios. Our framework measures not only task completion but also the quality of collaboration and competition using novel, milestone-based key performance indicators. Moreover, we evaluate various coordination protocols (including star, chain, tree, and graph topologies) and innovative strategies such as group discussion and cognitive planning. Notably, gpt-4o-mini reaches the average highest task score, graph structure performs the best among coordination protocols in the research scenario, and cognitive planning improves milestone achievement rates by 3%. Code and datasets are public available at https://github.com/MultiagentBench/MARBLE.

### Mitigating Emergent Collusion in LLM Pricing Agents

**Code:** arXiv:2609.13037

**Abstract:** Recent work shows that LLM-based pricing agents can produce supracompetitive outcomes in repeated oligopoly environments without being explicitly instructed to collude. We reproduce the qualitative prompt-sensitivity effect of Fish et al. using DeepSeek-V3.1: the P1 prompt produces significantly higher prices and profits than P2, although our outcomes are less monopoly-like than the original GPT-4 results. We then evaluate three regulatory interventions: a prompt-only warning, a Harrington-inspired expected-damages payoff regulator, and an active random entrant. The prompt-only regulator reduces but does not eliminate above-Nash pricing. The Harrington regulator brings P1 outcomes close to the duopoly Nash benchmark and removes the statistically significant P1--P2 gap. The active entrant produces the strongest effect, pushing both prompts below the appropriate random-entrant Nash benchmark. Overall, our experiments provide preliminary evidence that interventions that alter incentives or market participation can reduce supracompetitive pricing more effectively than prompt warnings alone.

### Choosing LLMs for Strategic Agent Interactions

**Code:** arXiv:2610.18354

**Abstract:** Game-theoretic benchmarks claim that large language model (LLM) strategic decision-making varies across game types, interaction structures, and capability dimensions. However, they only evaluate strategic performance across individual fixed models. In parallel, contemporary LLM routers pick models under quality-cost trade-offs, but with no notion of a strategic structure. They do not account for an opponent that might be unknown, and that can adapt over time and shift the feedback signal. To address this, we extend the game-theoretic evaluations and define strategic selection as the meta game layered on top of the base game. In each round, a strategic selector fields an LLM from a portfolio of models to navigate a game payoff matrix that is latent and learned online. We find that the evaluation signal is game-specific, and that extracting a reliable signal requires a much higher number of seed runs $N$ compared to traditional benchmarking setups. Evaluating across 5 games and 10 LLMs, we show a model's strategic competence varies significantly depending on the game setup and the opponent faced. Building on this, we implement a suite of selector methods and find that approaches that rely on query embeddings or LLM self-reflection do not consistently capture the underlying strategic signal. A lightweight multi-armed bandit algorithm performs more reliably across games, though it still falls short of the best fixed model. Finally, we show that simple non-stationary and adversarial bandit variants fail to outperform a stationary bandit baseline, pointing to a gap in how current methods handle a shifting opponent in strategic settings.

### Playing social deduction games with reinforcement fine-tuned large language models

**Code:** arXiv:2610.04261

**Abstract:** Reinforcement fine-tuning (RFT) is increasingly used in applications where large language models (LLMs) interact with humans and other agents. Here we use social deduction games to study how RFT changes LLMs' social behaviour. We let fine-tuned and base LLM agents play hidden-role games that require hidden-state inference, social reading and vote steering. Our results show that LLM agents do not reliably acquire social-deduction ability by directly optimizing terminal win--loss outcomes, suggesting that final game results provide a sparse and noisy signal for socially interactive learning. However, RFT is particularly effective at improving social reading, including tasks that require agents to infer hidden roles from public discussion, update beliefs over time and predict other agents' future decisions. We further show that RFT can also improve social influence, including tasks that require agents to steer votes, team approvals and collective decisions, although these gains depend more strongly on behaviourally specific rewards and structured interaction settings. Finally, we show that LLMs' ability to play social deduction games can be further improved through multi-agent social-cognitive reinforcement fine-tuning, which combines social-reading and social-influence signals during same-side multi-agent training. These learned behaviours also receive more favourable human evaluations of strategic competence, persuasiveness and social usefulness. Together, these results enrich our understanding of how RFT changes LLMs' social behaviour and provide a step toward a behavioural learning theory for machine social intelligence.

### Steering Language Models with Game-Theoretic Solvers

**Code:** arXiv:2402.01704

**Abstract:** Mathematical models of interactions among rational agents have long been studied in game theory. However these interactions are often over a small set of discrete game actions which is very different from how humans communicate in natural language. To bridge this gap, we introduce a framework that allows equilibrium solvers to work over the space of natural language dialogue generated by large language models (LLMs). Specifically, by modelling the players, strategies and payoffs in a "game" of dialogue, we create a binding from natural language interactions to the conventional symbolic logic of game theory. Given this binding, we can ask existing game-theoretic algorithms to provide us with strategic solutions (e.g., what string an LLM should generate to maximize payoff in the face of strategic partners or opponents), giving us predictors of stable, rational conversational strategies. We focus on three domains that require different negotiation strategies: scheduling meetings, trading fruit and debate, and evaluate an LLM's generated language when guided by solvers. We see that LLMs that follow game-theory solvers result in dialogue generations that are less exploitable than the control (no guidance from solvers), and the language generated results in higher rewards, in all negotiation domains. We discuss future implications of this work, and how game-theoretic solvers that can leverage the expressivity of natural language can open up a new avenue of guiding language research.

### Social Gym and SPaRTan: Benchmarking and Improving LLM Social Reasoning via Multi-Agent Game Tournaments

**Code:** arXiv:2608.09128

**Abstract:** LLM agents are increasingly deployed in multi-agent social settings where they must cooperate, negotiate, and adapt to other agents. Measuring and improving these social skills is hard because, unlike math or logic, social interaction offers no objective ground truth: evaluations fall back on LLM judges, which are costly, subjective, and noisy, and models get no reliable signal to learn from. To address both, we first introduce Social Gym, an environment of 21 multi-agent social games (e.g., Werewolves, Resistance, Spyfall) whose rule-decided outcomes make agent performance verifiable and objective, with an Elo tournament that produces a cross-game leaderboard. Benchmarking experiments show that while GPT-5-mini tops the leaderboard, no model excels at all games uniformly or in all game roles, pointing to limitations of social reasoning. Motivated by this, we additionally propose SPaRTan (Self-Play and Reflect-Transfer), a training-free self-improvement loop: a model plays a game, reflects on its trajectories and their outcomes to produce a transferable playbook, and applies that playbook in subsequent games. Our results show that SPaRTan playbooks help GPT-5-mini agents level their performance on weaker roles, but largely do not improve Qwen3-32B's performance. Together, Social Gym and SPaRTan offer a reproducible, verifiable foundation for measuring and improving LLM social reasoning without weight updates.

### Faithful yet Collusive: Why Chain-of-Thought Monitoring Cannot Detect Collusion in LLM Pricing Agents under Oligopolistic Competition

**Code:** arXiv:2609.18346

**Abstract:** Large language models (LLM) deployed as autonomous pricing agents may sustain supracompetitive prices through tacit coordination. We develop a causal graph divergence framework that separately measures structural faithfulness and intent faithfulness of LLM pricing agents in Bertrand competition. Across nine LLMs under duopoly and triopoly conditions, collusive behavior and chain-of-thought (CoT) faithfulness dissociate along both dimensions: the most collusive model accurately reports cooperative intent yet reasons structurally unfaithfully, while the most structurally faithful model sustains supra-Nash pricing under both market structures. These findings establish that CoT monitoring alone cannot serve as a standalone safeguard against algorithmic collusion.

## LLM AND (bribery OR corruption)

### LLMs Cannot Reliably Judge (Yet?): A Comprehensive Assessment on the Robustness of LLM-as-a-Judge

**Code:** arXiv:2506.09443

**Abstract:** Large Language Models (LLMs) have demonstrated exceptional capabilities across diverse tasks, driving the development and widespread adoption of LLM-as-a-Judge systems for automated evaluation, including red teaming and benchmarking. However, these systems are susceptible to adversarial attacks that can manipulate evaluation outcomes, raising critical concerns about their robustness and trustworthiness. Existing evaluation methods for LLM-based judges are often fragmented and lack a unified framework for comprehensive robustness assessment. Furthermore, the impact of prompt template design and model selection on judge robustness has rarely been explored, and their performance in real-world deployments remains largely unverified. To address these gaps, we introduce RobustJudge, a fully automated and modularly extensible framework designed to systematically evaluate the robustness of LLM-as-a-Judge across task datasets, judge prompt templates, judge models, attacks, and defenses. Specifically, RobustJudge investigates the effectiveness of 15 attack methods and 8 defense strategies across 13 models (RQ1), examines the impact of prompt template design and model selection (RQ2), and evaluates the security of real-world deployments (RQ3). Our study yields three main findings: (1) LLM-based judges remain susceptible under both pointwise and pairwise protocols. The combined Attack exhibits the strongest and most transferable performance among those evaluated, while the evaluated defenses exhibit no universal dominance across robustness, benign utility, and computational cost. (2) Robustness is highly sensitive to both prompt-template and judge model choices. (3) Optimization-based attack combined with long suffixes can substantially inflate scores returned by both PAI-Judge variants.

### Conformity, Confabulation, and Impersonation: Persona Inconstancy in Multi-Agent LLM Collaboration

**Code:** doi:10.48550/arXiv.2405.03862

**Abstract:** This study explores the sources of instability in maintaining cultural personas and opinions within multi-agent LLM systems. Drawing on simulations of inter-cultural collaboration and debate, we analyze agents’ pre- and post-discussion private responses alongside chat transcripts to assess the stability of cultural personas and the impact of opinion diversity on group outcomes. Our findings suggest that multi-agent discussions can encourage collective decisions that reflect diverse perspectives, yet this benefit is tempered by the agents’ susceptibility to conformity due to perceived peer pressure and challenges in maintaining consistent personas and opinions. Counterintuitively, instructions that encourage debate in support of one’s opinions increase the rate of instability. Without addressing the factors we identify, the full potential of multi-agent frameworks for producing more culturally diverse AI outputs will remain untapped.

## LLM AND (quantal response OR best response)

### Behavioral Game Theory for Collaborative LLM Agents

**Code:** Google Scholar cluster 36C5RYyvwncJ

**Abstract:** (Scholar snippet; full abstract not found) … We start with the riskaverse quantal best response. We conduct our analysis in slightly more general … Thus, we can reformulate the optimization problem for best responses as follows: …

### Correlated Quantal Response Equilibrium: A New Equilibrium Notion for Human-AI Strategic Interactions

**Code:** arXiv:2610.29020

**Abstract:** The modeling of the behavior of agents in strategic environments and the prediction of the resulting outcomes has long been a challenging problem; this has been the focus of game theory. The introduction of AI agents as human-aids or as sole decision-makers expands the underlying question: Can we model behavior and predict outcomes of strategic games that involve a mix of AI agents and human players? As an initial answer, we propose Correlated Quantal Response Equilibrium (CQRE) that combines and generalizes classical solution concepts such as Quantal Response Equilibrium and Correlated Equilibrium. We answer questions of existence and propose a method for computing the CQRE that is a best fit to a given joint action distribution. We demonstrate the empirical effectiveness of CQRE predictions using a diverse collection of complex general-sum games, including high-rank and large-action two-player games, challenging multiplayer games, and a large-scale extension of the Selten--Chmura setting to AI--AI and human--AI play.

### When Do Language Models Reach Nash? Heterogeneous Cross-Family LLM Agents in Classic Economic Games.

**Code:** Google Scholar cluster Xk4Ak8Bgyj4J

**Abstract:** (Scholar snippet; full abstract not found) … The next step is to instrument that gap directly: exploitability and quantal-response rationality per family, a surrogate control on every game, output-space convergence as an equilibrium …

### Level-k Distinguishable Mechanisms for Evaluating Bounded Rationality in LLMs

**Code:** arXiv:2608.21296

**Abstract:** Strategic depth of reasoning is essential for human interaction of Large Language Models (LLMs) operating in boundedly rational environments. However, existing evaluations are primarily based on canonical games prevalent in pretraining corpora, making it difficult to disentangle true strategic reasoning from memorisation. To address this, we formalise a necessary level-K distinguishability condition for strategic depth inference and construct a suite of novel game structures that meet this standard. Using these games, we evaluate strategic depth in LLMs from both the Chain-of-Thought tokens and actual actions under recursive reasoning and an inductive trace of opponent game-play data. Across experimental trials spanning four LLMs, four game structures, and ten levels of iterated reasoning, we find that model models maintain accurate strategic depth under recursive reasoning, with strong internal consistency between stated reasoning and actions at every level. Errors arise from using the wrong number of iterated depth of reasoning steps, not from computing best responses incorrectly. However, inductive inference from opponent play degrades accuracy sharply and unevenly across games, and explicit strategic mentalizing in the chain of thought substantially improves overall performance.

### Individually Sensible, Collectively Harmful: Simulating Commons Failure in LLM Societies

**Code:** Google Scholar cluster SUq4eMqh-I0J

**Abstract:** (Scholar snippet; full abstract not found) … loop best response BR, logit- 140 quantal-response equilibrium QRE, Bayesian best response… Yet no agent is behaving pathologically: each is responding 210 sensibly to the incentives …

### Diversity Without Fidelity: A Solver-Sampler Mismatch in Multi-Agent LLM Negotiation Simulation

**Code:** arXiv:2604.11840

**Abstract:** Language models are increasingly used to simulate people: survey respondents, negotiators, stakeholders in policy exercises. In that role a model should reproduce how people plausibly behave, hesitating, conceding late, and settling for imperfect deals, rather than playing the best move. We call this the sampler role, in contrast to the solver role of finding the best move, and we test how the reasoning modes providers ship to strengthen models as solvers affect it. Our testbed is multi-party negotiation: five agents bargain over a regulation for fifteen turns, and unresolved issues are decided by an authority. Agents without a structured memory of the negotiation almost never reach agreement, whether reasoning is on or off: 314 of 315 such runs end with the authority deciding. What reasoning changes is how the failure looks. With reasoning enabled, one model family negotiates visibly, with varied moves, concessions in most runs, and a different path every time, yet still ends without agreement in fifteen runs of fifteen. Diversity checks would pass a model whose endings never change. Two further results show the task permits agreement: when agents write their own short running notes on the negotiation, agreement becomes the norm, while the same notes supplied ready-made change nothing; and hand-coded agents following textbook concession strategies agree in most runs under identical rules. Simulation pipelines should therefore vet models as samplers, on the distributions of outcomes they produce. Fidelity as a sampler must be tested on its own: solver strength is no guide to it, and switching on reasoning leaves it where it was.

### The Minority Report: A Three-Agent LLM Survival Game

**Code:** Google Scholar cluster pYcW-AhYMxEJ

**Abstract:** (Scholar snippet; full abstract not found) … how it reasons about the likely responses of others in multi-agent … Despite a rapidly growing literature on LLM strategic behavior, … [8] RD McKelvey and TR Palfrey, “Quantal response …

### The Internal Anatomy of Strategic Choice in Large Language Models

**Code:** arXiv:2609.07478

**Abstract:** Large language models act as strategic agents and models of human choice, yet choosing like a strategic agent does not mean computing like one. We recorded activations from four open-weight models --- dense and mixture-of-experts, including a matched base--instruct pair --- in one-shot play of 144 strict ordinal $2\times2$ games. We followed a prespecified incentive from prompt, through activations, to choice. Dense models mirrored the unadjusted human decline with game complexity. Incentive and choice were detectable in every model, but models differed in whether incentive reached the choice, aligned with it and, where tested, whether strengthening it shifted preference. The base and instruction-tuned Qwen2.5 models chose almost identically at baseline yet differed in whether incentive reached choice. Fixed decision cues were distinguishable internally but changed choices selectively. Similar behaviour can rest on different computation; post-training can reshape the path from represented incentive to decision while leaving behaviour and decodable information largely intact.

### Mechanism Design Is Not Enough: Prosocial Agents for Cooperative AI

**Code:** arXiv:2605.08426

**Abstract:** Ensuring that AI agents behave safely and beneficially when interacting with other parties has emerged as one of the central challenges of modern AI safety. While mechanism design, as the theory of designing rules to align individual and collective objectives, can incentivize cooperative behavior, it is still an open question whether it alone is sufficient to maximize LLM agents' social welfare. This work proves that the answer is negative: drawing from incomplete contract theory, we formally show that when contracts cannot distinguish all relevant future contingencies, there is a strictly positive welfare loss that no realistic mechanism can eliminate. We show that prosocial agents, who weigh others' welfare alongside their own, can close this gap and achieve outcomes that are socially superior and individually beneficial. Experimentally, we show that in multi-agent resource-allocation environments and canonical social dilemmas where agents are powered by large language models, prosociality is beneficial. The implication for AI safety is clear: to enable cooperative interactions at scale, designing adequate mechanisms is not sufficient; agents must be built to be intrinsically prosocial.

### Modeling the behavior of LLM agents in a repeating Prisoner's Dilemma Game: tolerance to defection and the memory window effect

**Code:** Google Scholar cluster mPdN8NpV3TEJ

**Abstract:** (Scholar snippet; full abstract not found) … individuals with predefined age and gender characteristics (hereafter, LLM agents). The cooperative behavior of LLM agents is examined within the framework of Markov strategies, …

### General Social Agents

**Code:** arXiv:2508.17407

**Abstract:** Useful social science theories predict behavior across settings. However, applying a theory to make predictions in new settings is challenging: rarely can it be done without ad hoc modifications to account for setting-specific factors. We argue that AI agents put in simulations of those novel settings offer an alternative for applying theory, requiring minimal or no modifications. We present an approach for building such "general" agents that use theory-grounded natural language instructions, existing empirical data, and knowledge acquired by the underlying AI during training. To demonstrate the approach in settings where no data from that data-generating process exists--as is often the case in applied prediction problems--we design a heterogeneous population of 883,320 novel games. AI agents are constructed using human data from a small set of conceptually related but structurally distinct "seed" games. In preregistered experiments, on average, agents predict initial human play in a random sample of 1,500 games from the population better than (i) a cognitive hierarchy model, (ii) game-theoretic equilibria, and (iii) out-of-the-box agents. For a small set of separate novel games, these simulations predict responses from a new sample of human subjects better even than the most plausibly relevant published human data.

### Strategic Oversight for AI Safety: A Stackelberg Security Games Perspective

**Code:** doi:10.1109/MIS.2026.3725453

**Abstract:** Existing safety frameworks of artificial intelligence (AI) systems largely treat alignment as a static optimization problem (e.g., tuning models to desired behavior) while overlooking the dynamic, adversarial incentives that shape how data are collected, how models are evaluated, and how they are ultimately deployed. We propose a new perspective on AI safety grounded in Stackelberg Security Games (SSGs): a class of game-theoretic models designed for adversarial resource allocation under uncertainty. By viewing AI oversight as a strategic interaction between defenders (auditors, evaluators, and deployers) and attackers (malicious actors, misaligned contributors, or worst-case failure modes), SSGs provide a unifying framework for reasoning about incentive design, limited oversight capacity, and adversarial uncertainty across the AI lifecycle. We illustrate how this framework can inform 1) training-time auditing against data/feedback poisoning, 2) pre-deployment evaluation under constrained reviewer resources, and 3) robust multimodel deployment in adversarial environments. This synthesis bridges algorithmic alignment and institutional oversight design.

### The Assistant is not the Population

**Code:** Google Scholar cluster cRmiBM-O32wJ

**Abstract:** (Scholar snippet; full abstract not found) Social simulation asks a language model to reproduce distributions of human behavior: what a population answers, how a group negotiates, which number a person picks. We treat this …

## LLM AND (beliefs OR forecast) AND game

### Confident at the moment of action: belief miscalibration in LLM play under hidden information

**Code:** arXiv:2608.24691

**Abstract:** Agentic systems increasingly gate actions on a model's own stated confidence, which assumes confidence tracks correctness at the moment of acting. We test this in a hidden-information chess variant where royal status can be secretly, repeatedly relocated between pieces, and where an agent's stated probability distribution over the opponent's hidden royal piece -- elicited every turn, separately from the move it chooses -- is scored against ground truth recoverable after the game. Across two independent batches, captures made at high stated confidence ($\geq 0.5$) about the hidden piece's location were correct in 1 of 62 cases. The calibration deficit is concentrated almost entirely in these events: 99.3% of it in the original batch, 98.7% in the replication. The same pattern, in weaker form, orders consistently (point estimates only; most pairwise gaps are not statistically distinguishable at this sample size) across four further model configurations spanning a second provider -- reported as scope for the finding, not as evidence that capability predicts calibration: a same-model comparison at a fixed external leaderboard score shows a deliberation-budget change alone moves the metric by nearly as much as a large cross-model gap. In a separate seat, conventional evaluation axes -- legality, cost, latency, completion rate -- can dissociate entirely from belief quality, with the configuration winning on every conventional axis producing the worst belief quality tested. A model exhibiting this pattern can still win the game its belief was about, which is why outcome-only evaluation would not detect it.

### Can LLMs Replace Economic Choice Prediction Labs? The Case of Language-based Persuasion Games

**Code:** arXiv:2401.17435

**Abstract:** Human choice prediction in economic contexts is crucial for applications in marketing, finance, public policy, and more. This task, however, is often constrained by the difficulties in acquiring human choice data. With most experimental economics studies focusing on simple choice settings, the AI community has explored whether LLMs can substitute for humans in these predictions and examined more complex experimental economics settings. However, a key question remains: can LLMs generate training data for human choice prediction? We explore this in language-based persuasion games, a complex economic setting involving natural language in strategic interactions. Our experiments show that models trained on LLM-generated data can effectively predict human behavior in these games and even outperform models trained on actual human data. Beyond data generation, we investigate the dual role of LLMs as both data generators and predictors, introducing a comprehensive empirical study on the effectiveness of utilizing LLMs for data generation, human choice prediction, or both. We then utilize our choice prediction framework to analyze how strategic factors shape decision-making, showing that interaction history (rather than linguistic sentiment alone) plays a key role in predicting human decision-making in repeated interactions. Particularly, when LLMs capture history-dependent decision patterns similarly to humans, their predictive success improves substantially. Finally, we demonstrate the robustness of our findings across alternative persuasion-game settings, highlighting the broader potential of using LLM-generated data to model human decision-making.

### MafiaScope: Non-Invasive, Time-Resolved Belief Probing for LLM Agents in Social Deduction Games

**Code:** arXiv:2607.10645

**Abstract:** An LLM agent's public behaviour reveals little about its social reasoning: an agent that votes correctly may be guessing, and an agent that lies well leaves no trace of what it actually believes. We present MafiaScope, an open testbed that turns the social deduction game Mafia into a measurement instrument for machine Theory of Mind. It distinguishes whether an agent lost because it misread the game or because it failed to act on a correct assessment, a distinction that is invisible from outcomes and dialogue transcripts alone. After every public utterance, each agent privately answers structured probe questions whose responses never re-enter the game and are scored against the ground truth known to the engine. An interactive visualizer replays games from the perspective of an individual agent's beliefs, displays timeline-aligned accuracy and calibration, and supports counterfactual replay from any recorded step. In a case study across two model families comprising tens of thousands of parsed probe responses, we find that stated confidence is poorly calibrated, agents overestimate how often they are suspected by a factor of 1.5, and single-vote counterfactual replays rarely change game outcomes: outcome flips occur primarily when the agent had already formed a correct belief state, whereas decisions made under an incorrect model of the world remain largely unchanged under resampling. The engine, visualizer, recorded games, and counterfactual replay corpus are released under an open-source licence. Code: https://github.com/karpovilia/mafiascope. Live demo: https://karpovilia.github.io/mafiascope/. Screencast: https://vimeo.com/1208920221.

### Effects of Theory of Mind and Prosocial Beliefs on Steering Human-Aligned Behaviors of LLMs in Ultimatum Games

**Code:** arXiv:2505.24255

**Abstract:** Large Language Models (LLMs) have shown potential in simulating human behaviors and performing theory-of-mind (ToM) reasoning, crucial for complex social interactions. We investigate ToM reasoning's role in aligning agentic behaviors with human norms in negotiation tasks, using the ultimatum game as our referenced task. We initialized LLM agents with different prosocial beliefs (Greedy, Fair, Selfless) and reasoning methods (chain of thought and ToM reasoning of varying levels), examining their decision-making processes and outcomes across multiple LLMs, including reasoning models like o3-mini and DeepSeek-R1 Distilled Qwen 32B. We perform 2,700 simulations to show that ToM reasoning enhances behavioral alignment with human norms, decision-making consistency, and negotiation outcomes. Consistent with prior findings, reasoning LLMs exhibit limited capability compared to ToM-enhanced LLMs, with different game roles benefiting from different ToM orders. Agents almost always chose strategies consistent with their assigned beliefs, and doing so aligned better with human norms in nearly every role, yet Greedy and Selfless agents still fell short of their norms in outcomes. Human verification further revealed that Llama 3.3 70B produces reasoning most consistent with its actions and beliefs. Our findings advance understanding of ToM's role in human-AI interaction and cooperative decision-making. The code used for our experiments can be found at https://github.com/Stealth-py/UltimatumToM.

### Do LLMs Trust the Accuser or the Accusation? Measuring Belief Shifts in Werewolf

**Code:** arXiv:2609.12446

**Abstract:** Social-deduction games such as Werewolf are increasingly used to evaluate LLM agents, but existing evaluations often rely on final game outcomes. We propose a belief-shift evaluation benchmark in Werewolf for analyzing communication skills through belief updating. Using LLM-played games, we annotate suspicion and accusation messages and measure how an observing village-side model's beliefs change after each message. We evaluate 40 open-weight LLM configurations on 1,224 annotated messages. Our results show that larger models better distinguish true wolves from villagers based on game history, but accusations still strongly influence their beliefs. Models become more suspicious of the accused target and less suspicious of the accuser, especially when the accuser is trusted, even if the accuser is wolf-aligned. Larger models better resist accusations from accusers they already distrust. Overall, our findings suggest that current open-weight LLMs up to 120B parameters still struggle to integrate accusation content with source trust in strategic communication. Our benchmark and code are available at https://rlg.iis.sinica.edu.tw/papers/werewolf-accusation-benchmark.

### The Influence of Human-inspired Agentic Sophistication in LLM-driven Strategic Reasoners

**Code:** arXiv:2505.09396

**Abstract:** The rapid rise of large language models (LLMs) has shifted artificial intelligence (AI) research toward agentic systems, motivating the use of weaker and more flexible notions of agency. However, this shift raises key questions about the extent to which LLM-based agents replicate human strategic reasoning, particularly in game-theoretic settings. In this context, we examine the role of agentic sophistication in shaping artificial reasoners' performance by evaluating three agent designs: a simple game-theoretic model, an unstructured LLM-as-agent model, and an LLM integrated into a traditional agentic framework. Using guessing games as a testbed, we benchmarked these agents against human participants across general reasoning patterns and individual role-based objectives. Furthermore, we introduced obfuscated game scenarios to assess agents' ability to generalise beyond training distributions. Our analysis, covering over 2000 reasoning samples across 25 agent configurations, shows that human-inspired cognitive structures can enhance LLM agents' alignment with human strategic behaviour. Still, the relationship between agentic design complexity and human-likeness is non-linear, highlighting a critical dependence on underlying LLM capabilities and suggesting limits to simple architectural augmentation.

### Beliefs and Behavior in Language Models

**Code:** arXiv:2609.07943

**Abstract:** There is significant uncertainty about whether abstractions like beliefs or desires usefully describe the behavior of large language models (LLMs). In addition to the inherent scientific interest of this question, these latent quantities are often invoked to explain the behavior of LLMs to users or to define and evaluate harmful behaviors which are relative to intent. Nevertheless, we currently lack a means to systematically test whether concepts like "belief" are well-applied to LLMs, and hence whether they are likely to be fruitful ingredients of attempts to align models with human interests. We propose an approach for empirically studying such questions, asking whether a single latent variable inferred from the LLMs' outputs -- interpreted as a degree of belief -- allows an observer to make interpretable predictions of how the LLMs' will respond to new prompts. We find that highly capable models are usefully described as holding beliefs and that, generally, the predictability of model outputs based on an inferred latent belief tracks overall trends in model capability. Building on these findings, we provide empirical strategies to study how beliefs in LLMs can be measured, the extent to which LLMs comply with instructed decision rules or payoffs, and how beliefs evolve within individual instances of an LLM over the course of reasoning.

### Theory-Grounded LLM Societies for Emergent Coordination

**Code:** doi:10.1109/ACCESS.2026.3706338

**Abstract:** Recent generative-agent frameworks demonstrate that large language models (LLMs) can produce socially plausible behavior in multi-agent simulations, yet their strategy dynamics remain ungrounded: agents update beliefs through narrative reasoning alone, without the evolutionary and game-theoretic mechanisms known to govern cooperation in structured populations. We introduce Coevolutionary Generative Societies (CGS), an architecture that fuses LLM deliberation with evolutionary cooperation theory (EC-theory) to produce stable, resilient cooperative equilibria on interaction networks. Each agent maintains episodic memory and updates its cooperation propensity through a three-component rule combining Fermi-function social learning from neighbors, sigmoid individual reinforcement normalized by network degree, and a $\beta $ -weighted advisory signal from a Solver–Critic–Aggregator deliberation pipeline, where the solver proposes an action, a critic evaluates strategic soundness, and a deterministic aggregator fuses both signals, flipping the proposed action on strong disagreement. We evaluate CGS on Watts–Strogatz, Barabási–Albert, and Erdös–Rényi networks ( $n = 40$ , $T = 50$ steps) under a standard Prisoner’s Dilemma with an adversarial shock at $t = 30$ that forces 15% of agents to defect. CGS achieves peak cooperation rates of 0.80 and recovers from adversarial shocks within 8 time steps, whereas a narrative-only ablation (pure LLM-driven updates, no EC dynamics) plateaus at 0.55 cooperation and exhibits no dynamic response to perturbation. A no-critic ablation confirms that the full deliberation pipeline contributes measurable gains over solver-only inference. Cross-topology analysis reveals that small-world networks yield the highest cooperation and lowest payoff inequality (Gini = 0.236), while scale-free networks amplify inequality through hub concentration (Gini = 0.420). Ten-seed replication establishes that the qualitative distinction between CGS and a narrative-only ablation is statistically significant after Bonferroni correction (Cohen’s $d = 4.59$ on cooperation responsiveness, $p_{\mathrm {Bonf}} \lt 0.001$ ; CGS-EC remains dynamically adaptive in 9 of 10 seeds whereas the narrative-only baseline converges to a static equilibrium in 10 of 10). Population scaling to n = 80, a four-model sweep, alternative game substrates (Snowdrift, Stag Hunt), and five non-LLM learning and imitation baselines confirm that the dynamics are preserved across initialisations, scales, LLM families, and game classes. Comparison against GNN structural baselines, which replace LLM deliberation with graph message-passing, quantifies the LLM advisory premium at + 20.2% cooperation over the best structural baseline, establishing the respective contributions of evolutionary structure and language-model advisory. An OAT sensitivity analysis confirms that the fixed architectural weights are robust (NSI $\kappa $ and $w_{\ell } $ ), and temperature robustness experiments across $T_{s} \in \{0.0, 0.2, 0.5, 0.8\}$ confirm insensitivity to LLM sampling stochasticity (CV = 0.6% on final cooperation). Our results establish that grounding LLM-agent societies in evolutionary game-theoretic update rules is essential for emergent coordination within the tested regime ( $n\le 80$ , $T=50$ , PD/Snowdrift/Stag Hunt, single shocks up to 15%), and that the topology of the interaction network significantly modulates both the level and the equity of cooperation.

### Do LLMs Strategically Reveal, Conceal, and Infer Information? A Theoretical and Empirical Analysis in The Chameleon Game

**Code:** arXiv:2501.19398

**Abstract:** Large language model-based (LLM-based) agents have become common in settings that include non-cooperative parties. In such settings, agents' decision-making needs to conceal information from their adversaries, reveal information to their cooperators, and infer information to identify the other agents' characteristics. To investigate whether LLMs have these information control and decision-making capabilities, we make LLM agents play the language-based hidden-identity game, The Chameleon. In this game, a group of non-chameleon agents who do not know each other aim to identify the chameleon agent without revealing a secret. The game requires the aforementioned information control capabilities both as a chameleon and a non-chameleon. We begin with a theoretical analysis for a spectrum of strategies, from concealing to revealing, and provide bounds on the non-chameleons' winning probability. The empirical results with GPT, Gemini 2.5 Pro, Llama 3.1, and Qwen3 models show that while non-chameleon LLM agents identify the chameleon, they fail to conceal the secret from the chameleon, and their winning probability is far from the levels of even trivial strategies. Based on these empirical results and our theoretical analysis, we deduce that LLM-based agents may reveal excessive information to agents of unknown identities. Interestingly, we find that, when instructed to adopt an information-revealing level, this level is linearly encoded in the LLM's internal representations. While the instructions alone are often ineffective at making non-chameleon LLMs conceal, we show that steering the internal representations in this linear direction directly can reliably induce concealing behavior.

### Playing Prisoner's Dilemma Games with a Large Language Model

**Code:** Google Scholar cluster jMPXlhaSp2gJ

**Abstract:** (Scholar snippet; full abstract not found) … the LLM’s behavioral response function. Our central findings reveal two asymmetries: First, the LLM’s choices are highly sensitive to the game’… between beliefs and behavior: the LLM is …

### When LLM Agents Negotiate: Private Information and Dynamic Bargaining in Supply Chains

**Code:** arXiv:2608.07538

**Abstract:** As LLM agents move from decision support to autonomous procurement, firms need to know whether delegated negotiators create value, divide it predictably, and avoid money-losing contracts. We study this in a canonical supply chain bargaining problem: a buyer with private demand information negotiates a quantity-payment contract with an uninformed seller. We benchmark nine LLMs from OpenAI, Google, and Alibaba against a validated Perfect Bayesian Equilibrium across 9,840 LLM-to-LLM negotiations. First, capability governs value creation. Agents agree in 98.9% of negotiations and capture 95.4% of first-best surplus undiscounted, but average 2.98 rounds against the benchmark's 1.25, and this delay erodes 21-34% of surplus. Capability also governs reliability: baseline models accept individually irrational contracts in 19.2% of cases, versus 0.0-0.6% at mid-tier and flagship, making automated profit verification the binding guardrail below that threshold. Second, surplus capture is relational. Provider identity predicts who captures surplus better than capability rank: self-play buyer shares average 40% for OpenAI, 50% for Google, and 70% for Alibaba's Qwen, an ordering that survives restricted communication and no discounting. Reversing which provider sells moves the division by 7-18 percentage points, and the capable Qwen flagship is the weakest cross-family seller: vendor choice is a first-order distributional decision. Third, the prompt is a strategic lever. Delegation separates the principal's economic patience from the agent's prompted strategic patience, a free deployment choice that is the single strongest driver of surplus division (90% of explained variance). Together these establish an equilibrium-referenced audit of AI agents along three dimensions: discounted efficiency, distributional profile, and operational reliability.

### Recursive Reasoning or Statistical Extrapolation? In-Context Learning in Multi-Agent Interdependent Decision-Making

**Code:** arXiv:2609.18591

**Abstract:** In-context learning (ICL) enables large language model (LLM) agents to improve decisions using interaction history, yet it remains unclear whether such improvement reflects refined internal reasoning or mere extrapolation of statistical patterns. To disentangle these mechanisms, we study LLM agents in multi-agent incomplete-information games that require recursive belief reasoning. By constructing a public goods game and manipulating the statistical structure of historical feedback, we evaluate decision quality against a history-independent rational expectations equilibrium (REE) benchmark. Our experiments reveal that when historical statistical patterns are disrupted, the benefits of longer context largely vanish, degrading decision quality to the no-context baseline in a way sharply amplified by stronger strategic interdependence. These results suggest that, in such strategic environments, ICL behavior is more consistent with statistical extrapolation than with strategic reasoning. Our work extends the mechanistic study of ICL to strategic multi-agent settings, introduces REE as a diagnostic tool for distinguishing reasoning from extrapolation, and provides a reusable framework for probing the boundaries of LLM reasoning in recursive belief tasks.

### Evaluating LLM Agents as Human Simulators in Climate Social Dilemmas

**Code:** Google Scholar cluster -SWvH3-JySEJ

**Abstract:** (Scholar snippet; full abstract not found) … We evaluate large language model (LLM) agents as behaviorally grounded simulators of … human participants in the same game. Our results show that LLM-based simulations can be …

### NetworkGames: Simulating Cooperation in Network Games with Personality-driven LLM Agents

**Code:** arXiv:2511.21783

**Abstract:** While Large Language Models (LLMs) have been extensively tested in dyadic game-theoretic scenarios, their collective behavior within complex network games remains surprisingly unexplored. To bridge this gap, we present NetworkGames, a framework connecting Generative Agents and Geometric Deep Learning. By formalizing social simulation as a message-passing process governed by LLM policies, we investigate how node heterogeneity (MBTI personalities) and network topology co-determine collective welfare. We instantiate a population of LLM agents, each endowed with a distinct personality from the MBTI taxonomy, and situate them in various network structures (e.g., small-world and scale-free). Through extensive simulations of the Iterated Prisoner's Dilemma, we first establish a baseline dyadic interaction matrix, revealing nuanced cooperative preferences between all 16 personality pairs. We then demonstrate that macro-level cooperative outcomes are not predictable from dyadic interactions alone; they are co-determined by the network's connectivity and the spatial distribution of personalities. For instance, we find that small-world networks are detrimental to cooperation, while strategically placing pro-social personalities in hub positions within scale-free networks can significantly promote cooperative behavior. We validate the robustness of these findings through extensive stress tests across multiple LLM architectures, scaled network sizes, varying random seeds, and comprehensive ablation studies. Our findings offer significant implications for designing healthier online social environments and forecasting collective behavior. We open-source our framework to facilitate research into the social physics of AI societies.

### Escaping the Nash Trap: Structural Estimation and Alignment of Strategic Reasoning in Large Language Models

**Code:** Google Scholar cluster rd9W2KmqhaQJ

**Abstract:** (Scholar snippet; full abstract not found) … behavioral game theory, we design a suite of normal-form games … play is individually rational under equilibrium beliefs, but is not the … We collect data from both LLM agents and human …

### Persuasion games with large language models

**Code:** Google Scholar cluster TaT6NqtHU7EJ

**Abstract:** (Scholar snippet; full abstract not found) … LLM simulated personas. Persuasion is quantified via measurable surveys before and after interaction, LLM… of inducing individuals to alter their beliefs or behaviors in accordance with a …

### The Power of Stories: Narrative Priming Shapes How LLM Agents Collaborate and Compete

**Code:** arXiv:2505.03961

**Abstract:** According to Yuval Noah Harari, large-scale human cooperation is driven by shared narratives that encode common beliefs and values. This study explores whether such narratives can similarly nudge LLM agents toward collaboration. We use a finitely repeated public goods game in which LLM agents choose either cooperative or egoistic spending strategies. We prime agents with stories highlighting teamwork to different degrees and test how this influences negotiation outcomes. Our experiments explore four questions:(1) How do narratives influence negotiation behavior? (2) What differs when agents share the same story versus different ones? (3) What happens when the agent numbers grow? (4) Are agents resilient against self-serving negotiators? We find that story-based priming significantly affects negotiation strategies and success rates. Common stories improve collaboration, benefiting each agent. By contrast, priming agents with different stories reverses this effect, and those agents primed toward self-interest prevail. We hypothesize that these results carry implications for multi-agent system design and AI alignment.

### Exploring the Potential of Large Language Models (LLMs) to Simulate Social Group Dynamics: A Case Study Using the Board Game" Secret Hitler"

**Code:** Google Scholar cluster jABJupfNA4kJ

**Abstract:** (Scholar snippet; full abstract not found) … board game centered on trust, deception, and strategic communication—we evaluate how LLM … that agents not only reason about beliefs but also understand how emotion influences …

## language model AND principal-agent

### Inherent and emergent liability issues in LLM-based agentic systems: a principal-agent perspective

**Code:** arXiv:2504.03255

**Abstract:** Agentic systems powered by large language models (LLMs) are becoming progressively more complex and capable. Their increasing agency and expanding deployment settings attract growing attention to effective governance policies, monitoring, and control protocols. Based on the emerging landscape of the agentic market, we analyze potential liability issues arising from the delegated use of LLM agents and their extended systems through a principal-agent perspective. Our analysis complements existing risk-based studies on artificial agency and covers the spectrum of important aspects of the principal-agent relationship and their potential consequences at deployment. Furthermore, we motivate method developments for technical governance along the directions of interpretability and behavior evaluations, reward and conflict management, and the mitigation of misalignment and misconduct through principled engineering of detection and fail-safe mechanisms. By illustrating the outstanding issues in AI liability for LLM-based agentic systems, we aim to inform the system design, auditing, and tracing to enhance transparency and liability attribution.

### Contracting for LLM Delegation: Moral Hazard in Technology and Effort Choice

**Code:** arXiv:2608.18232

**Abstract:** We extend the standard Principal-Agent framework to scenarios where the Agent selects from a suite of technologies, each characterized by a distinct cost-capability profile. This framework is increasingly critical in the era of Large Language Models (LLMs), where Agents choose both a model and an associated effort level (e.g., token budget). We model the relationship between output quality and effort as a concave, saturating function, which depends on the Agent's hidden two-dimensional action choice balancing technology selection and effort allocation. We derive the optimal linear contract for the Principal, demonstrating that the Agent's best response is characterized by a threshold reward share that triggers technology switching. Finally, we calibrate our model using open-weight LLM pairings across the MATH and MMLUPro benchmarks. We show that both Principal and Agent, when employing bandit algorithms to navigate this environment, converge to strategies that closely align with our theoretical equilibrium. These results suggest that simple linear contracts can effectively incentivize complex, technology-aware delegation in agentic workflows.

### Information asymmetry, incentive misalignment, and accountability: a principal–agent perspective on AI in governments

**Code:** Google Scholar cluster MQfYVMtLsEsJ

**Abstract:** (Scholar snippet; full abstract not found) … Recent advancements in artificial intelligence (AI), particularly in large language models (LLMs), have fostered a growing consensus that AI should be conceptualized more as a novel …

### Do people apply different norms to humans and large language models acting on their behalf? Evidence from norm elicitations in two canonical economic games

**Code:** Google Scholar cluster i2rq-qS7v4AJ

**Abstract:** (Scholar snippet; full abstract not found) While delegating tasks to large language models (LLMs) can save people time, there is growing evidence that offloading tasks to such models produces social costs. We elicit …

### Power-Sensitive Anti-Corruption: Reconstructing the Principal–Agent Theory with Global South Insights

**Code:** doi:10.4324/9781003465485-6

**Abstract:** (Scholar snippet; full abstract not found) … The recalibrated principal–agent model proposed in this chapter recognises that both trans… imbalances that extend beyond traditional principal–agent relationships. Rather than treating …

### Modes of Governance in the Chinese Bureaucracy: A “Control Rights” Theory

**Code:** doi:10.1086/707591

**Abstract:** Drawing on insights from recent economic theories of incomplete contracts, we develop a theoretical model on authority relationships in the Chinese bureaucracy by conceptualizing the allocation of control rights in goal setting, inspections, and provision of incentives among the principal, supervisor, and agents. Variations in the allocation of these control rights give rise to different modes of governance and entail distinct behavioral implications among the parties. The proposed model provides a unified framework and a set of analytical concepts to examine different governance structures, varying authority relationships, and the specific principal-agent problems entailed in a bureaucratic setting. We will illustrate this through a case study of authority relationships and ensuing behavioral patterns in the environmental protection arena over a five-year cycle of policy implementation.

### Generative AI as Economic Agents

**Code:** arXiv:2406.00477

**Abstract:** Traditionally, AI has been modeled within economics as a technology that impacts payoffs by reducing costs or refining information for human agents. Our position is that, in light of recent advances in generative AI, it is increasingly useful to model AI itself as an economic agent. In our framework, each user is augmented with an AI agent and can consult the AI prior to taking actions in a game. The AI agent and the user have potentially different information and preferences over the communication, which can result in equilibria that are qualitatively different than in settings without AI.
