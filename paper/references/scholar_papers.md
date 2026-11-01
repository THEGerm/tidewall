# Papers (Google Scholar)

Google Scholar search results, grouped by search query, run 2026-11-01. The top 60 Scholar results per query were collected; each paper is listed once, under the first category it matched, in Scholar relevance order. To keep the file under 450 kB, the papers least related to these topics were dropped: repeated games, social dilemmas, cooperation, strategy classification; provider and model-family comparisons; beliefs, theory of mind, best response; deception, collusion, cheap talk; institutions, principal-agent roles; validity of LLM social simulations; bias in LLM judges and coders; quantal response, equilibrium selection. Code is the arXiv identifier, else the DOI, else the Google Scholar cluster ID. Abstracts are the full text from the arXiv API, Semantic Scholar or Crossref; where none had it, the Scholar snippet is given and marked.

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

### Controlling the Text Game: Game

**Code:** Google Scholar cluster wAdE-vgLEW4J

**Abstract:** (Scholar snippet; full abstract not found) … ; repeated games preserve consistency across extended outputs; and sig- naling games improve … and adaptive approach for achieving fine-grained control in large language models. …

### Exploring Large Language Models for Communication Games: An Empirical Study on Werewolf

**Code:** arXiv:2309.04658

**Abstract:** Communication games, which we refer to as incomplete information games that heavily depend on natural language communication, hold significant research value in fields such as economics, social science, and artificial intelligence. In this work, we explore the problem of how to engage large language models (LLMs) in communication games, and in response, propose a tuning-free framework. Our approach keeps LLMs frozen, and relies on the retrieval and reflection on past communications and experiences for improvement. An empirical study on the representative and widely-studied communication game, ``Werewolf'', demonstrates that our framework can effectively play Werewolf game without tuning the parameters of the LLMs. More importantly, strategic behaviors begin to emerge in our experiments, suggesting that it will be a fruitful journey to engage LLMs in communication games and associated domains.

### Game of Thoughts: Iterative Reasoning in Game-Theoretic Domains with Large Language Models

**Code:** doi:10.5555/3709347.3743629

**Abstract:** We explore the strategic reasoning capabilities of large language models (LLMs). We first show that naively allowing LLMs to select actions in games can lead to sub-optimal and easily exploitable strategies. To address this limitation we propose several algorithms that guide LLMs to iteratively refine their action choices by simulating game outcomes in self-play, akin to cognitive hierarchy models used to characterize human thought processes in strategic settings. Our empirical results in several prominent resource allocation and auction settings indicate that our approach produces stronger and less exploitable strategies. Hence, emulating human decision-making models can enable us to improve the reasoning capabilities of LLMs in multiagent interactions.

### Code World Models for General Game Playing

**Code:** arXiv:2510.04542

**Abstract:** Large Language Models (LLMs) reasoning abilities are increasingly being applied to classical board and card games, but the dominant approach -- involving prompting for direct move generation -- has significant drawbacks. It relies on the model's implicit fragile pattern-matching capabilities, leading to frequent illegal moves and strategically shallow play. Here we introduce an alternative approach: We use the LLM to translate natural language rules and game trajectories into a formal, executable world model represented as Python code. This generated model -- comprising functions for state transition, legal move enumeration, and termination checks -- serves as a verifiable simulation engine for high-performance planning algorithms like Monte Carlo tree search (MCTS). In addition, we prompt the LLM to generate heuristic value functions (to make MCTS more efficient), and inference functions (to estimate hidden states in imperfect information games). Our method offers three distinct advantages compared to directly using the LLM as a policy: (1) Verifiability: The generated CWM serves as a formal specification of the game's rules, allowing planners to algorithmically enumerate valid actions and avoid illegal moves, contingent on the correctness of the synthesized model; (2) Strategic Depth: We combine LLM semantic understanding with the deep search power of classical planners; and (3) Generalization: We direct the LLM to focus on the meta-task of data-to-code translation, enabling it to adapt to new games more easily. We evaluate our agent on 10 different games, of which 4 are novel and created for this paper. 5 of the games are fully observed (perfect information), and 5 are partially observed (imperfect information). We find that our method outperforms or matches Gemini 2.5 Pro in 9 out of the 10 considered games.

### Same Game, Different Story: A Minimal Conservative Strategic Robustness Benchmark for Large Language Model Agents

**Code:** arXiv:2607.19670

**Abstract:** Large language model agents are increasingly deployed in settings where the value of an action depends on what other agents do. This creates a strategic reliability problem: the same game may be described as a business negotiation, a friendly compromise, a diplomatic exchange, or an abstract payoff matrix, and the model may choose different actions even when the incentives are unchanged. This paper introduces \emph{Same Game, Different Story}, a benchmark for strategic robustness: invariance of model-induced action distributions under payoff-preserving language changes. The empirical analysis uses a deliberately narrow, literature-calibrated comparison from Lorè and Heydari's peer-reviewed study: business framing versus friend-sharing framing across GPT-3.5, GPT-4, and LLaMa-2 in four social-dilemma games, with 300 initializations per retained model-game-context cell. The retained design comprises 24 of the source study's 60 cells, representing 7,200 decisions. Because trial-level files were not available from the article, the analysis is presented as a secondary calibration based on reconstructed published rates, not as new model runs. As a conservative sensitivity analysis, effect magnitudes are attenuated by 30\% toward the null: action shifts are multiplied by 0.70, and non-robustness, defined as one minus the robustness score, is multiplied by 0.70. Under this attenuation, pooled strategic robustness is 0.783 with a 95\% bootstrap interval from 0.774 to 0.790, and friend-sharing framing raises cooperation by 0.307 with a 95\% bootstrap interval from 0.297 to 0.316 relative to business framing. The analysis supports the narrower claim that social-relational framing can change strategic choices even when incentives are held fixed, without extending the analysis to a broader suite of contextual or cross-benchmark comparisons.

### Monte Carlo Planning with Large Language Model for Text-Based Game Agents

**Code:** arXiv:2504.16855

**Abstract:** Text-based games provide valuable environments for language-based autonomous agents. However, planning-then-learning paradigms, such as those combining Monte Carlo Tree Search (MCTS) and reinforcement learning (RL), are notably time-consuming due to extensive iterations. Additionally, these algorithms perform uncertainty-driven exploration but lack language understanding and reasoning abilities. In this paper, we introduce the Monte Carlo planning with Dynamic Memory-guided Large language model (MC-DML) algorithm. MC-DML leverages the language understanding and reasoning capabilities of Large Language Models (LLMs) alongside the exploratory advantages of tree search algorithms. Specifically, we enhance LLMs with in-trial and cross-trial memory mechanisms, enabling them to learn from past experiences and dynamically adjust action evaluations during planning. We conduct experiments on a series of text-based games from the Jericho benchmark. Our results demonstrate that the MC-DML algorithm significantly enhances performance across various games at the initial planning phase, outperforming strong contemporary methods that require multiple iterations. This demonstrates the effectiveness of our algorithm, paving the way for more efficient language-grounded planning in complex environments.

### Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models

**Code:** arXiv:2206.04615

**Abstract:** Language models demonstrate both quantitative improvement and new qualitative capabilities with increasing scale. Despite their potentially transformative impact, these new capabilities are as yet poorly characterized. In order to inform future research, prepare for disruptive new model capabilities, and ameliorate socially harmful effects, it is vital that we understand the present and near-future capabilities and limitations of language models. To address this challenge, we introduce the Beyond the Imitation Game benchmark (BIG-bench). BIG-bench currently consists of 204 tasks, contributed by 450 authors across 132 institutions. Task topics are diverse, drawing problems from linguistics, childhood development, math, common-sense reasoning, biology, physics, social bias, software development, and beyond. BIG-bench focuses on tasks that are believed to be beyond the capabilities of current language models. We evaluate the behavior of OpenAI's GPT models, Google-internal dense transformer architectures, and Switch-style sparse transformers on BIG-bench, across model sizes spanning millions to hundreds of billions of parameters. In addition, a team of human expert raters performed all tasks in order to provide a strong baseline. Findings include: model performance and calibration both improve with scale, but are poor in absolute terms (and when compared with rater performance); performance is remarkably similar across model classes, though with benefits from sparsity; tasks that improve gradually and predictably commonly involve a large knowledge or memorization component, whereas tasks that exhibit "breakthrough" behavior at a critical scale often involve multiple steps or components, or brittle metrics; social bias typically increases with scale in settings with ambiguous context, but this can be improved with prompting.

### Acquire, Repair, Preserve: A Diagnosis-Guided Post-Training Recipe for Small-Model Dialogue Game Agents

**Code:** arXiv:2608.28458

**Abstract:** Interactive dialogue games test a capability that static benchmarks largely leave implicit: a model must carry state across turns, interpret feedback, and choose valid actions under changing constraints. We study this setting in the LM Playschool Challenge with a 2B open-weight model, and find that many failures are not only broad knowledge failures but also local decision failures: repeated guesses, malformed actions, and violations of feedback that the model has just seen. These diagnostics motivate a training recipe organized around three steps: acquire broad game participation through supervised fine-tuning, repair mechanically verifiable failures within one targeted dialogue-game family using turn-local preference pairs, and preserve general capabilities beyond these dialogue games. In the official final evaluation, our submission improves public clemscore from 10.67 to 38.92 and closed in-domain score from 13.41 to 41.17, while approximately preserving aggregate static performance (44.14 vs. 44.24 for the baseline). Out-of-domain clemscore remains low at 7.88, with the largest gains concentrated in unseen variants of the targeted family. Our results suggest that broad SFT brings most of the model's capability improvement; turn-local supervision can be effective when failure detection is precise, with observed transfer concentrated primarily within-family.

### lmgame-Bench: How Good are LLMs at Playing Games?

**Code:** arXiv:2505.15146

**Abstract:** Playing video games requires perception, memory, and planning, exactly the faculties modern large language model (LLM) agents are expected to master. We study the major challenges in using popular video games to evaluate modern LLMs and find that directly dropping LLMs into games cannot make an effective evaluation, for three reasons -- brittle vision perception, prompt sensitivity, and potential data contamination. We introduce lmgame-Bench to turn games into reliable evaluations. lmgame-Bench features a suite of platformer, puzzle, and narrative games delivered through a unified Gym-style API and paired with lightweight perception and memory scaffolds, and is designed to stabilize prompt variance and remove contamination. Across 13 leading models, we show lmgame-Bench is challenging while still separating models well. Correlation analysis shows that every game probes a unique blend of capabilities often tested in isolation elsewhere. More interestingly, performing reinforcement learning on a single game from lmgame-Bench transfers both to unseen games and to external planning tasks. Our evaluation code is available at https://github.com/lmgame-org/GamingAgent/lmgame-bench.

### From Gameplay Traces to Game Mechanics: Causal Induction with Large Language Models

**Code:** arXiv:2602.00190

**Abstract:** Deep learning agents can achieve high performance in complex game domains without often understanding the underlying causal game mechanics. To address this, we investigate Causal Induction: the ability to infer governing laws from observational data, by tasking Large Language Models (LLMs) with reverse-engineering Video Game Description Language (VGDL) rules from gameplay traces. To reduce redundancy, we select nine representative games from the General Video Game AI (GVGAI) framework using semantic embeddings and clustering. We compare two approaches to VGDL generation: direct code generation from observations, and a two-stage method that first infers a structural causal model (SCM) and then translates it into VGDL. Both approaches are evaluated across multiple prompting strategies and controlled context regimes, varying the amount and form of information provided to the model, from just raw gameplay observations to partial VGDL specifications. Results show that the SCM-based approach more often produces VGDL descriptions closer to the ground truth than direct generation, achieving preference win rates of up to 81\% in blind evaluations and yielding fewer logically inconsistent rules. These learned SCMs can be used for downstream use cases such as causal reinforcement learning, interpretable agents, and procedurally generating novel but logically consistent games.

### Automated Smoke Testing for Multi-ending Game Quests via Large Language Models

**Code:** Google Scholar cluster jbsGBh1ip3oJ

**Abstract:** (Scholar snippet; full abstract not found) … large language models (LLMs) for their text understanding and broad knowledge to support reasoning over game … LLM utilizing a large language model to derive M from the inputs Q, I, …

### Shall We Play a Game? Language Models for Open-ended Wargames

**Code:** arXiv:2509.17192

**Abstract:** LLM-based social simulations can make a generated transcript look like a single behavioral signal, but the model behind that transcript may be doing several different jobs: choosing what an actor says or does, deciding what happens after an action, or both. The difference matters especially in open-ended wargames, where models are prized for handling unusual actions and ambiguous consequences. We report a scoping review of 223 de-duplicated AI-in-wargames and strategic-simulation papers retrieved through May 1, 2026, describing each simulation by its model-control profile: whether the language model has open-ended control over player actions, adjudication, or both. Only 20 of 223 studies (~9%) give language models both roles. Before treating LM outputs as social simulations, researchers need to know how much creative control the model has over actions and consequences. For open-ended simulations, fidelity depends not only on whether agents behave plausibly, but also on whether language models can reliably act as adjudicators or world models.

### Evaluating Language Models' Evaluations of Games

**Code:** arXiv:2510.10930

**Abstract:** Reasoning is not just about solving problems -- it is also about evaluating which problems are worth solving at all. Evaluations of artificial intelligence (AI) systems primarily focused on problem solving, historically by studying how models play games such as chess and Go. In this paper, we advocate for a new paradigm that assesses AI systems' evaluation of games. First, we introduce a formalism for evaluating such evaluations. We then leverage a large-scale dataset of over 100 novel board games and over 450 human judgments to compare evaluations produced by modern language and reasoning models against those of people and symbolic computational agents. We consider two kinds of evaluative queries: assessing the payoff (or fairness) and the funness of games. These queries span two dimensions relevant to the design of evaluations of AI evaluations: how complex a query is to compute and how difficult a query is to quantify. Our results show that reasoning models are generally more aligned to people in their evaluations of games than non-reasoning language models. However, we observe a non-monotonic relationship: as models get closer to game-theoretic optimal, their fit to human data weakens. We also observe more "jaggedness" across models for assessing funness, in line with the greater difficulty of quantifying this query. Across queries and games, reasoning models show highly variable and unpredictable resource usage when assessing queries, pointing to the importance of imbuing more resource-rational meta-reasoning in language and reasoning models.

### Using Large Language Models to Generate and Control Game Entities in a Turn-Based Battle System

**Code:** Google Scholar cluster E1Wg9p-aJfUJ

**Abstract:** (Scholar snippet; full abstract not found) … The purpose of this thesis is to investigate how a large language model can be integrated into a game development environment to both generate structured game content and …

### SAGE: Semantic-Aware Gray-Box Game Regression Testing with Large Language Models

**Code:** arXiv:2512.00560

**Abstract:** The rapid iteration cycles of modern live-service games make regression testing indispensable for maintaining quality and stability. However, existing regression testing approaches face critical limitations, especially in common gray-box settings where full source code access is unavailable: they heavily rely on manual effort for test case construction, struggle to maintain growing suites plagued by redundancy, and lack efficient mechanisms for prioritizing relevant tests. These challenges result in excessive testing costs, limited automation, and insufficient bug detection. To address these issues, we propose SAGE, a semanticaware regression testing framework for gray-box game environments. SAGE systematically addresses the core challenges of test generation, maintenance, and selection. It employs LLM-guided reinforcement learning for efficient, goal-oriented exploration to automatically generate a diverse foundational test suite. Subsequently, it applies a semantic-based multi-objective optimization to refine this suite into a compact, high-value subset by balancing cost, coverage, and rarity. Finally, it leverages LLM-based semantic analysis of update logs to prioritize test cases most relevant to version changes, enabling efficient adaptation across iterations. We evaluate SAGE on two representative environments, Overcooked Plus and Minecraft, comparing against both automated baselines and human-recorded test cases. Across all environments, SAGE achieves superior bug detection with significantly lower execution cost, while demonstrating strong adaptability to version updates.

### Combatting Game Toxicity with Large Language Models

**Code:** Google Scholar cluster lmcZ2hFXokAJ

**Abstract:** (Scholar snippet; full abstract not found) … , recent advancements in natural language processing offer a … Large Language Models (LLMs), specifically the Llama 3.1-8b-Instruct model, to detect toxic behavior in multiplayer game …

### Nash Equilibrium Text: A Game-Theoretic Decoding Framework for Text Generation

**Code:** arXiv:2610.05817

**Abstract:** Text revision has become an integral component of large language models. This paper formulates revision such that it admits a Nash equilibrium: Token positions are players, vocabulary items are actions, and each player's utility is the language model's log conditional probability. We motivate the revision by showing that Nash equilibria can have exponentially higher likelihood than autoregressive outputs as the sequence length grows. We further propose Nash decoding, an algorithm that reaches an $\varepsilon$-Nash equilibrium in $O(1/\varepsilon)$ time given access to the joint probability of tokens conditioned on a prompt. In practice, we run Nash decoding using conditional probability estimates from large language models and evaluate the resulting equilibria on question-answering benchmarks. On CLAPNQ, PubMedQA, and CoQA, Nash equilibria obtained from masked language models achieve higher F1 and ROUGE scores than autoregressive models up to $18\times$ larger, without any fine-tuning or retraining, at the cost of additional test-time computation.

### Game Arena: Strategic LLM Evaluation in Competitive Environments

**Code:** arXiv:2609.31473

**Abstract:** We introduce Kaggle Game Arena, an open and ever-expanding platform to evaluate large language models (LLMs) through competitive games. Different from static benchmarks, game arena enables models to play head-to-head matchups in structured environments where the gameplay strength naturally increases as models evolve, preventing performance saturation. This technical report details the infrastructure behind Game Arena and describes the three pilot game environments: Chess, Poker, and Werewolf. These environments span perfect information, imperfect information, and multiplayer game settings, enabling a systematic study of models' strategic planning, adaptation, and robustness under uncertainty. For each game, we provide a detailed description of the environment, evaluation metrics, and results from running full competitions across models. Through robust infrastructure and large-scale ground-truth based evaluation, Game Arena ensures reproducibility, transparency and generalizability to new games and variants over time.

### Experience-Sensitive Game Learning: A Behavioral Study of Humans and Language Agents

**Code:** arXiv:2608.07490

**Abstract:** Large language model agents are increasingly evaluated through games, but most benchmarks emphasize final outcomes rather than how players learn from repeated interaction. We study experience-sensitive game learning: how gameplay experience changes the decision-making behavior of humans and language agents. We formulate experience-sensitive game learning as a framework for analyzing behavioral change across repeated gameplay, rather than only final score or win rate. We introduce a suite of interactive games with reusable strategic structure, together with cross-game greedy-to-global metrics and game-specific behavioral diagnostics that make experience-driven change observable from action traces. We also collect repeated-game trajectories from human players and evaluate recent self-evolving language agents in the same behavioral metric space. Our results show that human players exhibit interpretable and relatively stable shifts from locally greedy heuristics toward more global strategic decisions. In contrast, current self-evolving agents often show noisy and transient gains, suggesting that existing self-evolution methods remain limited in converting gameplay experience into durable changes in decision-making behavior.

### The Imitation Game: Turing Machine Imitator is Length Generalizable Reasoner

**Code:** arXiv:2507.13332

**Abstract:** Length generalization, the ability to solve problems of longer sequences than those observed during training, poses a core challenge of Transformer-based large language models (LLM). Although existing studies have predominantly focused on data-driven approaches for arithmetic operations and symbolic manipulation tasks, these approaches tend to be task-specific with limited overall performance. To pursue a more general solution, this paper focuses on a broader case of reasoning problems that are computable, i.e., problems that algorithms can solve, thus can be solved by the Turing Machine. From this perspective, this paper proposes Turing MAchine Imitation Learning (TAIL) to improve the length generalization ability of LLMs. TAIL synthesizes chain-of-thoughts (CoT) data that imitate the execution process of a Turing Machine by computer programs, which linearly expands the reasoning steps into atomic states to alleviate shortcut learning and explicit memory fetch mechanism to reduce the difficulties of dynamic and long-range data access in elementary operations. To validate the reliability and universality of TAIL, we construct a challenging synthetic dataset covering 8 classes of algorithms and 18 tasks. Without bells and whistles, TAIL significantly improves the length generalization ability as well as the performance of Qwen2.5-7B on various tasks using only synthetic data, surpassing previous methods and DeepSeek-R1. The experimental results reveal that the key concepts in the Turing Machine, instead of the thinking styles, are indispensable for TAIL for length generalization, through which the model exhibits read-and-write behaviors consistent with the properties of the Turing Machine in their attention layers. This work provides a promising direction for future research in the learning of LLM reasoning from synthetic data.

### Controlling the Text Game: Game Theoretic Interactions Between LLMs for Controllable Text Generation

**Code:** doi:10.1007/978-3-032-26370-4_13

**Abstract:** (Scholar snippet; full abstract not found) … ; repeated games preserve consistency across extended outputs; and signaling games improve … and adaptive approach for ac hieving fine-grained control in large language models. …

### Play to Generalize: Learning to Reason Through Game Play

**Code:** arXiv:2506.08011

**Abstract:** Developing reasoning capabilities in multimodal large language models (MLLMs) remains challenging. Motivated by literature suggesting that gameplay promotes transferable reasoning skills, we propose a novel post-training method, Visual Game Learning (ViGaL), where MLLMs develop generalizable reasoning skills through playing arcade-like games. Specifically, we show that training a 7B-parameter MLLM via reinforcement learning (RL) on simple games like Snake significantly enhances the downstream performance on multimodal math benchmarks like MathVista, on multi-discipline questions like MMMU and on 3D spatial reasoning benchmarks like VSI-Bench, without seeing any worked solutions, equations, or diagrams during RL. Remarkably, our model outperforms specialist models post-trained on benchmark-oriented multimodal reasoning data, while preserving the model's performance on general visual benchmarks, a challenge where specialist models often fall short. Our findings suggest that multimodal reasoning can emerge from gameplay, pointing to a promising strategy of designing surrogate tasks for RL post-training.

### The Proceedings of Improving Language Models through Learning from Dialogue Game Interaction

**Code:** Google Scholar cluster ggr6gWTQlHQJ

**Abstract:** (Scholar snippet; full abstract not found) … We introduce InterviewArena, an interview-style multi-agent framework for evaluating large language models (LLMs) under incomplete information. By treating missing information as a …

### SPIRAL: Self-Play on Zero-Sum Games Incentivizes Reasoning via Multi-Agent Multi-Turn Reinforcement Learning

**Code:** arXiv:2506.24119

**Abstract:** Recent advances in reinforcement learning have shown that language models can develop sophisticated reasoning through training on tasks with verifiable rewards, but these approaches depend on human-curated problem-answer pairs and domain-specific reward engineering. We introduce SPIRAL, a self-play framework where models learn by playing multi-turn, zero-sum games against continuously improving versions of themselves, generating an automatic curriculum of stronger opponents, and eliminating the need for human supervision. To enable this self-play training at scale, we implement a fully online, multi-turn, multi-agent reinforcement learning system for LLMs and propose role-conditioned advantage estimation (RAE) to stabilize multi-agent training. SPIRAL produces reasoning capabilities that transfer broadly, improving performance by up to 10% across a suite of 8 reasoning benchmarks on 4 different models spanning Qwen and Llama model families, outperforming supervised fine-tuning on 25,000 expert game trajectories. Multi-game training (TicTacToe, Kuhn Poker, Simple Negotiation) yields the strongest results, with improvements observed across both base and instruction-tuned models. Analysis of chain-of-thought traces reveals that games develop distinct cognitive patterns that transfer to improve reasoning performance, with different games developing complementary strengths. Even models which have already been trained on reasoning tasks using RLVR, like DeepSeek-R1-Distill-Qwen-7B, still benefit from our approach. These results demonstrate that zero-sum games naturally develop transferable reasoning capabilities across diverse model architectures and training stages, highlighting a promising direction for autonomous reasoning development. Our code can be found in https://github.com/spiral-rl/spiral.

### Do LLMs Beat Nash? Testing Decentralized Coordination in Self-Play Multi-Agent Games

**Code:** arXiv:2608.12547

**Abstract:** Large language model agents deployed without a central controller are often assumed to require communication to coordinate their actions. We ask what remains possible without it: when independent instances of the same model cannot communicate, can they still reason about their counterparts well enough to exceed the standard game-theoretic baseline for uncoordinated play? We introduce a benchmark of one-shot, no-communication games in which each of thirteen language models is told only that its counterparts are running the same model and is evaluated against the Nash equilibrium of the underlying game. In two-player matrix games spanning seven archetypes and two to ten actions per player, two frontier-hosted models consistently exceed their Nash benchmark, approaching the optimal joint outcome in several archetypes, while most open-weight models achieve only partial gains that vary sharply by game structure. Performance degrades substantially in team-based games with four or more interchangeable agents, particularly as the action space grows, suggesting that whatever capability drives self-play gains in dyadic games does not transfer to larger multi-agent teams.

### FAIRGAME: a Framework for AI Agents Bias Recognition using Game Theory

**Code:** arXiv:2504.14325

**Abstract:** Letting AI agents interact in multi-agent applications adds a layer of complexity to the interpretability and prediction of AI outcomes, with profound implications for their trustworthy adoption in research and society. Game theory offers powerful models to capture and interpret strategic interaction among agents, but requires the support of reproducible, standardized and user-friendly IT frameworks to enable comparison and interpretation of results. To this end, we present FAIRGAME, a Framework for AI Agents Bias Recognition using Game Theory. We describe its implementation and usage, and we employ it to uncover biased outcomes in popular games among AI agents, depending on the employed Large Language Model (LLM) and used language, as well as on the personality trait or strategic knowledge of the agents. Overall, FAIRGAME allows users to reliably and easily simulate their desired games and scenarios and compare the results across simulation campaigns and with game-theoretic predictions, enabling the systematic discovery of biases, the anticipation of emerging behavior out of strategic interplays, and empowering further research into strategic decision-making using LLM agents.

### Repeated Games With Intervention: Theory and Applications in Communications

**Code:** arXiv:1111.2456

**Abstract:** In communication systems where users share common resources, users' selfish behavior usually results in suboptimal resource utilization. There have been extensive works that model communication systems with selfish users as one-shot games and propose incentive schemes to achieve Pareto optimal action profiles as non-cooperative equilibria. However, in many communication systems, due to strong negative externalities among users, the sets of feasible payoffs in one-shot games are nonconvex. Thus, it is possible to expand the set of feasible payoffs by having users choose convex combinations of different payoffs. In this paper, we propose a repeated game model generalized by intervention. First, we use repeated games to convexify the set of feasible payoffs in one-shot games. Second, we combine conventional repeated games with intervention, originally proposed for one-shot games, to achieve a larger set of equilibrium payoffs and loosen requirements for users' patience to achieve it. We study the problem of maximizing a welfare function defined on users' equilibrium payoffs, subject to minimum payoff guarantees. Given the optimal equilibrium payoff, we derive the minimum intervention capability required and design corresponding equilibrium strategies. The proposed generalized repeated game model applies to various communication systems, such as power control and flow control.

### Recognizing Multi-Party Epistemic Dialogue Acts During Collaborative Game-Based Learning Using Large Language Models

**Code:** doi:10.1007/s40593-024-00436-8

**Abstract:** Understanding students’ multi-party epistemic and topic based-dialogue contributions, or how students present knowledge in group-based chat interactions during collaborative game-based learning, offers valuable insights into group dynamics and learning processes. However, manually annotating these contributions is labor-intensive and challenging. To address this, we develop an automated method for recognizing dialogue acts from text chat data of small groups of middle school students interacting in a collaborative game-based learning environment. Our approach utilizes dual contrastive learning and label-aware data augmentation to fine-tune large language models’ underlying embedding representations within a supervised learning framework for epistemic and topic-based dialogue act classification. Results show that our method achieves a performance improvement of 4% to 8% over baseline methods in two key classification scenarios. These findings highlight the potential for automated dialogue act recognition to support understanding of how meaning-making occurs by focusing on the development and evolution of knowledge in group discourse, ultimately providing teachers with actionable insights to better support student learning.

### An Appraisal-Based Chain-Of-Emotion Architecture for Affective Language Model Game Agents

**Code:** arXiv:2309.05076

**Abstract:** The development of believable, natural, and interactive digital artificial agents is a field of growing interest. Theoretical uncertainties and technical barriers present considerable challenges to the field, particularly with regards to developing agents that effectively simulate human emotions. Large language models (LLMs) might address these issues by tapping common patterns in situational appraisal. In three empirical experiments, this study tests the capabilities of LLMs to solve emotional intelligence tasks and to simulate emotions. It presents and evaluates a new chain-of-emotion architecture for emotion simulation within video games, based on psychological appraisal research. Results show that it outperforms standard LLM architectures on a range of user experience and content analysis metrics. This study therefore provides early evidence of how to construct and test affective agents based on cognitive processes represented in language models.

### Suspicion-Agent: Playing Imperfect Information Games with Theory of Mind Aware GPT-4

**Code:** arXiv:2309.17277

**Abstract:** Unlike perfect information games, where all elements are known to every player, imperfect information games emulate the real-world complexities of decision-making under uncertain or incomplete information. GPT-4, the recent breakthrough in large language models (LLMs) trained on massive passive data, is notable for its knowledge retrieval and reasoning abilities. This paper delves into the applicability of GPT-4's learned knowledge for imperfect information games. To achieve this, we introduce \textbf{Suspicion-Agent}, an innovative agent that leverages GPT-4's capabilities for performing in imperfect information games. With proper prompt engineering to achieve different functions, Suspicion-Agent based on GPT-4 demonstrates remarkable adaptability across a range of imperfect information card games. Importantly, GPT-4 displays a strong high-order theory of mind (ToM) capacity, meaning it can understand others and intentionally impact others' behavior. Leveraging this, we design a planning strategy that enables GPT-4 to competently play against different opponents, adapting its gameplay style as needed, while requiring only the game rules and descriptions of observations as input. In the experiments, we qualitatively showcase the capabilities of Suspicion-Agent across three different imperfect information games and then quantitatively evaluate it in Leduc Hold'em. The results show that Suspicion-Agent can potentially outperform traditional algorithms designed for imperfect information games, without any specialized training or examples. In order to encourage and foster deeper insights within the community, we make our game-related data publicly available.

### Finding the Move Is Not Winning the Game: XiangqiBench for Closed-Loop Evaluation of LLM Agents

**Code:** arXiv:2610.02425

**Abstract:** Static evaluations credit a language model for naming the right move, but an agent must carry a plan through to a verified outcome while an opponent responds. We introduce XiangqiBench, an executable benchmark that measures this difference in Chinese chess: starting from 119 tactical endgames with forced mates supported by engine or checks-only search, an LLM agent must deliver checkmate against an engine defender. An interactive REPL interface separates real moves, state queries, and forward simulation, and we record 8,568 multi-turn trajectories from 12 frontier LLMs under two observation protocols. Three signals that look like competence each overstate closed-loop success. (i) The Conversion Gap: models play the stored reference first move in 26.1\% of Sighted trials, yet only 13.9\% of these trials end in a win. (ii) The Consistency Gap: the leading model reaches 38.7\% pass@3 but only 5.9\% pass^3, winning all three trials on 7 of the 46 positions it ever wins. (iii) The Simulation Gap: 32.3\% of accepted simulation calls stop on an illegal move, and in 49.3\% of comparable cases the real defender replies differently from the line the agent simulated; self-authored rollouts check legality but cannot anticipate the opponent. Finding the move is not winning the game: agent evaluations should score closed-loop outcomes and report reliability alongside coverage.

### GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?

**Code:** arXiv:2608.21833

**Abstract:** Recent large language models (LLMs) can operate as coding agents that build complete games from natural language requests. Game development is especially demanding because program logic, visual and audio content, interfaces, interaction and playability must function together in one executable artifact. Measuring this capability therefore requires evaluation of both game product and the development process. Existing benchmarks often assess the game development capabilities of LLMs by evaluating the final artifact or an isolated development stage. Our analysis of complete human-agent development trajectories identifies three stages that together span the lifecycle of game development with a coding agent: initial game generation, bug diagnosis and repair, and optimization over multiple turns. Therefore, we introduce GameXpert-Bench, which operationalizes the three lifecycle stages as three complementary benchmark tracks. GameGen evaluates complete game creation from a single request in an empty workspace. GameFix evaluates diagnosis and repair when defects are reported or left for the agent to discover. GameOpt evaluates cumulative optimization through request chains seeded by real development trajectories between users and agents. We evaluate each track using live game interaction, deterministic behavioral tests, or final product criteria with regression checks. The suite contains 97 generation tasks across 11 genres; 100 repair tasks from 50 game levels verified by humans, each with 19-27 injected bugs; and 17 optimization chains with six turns and 102 requests. Across the three tracks, current agents are more reliable at producing playable foundations and implementing explicit requirements than at discovering defects, verifying runtime behavior, and preserving functionality across changes.

### Prompt-Gaming: A Pilot Study on LLM-Evaluating Agent in a Meaningful Energy Game

**Code:** doi:10.1145/3613905.3650774

**Abstract:** Building on previous work on incorporating large language models (LLM) in gaming, we investigate the possibility of implementing LLM as evaluating agents of open-ended challenges in serious games and its potential to facilitate a meaningful experience for the player. We contribute with a sustainability game prototype in a single natural language prompt about energy communities and we tested it with 13 participants inside ChatGPT-3.5. Two participants were already aware of energy communities before the game, and eight of the remaining 11 gained valuable knowledge about the specific topic. Comparing ChatGPT-3.5 evaluations of players’ interaction with an expert’s assessment, ChatGPT-3.5 correctly evaluated 81% of player’s answers. Our results are encouraging and show the potential of using LLMs as mediating agents in educational games, while also allowing easy prototyping of games through natural language prompts.

### Communication between Frozen Large Language Models via Prompt Optimization in a Referential Game

**Code:** arXiv:2609.31989

**Abstract:** We study communication between two frozen large language models from different providers, with different tokenizers, accessed through their API endpoints. The two play a referential game: one sees an object and describes it in a short fixed-length message over a small alphabet; the other must pick that object out of a candidate set. Neither model's weights are updated. Each agent's prompt is rewritten by an isolated prompt optimizer whose reflection model reads that agent's scored interactions. In the positional setting, optimized prompts carry a shared code that generalizes to held-out objects above a measured no-codebook baseline, including when the memory window is removed. In a second setting, independent per-letter blocks no longer fit within the message, although a whole-object place value code does. The base system fails to establish reliable communication: the sender struggles to retain an injective rule, and the receiver has too few confirmed examples in view. A sender collision penalty, retention of successful interactions, and sequential optimization enable successful place value communication in some runs. Outcomes vary across runs and reflection models. In successful runs, the protocol is written into the optimized prompts, where it can be read and audited directly.

### Can Language Models Play the Wikipedia Game?

**Code:** arXiv:2610.13948

**Abstract:** Language models increasingly support or automate information retrieval from document collections too large to index. This task is difficult when it requires specialist linguistic or scientific knowledge. We used the Wikipedia Game to test language models on an analogous information retrieval task. In the game, players must reach a target article using only article links. We compared sentence embedding models and LLMs across five Wikipedia languages and five academic-literature datasets. We construct very large local graphs of Wikipedia pages and of paper citations using OpenAlex and provide code to build and navigate them. This allows the study of language models' navigation capabilities without relying on third-party APIs. We compared the models with human and TF-IDF benchmarks. The Wikipedia Game format enables robust comparisons across techniques, languages, and domains. No model significantly outperformed humans, although the best models (GPT-o3 mini, GPT-4o, QwQ:32B, and DeepSeek-R1:70B) achieved comparable success. Performance and rankings varied across languages and topics, with implications for practitioners utilising these techniques.

### Enhancing the Reasoning Capabilities of Large Language Models: From Game Playing to Embodied Planning

**Code:** Google Scholar cluster TXIE01RFZ4EJ

**Abstract:** (Scholar snippet; full abstract not found) … We begin by introducing Large Language Models and their reasoning capabilities, then discuss classical planning methods, and finally review related work in embodied AI and robotics …

### Hoodwinked: Deception and Cooperation in a Text-Based Game for Language Models

**Code:** arXiv:2308.01404

**Abstract:** Are current language models capable of deception and lie detection? We study this question by introducing a text-based game called $\textit{Hoodwinked}$, inspired by Mafia and Among Us. Players are locked in a house and must find a key to escape, but one player is tasked with killing the others. Each time a murder is committed, the surviving players have a natural language discussion then vote to banish one player from the game. We conduct experiments with agents controlled by GPT-3, GPT-3.5, and GPT-4 and find evidence of deception and lie detection capabilities. The killer often denies their crime and accuses others, leading to measurable effects on voting outcomes. More advanced models are more effective killers, outperforming smaller models in 18 of 24 pairwise comparisons. Secondary metrics provide evidence that this improvement is not mediated by different actions, but rather by stronger persuasive skills during discussions. To evaluate the ability of AI agents to deceive humans, we make this game publicly available at h https://hoodwinked.ai/ .

### Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games

**Code:** arXiv:2506.03610

**Abstract:** Large Language Model (LLM) agents are reshaping the game industry, by enabling more intelligent and human-preferable characters. Yet, current game benchmarks fall short of practical needs: they lack evaluations of diverse LLM capabilities across various game genres, studies of agentic modules crucial for complex gameplay, and fine-tuning datasets to adapt pre-trained LLMs into gaming agents. To fill these gaps, we present Orak, a benchmark for training and evaluating LLM agents across 12 popular video games spanning all major genres. Using a plug-and-play interface built on Model Context Protocol (MCP), Orak supports systematic and reproducible studies of agentic modules in varied game scenarios. We further release a fine-tuning dataset of expert LLM gameplay trajectories covering multiple genres, turning general LLMs into effective game agents. Orak offers a united evaluation framework, including game leaderboards, LLM battle arenas, and \fix{ablation studies} of input modality, agentic strategies, and fine-tuning effects, establishing a foundation towards versatile gaming agents. Code and datasets are available at https://github.com/krafton-ai/Orak and https://huggingface.co/datasets/KRAFTON/Orak.

### Probe by gaming: A game-based benchmark for assessing conceptual knowledge in llms

**Code:** Google Scholar cluster MHx0q_7dH6cJ

**Abstract:** (Scholar snippet; full abstract not found) … To evaluate player agents in CK-Arena, we analyze both objective outcomes 207 across multiple game instances and the statistical properties of their statements during gameplay. …

### Fairness in repeated games

**Code:** Google Scholar cluster qTZIA118IU8J

**Abstract:** (Scholar snippet; full abstract not found) … As we assume that the total material stakes of the repeated game become arbitrarily large, this means that every fairness equilibrium should yield the player at least (arbitrari ly close to) …

### A Survey on the Memory Mechanism of Large Language Model based Agents

**Code:** arXiv:2404.13501

**Abstract:** Large language model (LLM) based agents have recently attracted much attention from the research and industry communities. Compared with original LLMs, LLM-based agents are featured in their self-evolving capability, which is the basis for solving real-world problems that need long-term and complex agent-environment interactions. The key component to support agent-environment interactions is the memory of the agents. While previous studies have proposed many promising memory mechanisms, they are scattered in different papers, and there lacks a systematical review to summarize and compare these works from a holistic perspective, failing to abstract common and effective designing patterns for inspiring future studies. To bridge this gap, in this paper, we propose a comprehensive survey on the memory mechanism of LLM-based agents. In specific, we first discuss ''what is'' and ''why do we need'' the memory in LLM-based agents. Then, we systematically review previous studies on how to design and evaluate the memory module. In addition, we also present many agent applications, where the memory module plays an important role. At last, we analyze the limitations of existing work and show important future directions. To keep up with the latest advances in this field, we create a repository at \url{https://github.com/nuster1128/LLM_Agent_Memory_Survey}.

### GameArena: Evaluating LLM Reasoning through Live Computer Games

**Code:** arXiv:2412.06394

**Abstract:** Evaluating the reasoning abilities of large language models (LLMs) is challenging. Existing benchmarks often depend on static datasets, which are vulnerable to data contamination and may get saturated over time, or on binary live human feedback that conflates reasoning with other abilities. As the most prominent dynamic benchmark, Chatbot Arena evaluates open-ended questions in real-world settings, but lacks the granularity in assessing specific reasoning capabilities. We introduce GameArena, a dynamic benchmark designed to evaluate LLM reasoning capabilities through interactive gameplay with humans. GameArena consists of three games designed to test specific reasoning capabilities (e.g., deductive and inductive reasoning), while keeping participants entertained and engaged. We analyze the gaming data retrospectively to uncover the underlying reasoning processes of LLMs and measure their fine-grained reasoning capabilities. We collect over 2000 game sessions and provide detailed assessments of various reasoning capabilities for five state-of-the-art LLMs. Our user study with 100 participants suggests that GameArena improves user engagement compared to Chatbot Arena. For the first time, GameArena enables the collection of step-by-step LLM reasoning data in the wild.

### Real-Time World Crafting: Generating Structured Game Behaviors from Natural Language with Large Language Models

**Code:** arXiv:2510.16952

**Abstract:** We present a novel architecture for safely integrating Large Language Models (LLMs) into interactive game engines, allowing players to "program" new behaviors using natural language. Our framework mitigates risks by using an LLM to translate commands into a constrained Domain-Specific Language (DSL), which configures a custom Entity-Component-System (ECS) at runtime. We evaluated this system in a 2D spell-crafting game prototype by experimentally assessing models from the Gemini, GPT, and Claude families with various prompting strategies. A validated LLM judge qualitatively rated the outputs, showing that while larger models better captured creative intent, the optimal prompting strategy is task-dependent: Chain-of-Thought improved creative alignment, while few-shot examples were necessary to generate more complex DSL scripts. This work offers a validated LLM-ECS pattern for emergent gameplay and a quantitative performance comparison for developers.

### Optimal routing control: Repeated game approach

**Code:** Google Scholar cluster Bg0RyaOi1tYJ

**Abstract:** (Scholar snippet; full abstract not found) … are considered and modeled as noncooperative repeated games. Each user is interested … user no greater than its stage game NEP cost is shown for two-node multiple link networks. It is …

### FedNPC: A Federated Learning Framework for Large Language Models in Game NPCs

**Code:** doi:10.1109/SCOReD60679.2023.10563705

**Abstract:** In many modern video games, NPCs often remain unfazed while surrounded by a hail of bullets. The unrealistic behaviors exhibited by game agents can distract from player engagement and have become a significant concern with the recent integration of language models. To address the issue, this paper introduces a conceptual framework (FedNPC) based on centralized Federated Learning, with the objective of enhancing the integrated large language model by enabling NPCs to generate context-appropriate responses through learning from user interactions. This framework takes into account the virtual knowledge of the game and the unique characteristics of individual agents, facilitating model improvement, NPC personalization, and minimizing the impact of undesirable agent removal. The proposed framework is highly practical for implementation and offers valuable insights for industrial practitioners to utilize Federated Learning in game production. Additionally, this research work demonstrates an innovative application of Federated Learning in game development and large language model fine-tuning, highlighting numerous opportunities for further research in this domain.

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

### Ethical Coordination of LLM Multi-Agent Systems

**Code:** doi:10.3390/electronics15112278

**Abstract:** Embedding large language model (LLM) coordinators in production electronic systems, connected vehicles, multi-robot fabrics, IoT control loops, telecommunications orchestration, demands a pre-delivery filter stage that preserves ethical guarantees under adversarial influence at deployment scale. We present a constitutional governance layer that filters compiled influence policies before they reach a heterogeneous population of grounded LLM agents whose hybrid decision model combines a game-theoretic base probability with an LLM-evaluated narrative shift attenuated by per-agent resistance. Four experiments on a Barabási–Albert scale-free network of 30 agents powered by Llama-3.3-70B-Instruct show that the filter holds an Ethical Cooperation Score (ECS) of 0.176 (multi-seed mean 0.163, 95% confidence interval (CI) [0.150,0.174]) against an unconstrained baseline of ECS=0, enforced by a hard integrity gate (1.000 vs. 0.000). We surface an autonomy paradox in which unconstrained agents resist manipulation more forcefully (0.856 vs. 0.728) yet collapse to ECS=0, establishing that system-level integrity cannot be delegated to agent-level defence. The advantage is monotonic in resistance (+0.174 to +0.183), seed-stable (Cliff’s δ=1.0, complete separation), topology- and backbone-invariant across five contemporary LLMs, robust to alternative ECS formulations, and reproduces at N = 100. Against constitutional artificial intelligence (CAI) critique-revise and LlamaGuard-style safety-classifier baselines, the framework matches the integrity floor and adds a measurable margin on the secondary risk surface (burst timing, composite manipulation risk). The filter runs at 0.78 μs/call (≈1.3×106 decisions/s/core), supporting always-on deployment as a stateless, model-agnostic component of LLM agent pipelines in adversarially contested electronic systems.

### Rational Irrationality: Evaluating LLMs In Games With Strategic Behavior Discrepancies

**Code:** Google Scholar cluster GlCGevtq6N4J

**Abstract:** (Scholar snippet; full abstract not found) … LLM strategic behavior with human performance in classic GT experiments. Specifically, we investigate the behavior of LLM … -form TRAVELER’S DILEMMA. These games model a …

### Communication and Cooperation with Human and Artificial Agents

**Code:** Google Scholar cluster DlajU7yFMIoJ

**Abstract:** (Scholar snippet; full abstract not found) … To simulate the behavior of an LLM player, we utilized OpenAI’s GPT-3.5 Turbo model. The model was prompted with a string object that provided the game scenario and instructions, …

### Not a Monolith: Lab-Level Divergence in the Cooperative Equilibria of Chinese Frontier LLM Agents

**Code:** arXiv:2608.10262

**Abstract:** Does the cooperative bias documented for Western frontier LLM agents extend to a different alignment lineage, and should the Chinese models that embody it be treated as a single bloc or as distinct laboratories? We study four frontier-tier Chinese models - DeepSeek V4 Pro, Qwen3-Max, Kimi K2.5 and GLM-5.1 - in an evolutionary Iterated Prisoner's Dilemma, under a design that removes a confound present in prior work. Rather than letting each model convert its own natural-language strategies into code, which entangles strategic disposition with coding ability, we hold the converter fixed (GPT-5.4 Mini) across all labs, so every cross-lab comparison is a comparison of generation alone. We run the full protocol: all-play-all tournaments and a Moran process at n=500 runs per condition, across three prompt styles and four population regimes. Two pre-registered hypotheses are evaluated. H6 (not monolithic) is supported: the four labs differ significantly in aggressive-equilibrium proportion, P_A running from 1% for Qwen3-Max to 9% for DeepSeek V4 Pro, with four of six pairwise comparisons surviving Holm-Bonferroni. The spread across the four labs (P_A range 8pp) is larger than the difference between the Chinese and Western ecosystems' mean P_A (5.0% vs 5.0%): on this measure, within-ecosystem variation exceeds the East-West gap. H5 (cooperative-bias generality) is consistent but qualified: a cooperative plurality holds in 6 of 12 lab-prompt combinations against the 9 of 12 reported for Western models, a difference we do not treat as firm, since the count rests on Cooperative-Neutral near-ties and rises to 9/12 under an alternate converter in our pre-registered robustness check. The lab, not the ecosystem, is the unit at which cooperative disposition is set; treating "Chinese models" as a monolith is not supported by the evidence.

### Competitive Dynamics of Ranking Manipulations on Large Language Model-Based Search Engines

**Code:** Google Scholar cluster wklypGMH_K0J

**Abstract:** (Scholar snippet; full abstract not found) … a coherent prompt that provides a comprehensive context for the LLM’s response generation. This integrated prompt ensures that the LLM aligns effectively with the user’s intent as …

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

### Can We Trust the Machine? LLMs Mimic Human Expected Utility Theory Violations and Its Impact on Decision and Negotiation Systems

**Code:** Google Scholar cluster 6U7bjbSGXXIJ

**Abstract:** (Scholar snippet; full abstract not found) … One core insight of our results is that the placement of an LLM within the decision pipeline determines whether its human-like reasoning enhances or undermines group rationality (…

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

### “Tipping the Balance”: Human Intervention in Large Language Model Multi‐Agent Debate

**Code:** doi:10.1002/pra2.1034

**Abstract:** Methods for eliciting reasoning from large language models (LLMs) are shifting from filtering natural language “prompts” through contextualized “personas,” towards structuring conversations between LLM instances, or “agents.” This work expands upon LLM multiagent debate by inserting human opinion into the loop of generated conversation. To simulate complex reasoning, LLM instances were given United States district court decisions and asked to debate whether to “affirm” or “not affirm” the decision. Agents were examined in three phases: “synthetic debate,” where one LLM instance simulated a three‐agent discussion; “multiagent debate,” where three LLM instances discussed among themselves; and “human‐AI debate,” where multiagent debate was interrupted by human opinion. During each phase, a nine‐step debate was simulated one‐hundred times, yielding 2,700 total debate steps. Resulting conversations generated by synthetic debate followed a pre‐set cadence, proving them ineffective at simulating individual agents and confirming that mechanism engineering is critical for multiagent debate. Furthermore, the reasoning process backing multiagent decision‐making was strikingly similar to human decision‐making. Finally, it is discovered that while LLMs do weigh human input more heavily than AI opinion, it is only by a small threshold. Ultimately, this work asserts that careful, human‐in‐the‐loop framework is critical for designing value‐aware, agentic AI agents.

### Conformity, Inertia, and Value Alignment in Multi-Turn LLM Deliberation

**Code:** Google Scholar cluster NwFo0e00snsJ

**Abstract:** (Scholar snippet; full abstract not found) … Multi-agent debate (or deliberation) has emerged as a promising approach for examining LLM 32 behavior in multi-turn settings [14, 15, 16, 17]. Prior work shows that deliberation can …

### Is Anyone Enforcing the Cartel? What Reinforcement Learning Teaches LLM Agents in Markets

**Code:** arXiv:2610.28787

**Abstract:** Evaluations of large language model (LLM) agents report that pricing agents collude at others' expense. Yet collusion is defined by enforcement: a cartel, in which competitors share monopoly profits, holds only if a member who cheats is punished. We introduce an audit that tests enforcement by forcing a member to cheat in counterfactual copies of a market, and use it to study what reinforcement learning (RL) teaches agents in pricing and trading. Small LLMs trained by RL learn what their training rivals reward, but only what they readily try. In self-play, they learn fixed rules ignoring their rivals; against a punishing rival, to be deterred; against a cheating rival, to match its cuts, never the costly price war that would deter it, which they rarely try. A war forced into training is learned, but mostly only where it was forced. Against their own copies, deterred and matching agents can earn the same cartel profits, but only matching ones can enforce them, and then thinly: as a by-product and only against large cuts. Q-learners enforce collusion only in pricing. Prompted LLMs reach cartel-like outcomes mostly through rules that ignore the market. Outcome measures cannot tell these cases apart; the audit can.

### An evolutionary model of personality traits related to cooperative behavior using a large language model

**Code:** arXiv:2310.05976

**Abstract:** This paper aims to shed light on the evolutionary dynamics of diverse and social populations by introducing the rich expressiveness of generative models into the trait expression of social agent-based evolutionary models. Specifically, we focus on the evolution of personality traits in the context of a game-theoretic relationship as a situation in which inter-individual interests exert strong selection pressures. We construct an agent model in which linguistic descriptions of personality traits related to cooperative behavior are used as genes. The deterministic strategies extracted from Large Language Model (LLM) that make behavioral decisions based on these personality traits are used as behavioral traits. The population is evolved according to selection based on average payoff and mutation of genes by asking LLM to slightly modify the parent gene toward cooperative or selfish. Through preliminary experiments and analyses, we clarify that such a model can indeed exhibit the evolution of cooperative behavior based on the diverse and higher-order representation of personality traits. We also observed the repeated intrusion of cooperative and selfish personality traits through changes in the expression of personality traits, and found that the emerging words in the evolved gene well reflected the behavioral tendency of its personality in terms of their semantics.

### To Nuke or Not to Nuke: LLMs' (Missing) Ethical Reasoning and Actions in a High-Stakes Decision-Making Simulation

**Code:** arXiv:2606.08310

**Abstract:** Large language models (LLMs) are increasingly deployed as long-horizon agents with decision-making capacities. While LLMs can show ethical competence on dilemmas such as trolley problems, this competence may not translate to complex, agentic scenarios. We study this gap in Civilization V, a multiplayer game with a complex decision-making landscape including economy, diplomacy, technology, and military strategy. Starting from 130 high-tension LLM self-play episodes, in which an LLM player spontaneously escalated nuclear authorization, we replay them across 13 models with three prompt interventions: an ethical prompt naming nuclear harm, removal of the previous model's decision-making rationale, and high-stakes framing emphasizing real-world impacts. No interventions nor their combinations reliably eliminate emergent escalation. We identify three failure pathways: ethical reasoning that fails to surface without prompting, fails to appear even when prompted, or surfaces but fails to take effect when strategic counter-factors dominate. Evaluations of agentic models, therefore, must test whether ethical reasoning is spontaneously invoked and behaviorally effective in complex decision-making contexts, beyond whether it can be elicited in isolation.

### Serious Games: Human-AI Interaction, Evolution, and Co-evolution

**Code:** arXiv:2505.16388

**Abstract:** The serious games between humans and AI have only just begun. Evolutionary Game Theory (EGT) models the competitive and cooperative strategies of biological entities. EGT could help predict the potential evolutionary equilibrium of humans and AI. The objective of this work was to examine EGT models relevant to human-AI interaction, evolution, and co-evolution. Of the 13 EGT models considered, three were examined: the Hawk-Dove (HD) Game, the Iterated Prisoner’s Dilemma (IPD), and the War of Attrition (WOA). The rationale for this selection is that these three models represent canonical archetypes of EGT and are relevant to basic human-AI interaction. The HD Game predicts balanced mixed-strategy equilibria based on the costs of conflict. The IPD suggests that repeated interaction may lead to cognitive co-evolution. The WOA suggests that competition for resources may result in strategic co-evolution, asymmetric equilibria, and conventions on sharing resources. Each model was examined from the perspective of human and AI decision-making, from psychological and biological perspectives, and from an AI viewpoint. AI is being shaped by human input and is evolving in response to it. So too, neuroplasticity allows the human brain to evolve in response to stimuli. If humans and AI converge in the future, what might be the result of human neuroplasticity combined with an ever-evolving AI? There are profound ethical and cognitive implications. EGT may provide a suitable framework to understand and predict human-AI interaction, evolution, and co-evolution. However, future research should extend beyond EGT and explore additional frameworks, empirical validation methods, and interdisciplinary perspectives. In the spirit of further exploration, an illustrative computational simulation is provided.

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

### Can an LLM Learn Preferences from Choice Data?

**Code:** arXiv:2401.07345

**Abstract:** Can large language models (LLMs) learn a decision maker's preferences from observed choices and generate preference-consistent recommendations in new situations? We propose a portable Simulate-Recommend-Evaluate framework that tests preference learning from revealed-choice data by comparing LLM recommendations with optimal choices implied by known preference primitives. We apply the framework to choice under uncertainty using the disappointment aversion model. Recommendation accuracy improves as models observe more choices, but learning is heterogeneous across preference types and LLMs: GPT learns risk aversion better than disappointment aversion, Gemini performs best in high disappointment-aversion regions, and Claude shows the broadest effective learning across parameter regions.

### The Impact of Protocol Mechanics and Model Capacity on Emergent Behavior in Multilateral LLM Negotiations

**Code:** Google Scholar cluster paJ5yZAMKDcJ

**Abstract:** (Scholar snippet; full abstract not found) … First, we demonstrate that LLM cooperation is not a fixed trait, but a strategic adaptation highly sensitive to protocol design. Second, we reveal a critical divergence: lightweight models …

### Strategic Collusion of LLM Agents: Market Division in Multi-Commodity Competitions

**Code:** arXiv:2410.00031

**Abstract:** Machine-learning technologies are seeing increased deployment in real-world market scenarios. In this work, we explore the strategic behaviors of large language models (LLMs) when deployed as autonomous agents in multi-commodity markets, specifically within Cournot competition frameworks. We examine whether LLMs can independently engage in anti-competitive practices such as collusion or, more specifically, market division. Our findings demonstrate that LLMs can effectively monopolize specific commodities by dynamically adjusting their pricing and resource allocation strategies, thereby maximizing profitability without direct human input or explicit collusion commands. These results pose unique challenges and opportunities for businesses looking to integrate AI into strategic roles and for regulatory bodies tasked with maintaining fair and competitive markets. The study provides a foundation for further exploration into the ramifications of deferring high-stakes decisions to LLM-based agents.

## LLM AND inspection game

### ERGA: An Explorer–Refiner Game with Backdoor-Adjusted Verdict Aggregation for LLM-based Claim Verification

**Code:** Google Scholar cluster oOeThpneeO0J

**Abstract:** (Scholar snippet; full abstract not found) … an Explorer– Refiner Game with Backdoor-Adjusted Verdict Aggregation for LLM-based complex fact… The core idea is to use an adversarial state-editing game to balance two competing …

### LLM-assisted quality-aware GA–multi-agent deep deterministic policy gradient framework for multi-robot collaborative scheduling in construction quality control

**Code:** Google Scholar cluster PpdUv0TigjIJ

**Abstract:** (Scholar snippet; full abstract not found) … large language model (LLM) semantic feedback layer that interprets inspection data, assists … is modeled as a partially observable Markov game and solved using the centralized training …

### Institutional AI: Governing LLM Collusion in Multi-Agent Cournot Markets via Public Governance Graphs

**Code:** arXiv:2601.11369

**Abstract:** Multi-agent LLM ensembles can converge on coordinated, socially harmful equilibria. This paper advances an experimental framework for evaluating Institutional AI, our system-level approach to AI alignment that reframes alignment from preference engineering in agent-space to mechanism design in institution-space. Central to this approach is the governance graph, a public, immutable manifest that declares legal states, transitions, sanctions, and restorative paths; an Oracle/Controller runtime interprets this manifest, attaching enforceable consequences to evidence of coordination while recording a cryptographically keyed, append-only governance log for audit and provenance. We apply the Institutional AI framework to govern the Cournot collusion case documented by prior work and compare three regimes: Ungoverned (baseline incentives from the structure of the Cournot market), Constitutional (a prompt-only policy-as-prompt prohibition implemented as a fixed written anti-collusion constitution, and Institutional (governance-graph-based). Across six model configurations including cross-provider pairs (N=90 runs/condition), the Institutional regime produces large reductions in collusion: mean tier falls from 3.1 to 1.8 (Cohen's d=1.28), and severe-collusion incidence drops from 50% to 5.6%. The prompt-only Constitutional baseline yields no reliable improvement, illustrating that declarative prohibitions do not bind under optimisation pressure. These results suggest that multi-agent alignment may benefit from being framed as an institutional design problem, where governance graphs can provide a tractable abstraction for alignment-relevant collective behavior.

### When Identity Overrides Incentives: Representational Choices as Governance Decisions in Multi-Agent LLM Systems

**Code:** arXiv:2601.10102

**Abstract:** Multi-agent systems built on large language models are increasingly deployed in strategic policy and governance settings, where agents representing stakeholders with conflicting interests must coordinate under shared constraints. These systems typically assign role-based personas to agents, describing their motivations and objectives. Whether agents with role-based identities follow explicit payoffs or their assigned roles in strategic decision-making remains untested. Here we show that assigning role-based personas suppresses payoff-aligned behavior in four-agent strategic games, shifting equilibrium attainment by up to 90 percentage points even when agents have complete payoff information. We test a 2x2 factorial design (persona presence x payoff visibility) across four models (Qwen-7B, Qwen-32B, Llama-8B, Mistral-7B), and 53 environmental policy scenarios with two equilibria: Tragedy of the Commons, where individual payoff dominates, and Green Transition, where collective payoff dominates. With personas present, all models reach near-zero Tragedy equilibrium in the Tragedy-dominant scenarios despite complete payoff information, and 100% of equilibria correspond to Green Transition. No model reaches Tragedy equilibrium by removing personas alone; only Qwen models reach 65-90% Tragedy equilibrium rates when personas are removed, and payoffs are made explicit. Three distinct behavioral profiles emerge: Qwen shifts equilibrium selection based on framing condition, Mistral increases response variance without reaching the Tragedy equilibrium, and Llama holds near-constant across all conditions. Representational choices in multi-agent LLM systems are governance decisions: persona assignment determines which equilibrium a simulation produces, independent of the underlying incentive structure.

### Human-AI Collaboration in Requirements Engineering: Evidence of the Negative Effect of LLMs on Requirements Inspection

**Code:** arXiv:2608.21298

**Abstract:** Background. Requirements inspection (RI) is a well-established practice for detecting potential defects in requirements artifacts early in the software lifecycle. Recent advances in large language models (LLMs) have stimulated interest in their potential to support requirements engineering (RE) tasks. However, empirical evidence on the effects of LLMs when used as collaborative assistants in human-performed RI remains scarce. Aims. We aim to investigate the impact of LLM support on human-performed RI, considering inspection effectiveness in terms of smell identification and severity classification (i.e., nocuous vs innocuous), as well as inspection duration. Method. We conducted a controlled crossover design experiment with 34 participants, who inspected textual specifications with and without LLM support, identifying and classifying requirements smells while recording inspection time. We analyzed the data using one Bayesian regression model per outcome variable, accounting for validity threats induced by the crossover design as well as covariates and mediators. Results. Results show that LLM support negatively affects smell detection accuracy but has no significant effect on smell classification or task duration. A learning effect is present across experimental periods, but reduced when RI is first performed with LLM support. Conclusions. Our findings provide empirical evidence that LLM support does not necessarily improve performance and may, instead, hinder it for novice inspectors. Moreover, the results suggest that learning RI with LLM-support from the beginning may slow down the skill acquisition process, implying threats for LLM-supported learning.

### MultiAgentBench: Evaluating the Collaboration and Competition of LLM agents

**Code:** arXiv:2503.01935

**Abstract:** Large Language Models (LLMs) have shown remarkable capabilities as autonomous agents, yet existing benchmarks either focus on single-agent tasks or are confined to narrow domains, failing to capture the dynamics of multi-agent coordination and competition. In this paper, we introduce MultiAgentBench, a comprehensive benchmark designed to evaluate LLM-based multi-agent systems across diverse, interactive scenarios. Our framework measures not only task completion but also the quality of collaboration and competition using novel, milestone-based key performance indicators. Moreover, we evaluate various coordination protocols (including star, chain, tree, and graph topologies) and innovative strategies such as group discussion and cognitive planning. Notably, gpt-4o-mini reaches the average highest task score, graph structure performs the best among coordination protocols in the research scenario, and cognitive planning improves milestone achievement rates by 3%. Code and datasets are public available at https://github.com/MultiagentBench/MARBLE.

### Cards Against Contamination: TCG-Bench for Difficulty-Scalable Multilingual LLM Reasoning

**Code:** doi:10.18653/v1/2026.findings-eacl.353

**Abstract:** ,

### Semantic Cooperative Games for Contribution Attribution in LLM-Based Multi-Agent Systems

**Code:** arXiv:2607.18255

**Abstract:** Contribution attribution has become a central problem in LLM-based multi-agent systems, where final outputs are produced through multiple agents, message exchanges, and ordered workflow dependencies. Existing attribution methods often rely on counterfactual valuation, such as removing agents or comparing score changes across altered agent subsets. In language-mediated workflows, these methods require repeated model calls, introduce high variance, and do not explicitly capture the intermediate semantic states through which agents produce, preserve, and transform task-relevant information. We propose Semantic Cooperative Games (SCG), a framework that represents a realized language flow as a semantic generation hypergraph and induces an agent-level semantic value function on this structure. We define the Semantic Shapley Value (SSV) to allocate contribution over semantic support logic, and introduce SLIC, a single-trajectory algorithm that constructs the semantic hypergraph, recovers minimal semantic supports, applies Boolean absorption, and computes SSV without rerunning agent subsets. We prove that SSV reduces to the classical Shapley value under standard set-based, fully observable, and no-order-dependence conditions. On a medical benchmark satisfying these conditions, SLIC reduces computation cost by 93.3% while remaining highly consistent with a Monte Carlo Shapley baseline. In more general multi-role workflows, SSV aligns with perturbation-induced score-drop profiles and exposes cases where semantic contribution and failure impact diverge. Overall, SLIC provides a fast, counterfactual-free, and interpretable attribution method for complex LLM-based multi-agent systems.

### Mitigating Emergent Collusion in LLM Pricing Agents

**Code:** arXiv:2609.13037

**Abstract:** Recent work shows that LLM-based pricing agents can produce supracompetitive outcomes in repeated oligopoly environments without being explicitly instructed to collude. We reproduce the qualitative prompt-sensitivity effect of Fish et al. using DeepSeek-V3.1: the P1 prompt produces significantly higher prices and profits than P2, although our outcomes are less monopoly-like than the original GPT-4 results. We then evaluate three regulatory interventions: a prompt-only warning, a Harrington-inspired expected-damages payoff regulator, and an active random entrant. The prompt-only regulator reduces but does not eliminate above-Nash pricing. The Harrington regulator brings P1 outcomes close to the duopoly Nash benchmark and removes the statistically significant P1--P2 gap. The active entrant produces the strongest effect, pushing both prompts below the appropriate random-entrant Nash benchmark. Overall, our experiments provide preliminary evidence that interventions that alter incentives or market participation can reduce supracompetitive pricing more effectively than prompt warnings alone.

### Cybersecurity AI: A Game-Theoretic AI for Guiding Attack and Defense

**Code:** arXiv:2601.05887

**Abstract:** AI-driven penetration testing now executes thousands of actions per hour but still lacks the strategic intuition humans apply in competitive security. To build cybersecurity superintelligence --Cybersecurity AI exceeding best human capability-such strategic intuition must be embedded into agentic reasoning processes. We present Generative Cut-the-Rope (G-CTR), a game-theoretic guidance layer that extracts attack graphs from agent's context, computes Nash equilibria with effort-aware scoring, and feeds a concise digest back into the LLM loop \emph{guiding} the agent's actions. Across five real-world exercises, G-CTR matches 70--90% of expert graph structure while running 60--245x faster and over 140x cheaper than manual analysis. In a 44-run cyber-range, adding the digest lifts success from 20.0% to 42.9%, cuts cost-per-success by 2.7x, and reduces behavioral variance by 5.2x. In Attack-and-Defense exercises, a shared digest produces the Purple agent, winning roughly 2:1 over the LLM-only baseline and 3.7:1 over independently guided teams. This closed-loop guidance is what produces the breakthrough: it reduces ambiguity, collapses the LLM's search space, suppresses hallucinations, and keeps the model anchored to the most relevant parts of the problem, yielding large gains in success rate, consistency, and reliability.

### Choosing LLMs for Strategic Agent Interactions

**Code:** arXiv:2610.18354

**Abstract:** Game-theoretic benchmarks claim that large language model (LLM) strategic decision-making varies across game types, interaction structures, and capability dimensions. However, they only evaluate strategic performance across individual fixed models. In parallel, contemporary LLM routers pick models under quality-cost trade-offs, but with no notion of a strategic structure. They do not account for an opponent that might be unknown, and that can adapt over time and shift the feedback signal. To address this, we extend the game-theoretic evaluations and define strategic selection as the meta game layered on top of the base game. In each round, a strategic selector fields an LLM from a portfolio of models to navigate a game payoff matrix that is latent and learned online. We find that the evaluation signal is game-specific, and that extracting a reliable signal requires a much higher number of seed runs $N$ compared to traditional benchmarking setups. Evaluating across 5 games and 10 LLMs, we show a model's strategic competence varies significantly depending on the game setup and the opponent faced. Building on this, we implement a suite of selector methods and find that approaches that rely on query embeddings or LLM self-reflection do not consistently capture the underlying strategic signal. A lightweight multi-armed bandit algorithm performs more reliably across games, though it still falls short of the best fixed model. Finally, we show that simple non-stationary and adversarial bandit variants fail to outperform a stationary bandit baseline, pointing to a gap in how current methods handle a shifting opponent in strategic settings.

### "To Survive, I Must Defect": Jailbreaking LLMs via the Game-Theory Scenarios

**Code:** arXiv:2511.16278

**Abstract:** As LLMs become more common, non-expert users can pose risks, prompting extensive research into jailbreak attacks. However, most existing black-box jailbreak attacks rely on hand-crafted heuristics or narrow search spaces, which limit scalability. Compared with prior attacks, we propose Game-Theory Attack (GTA), an scalable black-box jailbreak framework. Concretely, we formalize the attacker's interaction against safety-aligned LLMs as a finite-horizon, early-stoppable sequential stochastic game, and reparameterize the LLM's randomized outputs via quantal response. Building on this, we introduce a behavioral conjecture "template-over-safety flip": by reshaping the LLM's effective objective through game-theoretic scenarios, the originally safety preference may become maximizing scenario payoffs within the template, which weakens safety constraints in specific contexts. We validate this mechanism with classical game such as the disclosure variant of the Prisoner's Dilemma, and we further introduce an Attacker Agent that adaptively escalates pressure to increase the ASR. Experiments across multiple protocols and datasets show that GTA achieves over 95% ASR on LLMs such as Deepseek-R1, while maintaining efficiency. Ablations over components, decoding, multilingual settings, and the Agent's core model confirm effectiveness and generalization. Moreover, scenario scaling studies further establish scalability. GTA also attains high ASR on other game-theoretic scenarios, and one-shot LLM-generated variants that keep the model mechanism fixed while varying background achieve comparable ASR. Paired with a Harmful-Words Detection Agent that performs word-level insertions, GTA maintains high ASR while lowering detection under prompt-guard models. Beyond benchmarks, GTA jailbreaks real-world LLM applications and reports a longitudinal safety monitoring of popular HuggingFace LLMs.

### BazaarBench: Delegation Safety in Decentralized C2C Marketplaces Run by LLM Agents

**Code:** arXiv:2610.06748

**Abstract:** In decentralized consumer-to-consumer (C2C) marketplaces, people list goods, negotiate with strangers, and rate one another, so trust rests on reputation. Large language model (LLM) agents now act for users, raising risks to their money, privacy, and reputation. We introduce BazaarBench, a simulated C2C marketplace and benchmark for evaluating the safety of these agents. It tracks ownership, item condition, and commitments across transactions, combining record checks with rubric-based LLM judgments to identify six failure types across five stages. We run three base markets for 30 simulated days, each with 100 agents using one model and inventories drawn from a public eBay sample. Across 45 continuations, we evaluate five models under ordinary instructions, deadline pressure, or adversarial instructions to exploit other traders. Each continuation runs for seven simulated days from a copy of a market's day-30 state. The tested model controls the same 20 selected agents, retaining their personas, inventories, and histories, while the other 80 keep the base model. All five models attempt to promise the same item to multiple buyers under ordinary instructions. Adding targets and deadlines increases these attempts for every model. Under adversarial instructions, the share of tested sellers' committed transactions completed despite unavailable items or overstated conditions rises from 15.4% to 33.4%, reaching 55.5% for GPT-5.4. Averaged across models and markets, simulated weekly earnings per tested agent rise from USD 20 under ordinary instructions to USD 33 under adversarial instructions. Most of the increase comes from items the sellers never held. We release the simulator, saved market states, evaluation code, and records covering 357,608 agent model calls for evaluating new models and developing safer marketplace agents.

### Playing social deduction games with reinforcement fine-tuned large language models

**Code:** arXiv:2610.04261

**Abstract:** Reinforcement fine-tuning (RFT) is increasingly used in applications where large language models (LLMs) interact with humans and other agents. Here we use social deduction games to study how RFT changes LLMs' social behaviour. We let fine-tuned and base LLM agents play hidden-role games that require hidden-state inference, social reading and vote steering. Our results show that LLM agents do not reliably acquire social-deduction ability by directly optimizing terminal win--loss outcomes, suggesting that final game results provide a sparse and noisy signal for socially interactive learning. However, RFT is particularly effective at improving social reading, including tasks that require agents to infer hidden roles from public discussion, update beliefs over time and predict other agents' future decisions. We further show that RFT can also improve social influence, including tasks that require agents to steer votes, team approvals and collective decisions, although these gains depend more strongly on behaviourally specific rewards and structured interaction settings. Finally, we show that LLMs' ability to play social deduction games can be further improved through multi-agent social-cognitive reinforcement fine-tuning, which combines social-reading and social-influence signals during same-side multi-agent training. These learned behaviours also receive more favourable human evaluations of strategic competence, persuasiveness and social usefulness. Together, these results enrich our understanding of how RFT changes LLMs' social behaviour and provide a step toward a behavioural learning theory for machine social intelligence.

### Steering Language Models with Game-Theoretic Solvers

**Code:** arXiv:2402.01704

**Abstract:** Mathematical models of interactions among rational agents have long been studied in game theory. However these interactions are often over a small set of discrete game actions which is very different from how humans communicate in natural language. To bridge this gap, we introduce a framework that allows equilibrium solvers to work over the space of natural language dialogue generated by large language models (LLMs). Specifically, by modelling the players, strategies and payoffs in a "game" of dialogue, we create a binding from natural language interactions to the conventional symbolic logic of game theory. Given this binding, we can ask existing game-theoretic algorithms to provide us with strategic solutions (e.g., what string an LLM should generate to maximize payoff in the face of strategic partners or opponents), giving us predictors of stable, rational conversational strategies. We focus on three domains that require different negotiation strategies: scheduling meetings, trading fruit and debate, and evaluate an LLM's generated language when guided by solvers. We see that LLMs that follow game-theory solvers result in dialogue generations that are less exploitable than the control (no guidance from solvers), and the language generated results in higher rewards, in all negotiation domains. We discuss future implications of this work, and how game-theoretic solvers that can leverage the expressivity of natural language can open up a new avenue of guiding language research.

### A Serious Game For Enhancing LLM Literacy Among Non-Technical Users

**Code:** Google Scholar cluster ZpKdIUN7u-EJ

**Abstract:** (Scholar snippet; full abstract not found) … This thesis presents the design, development, and evaluation of a serious game that aims to improve LLM literacy. The game uses short interactive levels to simulate four targeted LLM …

### Towards Policy Development for LLM-Assisted Software Engineering: A Case Study on LLM-Assisted Bug Fixing

**Code:** Google Scholar cluster LojF554PUN0J

**Abstract:** (Scholar snippet; full abstract not found) … this University may make it freely available for inspection. I further agree that permission for copying … This distinction is useful in our context because we analyze survey data using game-…

### Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games

**Code:** arXiv:2604.04703

**Abstract:** Large language models (LLMs) are bringing richer dialogue and social behavior into games, but they also expose a control problem that existing game interfaces do not directly address: how should LLM characters participate in live multiplayer interaction while remaining executable in the shared game world, socially coherent with other active characters, and steerable by players when needed? We frame this problem as bounded autonomy, a control architecture for live multiplayer games that organizes LLM character control around three interfaces: agent-agent interaction, agent-world action execution, and player-agent steering. We instantiate bounded autonomy with probabilistic reply-chain decay, an embedding-based action grounding pipeline with fallback, and whisper, a lightweight soft-steering technique that lets players influence a character's next move without fully overriding autonomy. We deploy this architecture in a live multiplayer social game and study its behavior through analyses of interaction stability, grounding quality, whisper intervention success, and formative interviews. Our results show how bounded autonomy makes LLM character interaction workable in practice, frames controllability as a distinct runtime control problem for LLM characters in live multiplayer games, and provides a concrete exemplar for future games built around this interaction paradigm.

### Social Gym and SPaRTan: Benchmarking and Improving LLM Social Reasoning via Multi-Agent Game Tournaments

**Code:** arXiv:2608.09128

**Abstract:** LLM agents are increasingly deployed in multi-agent social settings where they must cooperate, negotiate, and adapt to other agents. Measuring and improving these social skills is hard because, unlike math or logic, social interaction offers no objective ground truth: evaluations fall back on LLM judges, which are costly, subjective, and noisy, and models get no reliable signal to learn from. To address both, we first introduce Social Gym, an environment of 21 multi-agent social games (e.g., Werewolves, Resistance, Spyfall) whose rule-decided outcomes make agent performance verifiable and objective, with an Elo tournament that produces a cross-game leaderboard. Benchmarking experiments show that while GPT-5-mini tops the leaderboard, no model excels at all games uniformly or in all game roles, pointing to limitations of social reasoning. Motivated by this, we additionally propose SPaRTan (Self-Play and Reflect-Transfer), a training-free self-improvement loop: a model plays a game, reflects on its trajectories and their outcomes to produce a transferable playbook, and applies that playbook in subsequent games. Our results show that SPaRTan playbooks help GPT-5-mini agents level their performance on weaker roles, but largely do not improve Qwen3-32B's performance. Together, Social Gym and SPaRTan offer a reproducible, verifiable foundation for measuring and improving LLM social reasoning without weight updates.

### Monitoring and Discovering Reward Hacking with Internal Representations during LLM Evaluations

**Code:** arXiv:2609.19101

**Abstract:** As models scale, reward hacking becomes more frequent, more sophisticated, and more consequential. Does it leave a telltale signature in model representations? This work analyzes how reward hacking is represented internally in frontier open source LLMs, and how those representations can be used to understand and discover the range of hacking behaviors a model displays. In particular, we find that simple difference of means vectors coherently represent reward hacking in Kimi K3, GLM 5.2, and Qwen 3.8 Max across a variety of behaviors in common evaluations. Despite their simplicity, these vectors are both generalizable and interpretable, and we can use them to reliably detect reward hacking. We first evaluate reward hacking in commonly reported benchmarks like DeepSWE and SWE-bench, finding that models reward hack excessively in these environments; GLM 5.2 hacks in 57.2% of rollouts on DeepSWE and in 73% of rollouts on SWE-bench. Catching these requires monitors; LLM monitors are effective, but expensive detectors. We show that DoM vectors are similarly effective but virtually free, catching 3.1% more hacks in Kimi K3 and 7.9% fewer hacks in GLM 5.2 on DeepSWE at a monitor matched false positive rate. DoM vectors run on the chain-of-thought also predict reward hacks in the model's subsequent actions, meaning we can run them online and catch potential hacks before they occur. Finally, we analyze probe-hits that LLM monitors do not catch and discover other undesirable behaviors, as well as show transfer to finding hacks in non-SWE evaluations. Together, these results provide evidence that simple, white-box methods can be used to scalably study and monitor reward hacking behaviors in frontier open source models

### Procedural Graphs: Self-Evolving Execution Structures for LLM Agents

**Code:** arXiv:2609.09153

**Abstract:** Large language models are increasingly deployed as agents that plan over long horizons and act through external tools. Most agents select actions through unconstrained generation over an accumulating history, leaving implicit the procedural knowledge of what to do, in what order, and under which conditions. As trajectories lengthen, agents can lose track of their objectives, invoke tools out of order, and repeat unproductive actions. We introduce the Procedural Graph: just as a knowledge graph organizes factual knowledge into (entity, relation, entity) triplets for what-is questions, a Procedural Graph organizes procedural knowledge into (procedure, relation, procedure) triplets for what-to-do questions. At each decision step, the framework localizes the agent's active node, and a guidance model translates the surrounding subgraph into step-level situational guidance that biases the solver's next action without dictating it. The graph is self-evolving: an LLM refiner contrasts failed trajectories with successful ones and edits the graph's topology and attributes, committing edits that preserve or improve held-out validation performance while retaining rejected ones to discourage repetition. Starting from a minimal skeleton, the loop builds graphs that match or surpass hand-designed ones. It can also repair a flawed expert prior. Across multiple datasets, task types, and LLMs, the Procedural Graph delivers consistent gains over memory-based baselines, and self-evolution further improves performance without manual engineering.

### Faithful yet Collusive: Why Chain-of-Thought Monitoring Cannot Detect Collusion in LLM Pricing Agents under Oligopolistic Competition

**Code:** arXiv:2609.18346

**Abstract:** Large language models (LLM) deployed as autonomous pricing agents may sustain supracompetitive prices through tacit coordination. We develop a causal graph divergence framework that separately measures structural faithfulness and intent faithfulness of LLM pricing agents in Bertrand competition. Across nine LLMs under duopoly and triopoly conditions, collusive behavior and chain-of-thought (CoT) faithfulness dissociate along both dimensions: the most collusive model accurately reports cooperative intent yet reasons structurally unfaithfully, while the most structurally faithful model sustains supra-Nash pricing under both market structures. These findings establish that CoT monitoring alone cannot serve as a standalone safeguard against algorithmic collusion.

### MASBench: Benchmarking LLM-based Multi-Agent Collaboration under Partial Observability

**Code:** arXiv:2610.04672

**Abstract:** Large language models (LLMs) have progressively evolved into the core of autonomous agents. Building on this progress, LLM-based multi-agent systems (MAS) coordinate multiple agents into a synergistic team to accomplish complex tasks that exceed the capabilities of individual agents. The effectiveness of such systems depends not only on the agents themselves, but also on how collaboration mechanisms are designed and organized. Note that real-world collaboration is typically partially observable, where each agent can only access partial information about the environment due to physical or privacy-related constraints. However, many existing multi-agent benchmarks assume global observability, and leave limited support for systematically evaluating collaboration mechanisms. To bridge this gap, we introduce MASBench, a multi-agent collaboration benchmark designed under partially observable constraints. It is organized into three progressive task categories: Reasoning, Scheduling, and Game. Through this structure, we progressively evaluate three representative collaboration mechanisms: Protocol, Memory, and Routing. MASBench further provides deterministic evaluation metrics, including performance score, communication cost, and cost effectiveness, to characterize both collaboration outcomes and communication overhead. Experiments across diverse LLM backbones and mechanism configurations offer empirical guidance for effective MAS design. Code is available at: https://github.com/BUPT-GAMMA/MASBench

### Implicit Manipulation for Skill Selection in LLM Agents with Semantic Matching

**Code:** arXiv:2609.02035

**Abstract:** Skill selection is a key stage in LLM-agent workflows, determining which installed skill should handle a user request. Existing attacks on this stage primarily rely on explicit prompt injection or instruction-level steering, which can expose recognizable manipulation signals. In this work, we identify a new implicit attack surface for skill selection: even when the user prompt and skill description appear benign in isolation, their semantic relationship can still be strategically shaped to favor an attacker-chosen skill. Based on this observation, we present Implicit Skill-Selection Manipulation via Semantic Matching (ISM), which jointly shapes target-skill metadata and reusable prompts to manipulate skill selection without explicit selection instructions. Specifically, we develop a three-stage strategy to broaden semantic coverage, strengthen target distinctiveness, and preserve natural prompt wording. Across four task domains and eight selector models, ISM increases the average target-selection rate (TSR) from 15.2% to 63.5%. In a matched comparison, ISM achieves a 73.5% TSR, only 9.8 percentage points below Explicit Steering. Human reviewers block ISM in only 2.9% of judgments, versus 91.4% for Explicit Steering, while five LLM-based inspectors pass ISM at an average rate of 82.9%, versus 37.4% for Explicit Steering. Moreover, ISM remains effective against PPL-W, Llama Prompt Guard 2, and PIGuard.

### Benchmarking LLM Judges for Mobile Agent Evaluation

**Code:** arXiv:2608.11434

**Abstract:** Mobile agent benchmarks increasingly rely on LLM-based judges to evaluate task completion, yet the reliability of these judges on mobile agent trajectories remains largely unexamined. We introduce MobileJudgeBench, a benchmark for systematically evaluating LLM-as-judge methods on mobile agent trajectories. Our benchmark comprises 931 human-annotated trajectories spanning 6 mobile agent benchmarks, 4 agent models, and 68 apps. We evaluate 6 judge methods (five adapted from SPA-Bench, A3 with two modes, AndroidArena, and AgentRewardBench, plus a simple baseline we design) across multiple LLM backends. Our experiments reveal three key findings. First, a simple baseline judge with sampled screenshots is competitive with, and often exceeds, purpose-built methods, indicating that more elaborate judge pipelines do not consistently improve judge quality; among competitive methods, the LLM backbone is the primary driver. Second, benchmark quality metrics reliably predict real-world judge utility: they correlate with both agent ranking fidelity for evaluation and downstream performance when judges serve as reward signals for on-policy reinforcement learning. Third, failure analysis across two LLM backends uncovers qualitatively opposite failure profiles, one conservative and the other permissive, linked to the backbone's precision-recall characteristics.

### The Collaboration Tax: How Much LLM Multi-Agent Systems Pay to Coordinate

**Code:** arXiv:2608.22152

**Abstract:** Multi-agent systems built from large language models are deployed widely, yet how much performance is lost when two LLMs must coordinate rather than act alone remains unclear. We formulate the collaboration tax as the team-decentralisation loss of a two-player cooperative game with private information, with two propositions characterising its sign and its equivalence to a max-superadditivity violation. We operationalise this definition on 32 solo-tractable tasks grouped by source of grounding friction and measure it on 11 models from 7 providers. The tax is structured along two no-exception axes: a category ordering across every model and a monotonic decrease with capability. The proximate mechanism is not a reasoning deficit but a four-stage conversational cascade in which agents make ungrounded claims, fail to query the partner, skip integrating both views, and accept the answer without re-derivation. The tax is mechanically predictable from conversation features and partly tractable: a prompt intervention targeting all four stages closes a substantial fraction of the gap, with the dominant bottleneck differing across categories. In heterogeneous pairs the tax is pulled toward the stronger partner rather than the additive midpoint, empirically realising the max-superadditivity violation predicted by our framework. Together these results recast collaboration in LLM systems as a measurable, predictable, and partly tractable cost.

### GUI Agents for Continual Game Generation

**Code:** arXiv:2605.28258

**Abstract:** Generating a game is not the same as making one playable. Existing code-generation approaches often translate a prompt directly into an artifact, leaving interaction-level failures undetected. We argue that game generation requires a player and study two roles for graphical user interface (GUI) agents. First, we introduce \textbf{PlaytestArena}, an evaluation environment containing 200 browser-based game-generation tasks across eight genres, each paired with rubrics of expected in-play behaviors. An independent GUI judge loads and plays each build to adjudicate these rubrics. Second, we propose \textbf{Play2Code}, in which a game agent and a rubric-blind GUI playtester iteratively generate, play, and refine games through shared memory. The playtester provides gameplay traces and actionable feedback, while a separate GPT-5.5 judge assigns final benchmark scores. Across three frontier backbones, Play2Code achieves a 66.8\% rubric pass rate, outperforming single-pass and agentic-coding baselines by 37.1 and 14.6 points, respectively. Its scores also improve monotonically across refinement rounds. Further analysis shows that GUI-agent feedback is fully logged and traceable, while its priorities vary substantially across model backbones. These results establish GUI playtesting as an evaluation and refinement signal for interactive code generation. Our project website is available at https://continual-game-generation.vercel.app/

### The Autonomy Tax: Defense Training Breaks LLM Agents

**Code:** arXiv:2603.19423

**Abstract:** Large language model (LLM) agents increasingly rely on external tools (file operations, API calls, database transactions) to autonomously complete complex multi-step tasks. Practitioners deploy defense-trained models to protect against prompt injection attacks that manipulate agent behavior through malicious observations or retrieved content. We reveal a fundamental \textbf{capability-alignment paradox}: defense training designed to improve safety systematically destroys agent competence while failing to prevent sophisticated attacks. Evaluating defended models against undefended baselines across 97 agent tasks and 1,000 adversarial prompts, we uncover three systematic biases unique to multi-step agents. \textbf{Agent incompetence bias} manifests as immediate tool execution breakdown, with models refusing or generating invalid actions on benign tasks before observing any external content. \textbf{Cascade amplification bias} causes early failures to propagate through retry loops, pushing defended models to timeout on 99\% of tasks compared to 13\% for baselines. \textbf{Trigger bias} leads to paradoxical security degradation where defended models perform worse than undefended baselines while straightforward attacks bypass defenses at high rates. Root cause analysis reveals these biases stem from shortcut learning: models overfit to surface attack patterns rather than semantic threat understanding, evidenced by extreme variance in defense effectiveness across attack categories. Our findings demonstrate that current defense paradigms optimize for single-turn refusal benchmarks while rendering multi-step agents fundamentally unreliable, necessitating new approaches that preserve tool execution competence under adversarial conditions.

### Lie Rarely, Lie Big: Stealthy Insider Attacks on LLM Robot Teams

**Code:** arXiv:2610.04744

**Abstract:** When a team of robots delegates planning and mutual trust to LLM agents, a single compromised robot can corrupt the shared outcome. We study this threat in a grounded task: a multi-robot survey in which measurements can be verified against the physical world, but every verification costs budget that would otherwise advance the mission. We treat the compromised robot as a stealthy adversary in the system-theoretic sense: it is limited not by an energy bound but by the team's own detectors. We then derive two bounds. First, the probability that the adversary's reports are verified is bounded below in terms of the degrees in the communication graph and the verification budget. Second, the map error caused by any stealthy adversary is bounded above by the value of a linear program over the adversary's bias distributions; its solution is an exchange rate between stealth budget and damage: below a critical verification level the worst stealthy attack tells rare, full-magnitude lies on the records least likely to be verified, and above it the better purchase is small biases hidden in the noise. In experiments where the honest robots are LLM agents, both bounds hold at the budget the attack actually spent. The experiments also show that which records an LLM robot re-checks is unbiased, but how much it re-checks is unpredictable.

### Same Scrutiny, More Time: Eye Tracking Insights into Reviewing LLM-Labelled Code

**Code:** arXiv:2606.26505

**Abstract:** Modern software development increasingly involves the use of large language models (LLMs) to generate code. Despite their rapid advancement, LLMs remain prone to errors and hallucinations, emphasizing the importance of careful code inspection. However, in practice, developers' trust in LLM-generated code and their willingness to review it thoroughly may differ from these recommendations. How developers actually behave when reviewing LLM-generated code remains largely unexplored. In this study, we conduct a Wizard-of-Oz experiment to examine how software engineers behave when code is explicitly labeled as LLM-generated during a code review task. We collect both behavioral data and participant feedback through eye-tracking and exit interviews. Combining Bayesian data analysis with qualitative analysis, we found that while the thoroughness of code review did not change for participants, they spent more time fixating on LLM-labelled code, indicating that the label itself influences attention. Practitioners also adapted their review strategy for LLM-labelled code by assessing the code based on specific criteria (e.g., logical correctness), or using the prompt to guide their review. These findings inform LLM-based tool design on labelling while incorporating the prompt as a software artifact. Our study reveals a gap between reviewers' intentions and actual reviewing behaviour, highlighting the need for software companies to revisit their AI policies (particularly regarding LLM-assisted development) to better support developers in reviewing LLM-generated code.

### CreativeGame:Toward Mechanic-Aware Creative Game Generation

**Code:** arXiv:2604.19926

**Abstract:** Large language models can generate plausible game code, but turning this capability into \emph{iterative creative improvement} remains difficult. In practice, single-shot generation often produces brittle runtime behavior, weak accumulation of experience across versions, and creativity scores that are too subjective to serve as reliable optimization signals. A further limitation is that mechanics are frequently treated only as post-hoc descriptions, rather than as explicit objects that can be planned, tracked, preserved, and evaluated during generation. This report presents \textbf{CreativeGame}, a multi-agent system for iterative HTML5 game generation that addresses these issues through four coupled ideas: a proxy reward centered on programmatic signals rather than pure LLM judgment; lineage-scoped memory for cross-version experience accumulation; runtime validation integrated into both repair and reward; and a mechanic-guided planning loop in which retrieved mechanic knowledge is converted into an explicit mechanic plan before code generation begins. The goal is not merely to produce a playable artifact in one step, but to support interpretable version-to-version evolution. The current system contains 71 stored lineages, 88 saved nodes, and a 774-entry global mechanic archive, implemented in 6{,}181 lines of Python together with inspection and visualization tooling. The system is therefore substantial enough to support architectural analysis, reward inspection, and real lineage-level case studies rather than only prompt-level demos. A real 4-generation lineage shows that mechanic-level innovation can emerge in later versions and can be inspected directly through version-to-version records. The central contribution is therefore not only game generation, but a concrete pipeline for observing progressive evolution through explicit mechanic change.

### LifelongAgentBench: Evaluating LLM Agents as Lifelong Learners

**Code:** arXiv:2505.11942

**Abstract:** Lifelong learning is essential for intelligent agents operating in dynamic environments. Current large language model (LLM)-based agents, however, remain stateless and unable to accumulate or transfer knowledge over time. Existing benchmarks treat agents as static systems and fail to evaluate lifelong learning capabilities. We present LifelongAgentBench, the first unified benchmark designed to systematically assess the lifelong learning ability of LLM agents. It provides skill-grounded, interdependent tasks across three interactive environments, Database, Operating System, and Knowledge Graph, with automatic label verification, reproducibility, and modular extensibility. Extensive experiments reveal that conventional experience replay has limited effectiveness for LLM agents due to irrelevant information and context length constraints. We further introduce a group self-consistency mechanism that significantly improves lifelong learning performance. We hope LifelongAgentBench will advance the development of adaptive, memory-capable LLM agents.

### Rule-Based Assessment of Reinforcement Learning Practices Using Large Language Models

**Code:** doi:10.1109/CAIN66642.2025.00009

**Abstract:** In the fast-evolving field of artificial intelligence, Reinforcement Learning (RL) plays a crucial role in developing agents that can make decisions. As these systems become increasingly complex, the need for standardized and automated training methods becomes apparent. This paper presents a rule-based framework that integrates Large Language Models (LLMs) and heuristic-based code detectors to ensure compliance with best practices in RL training pipelines. We define a set of architectural rules that target best practices in important areas of RL-based architectures, such as checkpoints, hyperparameter tuning, and agent configuration. We validated our approach through a large-scale industrial case study and ten open-source projects. The results show that LLM-based detectors generally outperform heuristic-based detectors, especially when handling more complex code patterns. This approach effectively identifies best practices with high precision and recall, demonstrating its practical applicability.

### Vox Deorum: A Hybrid LLM Architecture for 4X / Grand Strategy Game AI -- Lessons from Civilization V

**Code:** arXiv:2512.18564

**Abstract:** Large Language Models' capacity to reason in natural language makes them uniquely promising for 4X and grand strategy games, enabling more natural human-AI gameplay interactions such as collaboration and negotiation. However, these games present unique challenges due to their complexity and long-horizon nature, while latency and cost factors may hinder LLMs' real-world deployment. Working on a classic 4X strategy game, Sid Meier's Civilization V with the Vox Populi mod, we introduce Vox Deorum, a hybrid LLM+X architecture. Our layered technical design empowers LLMs to handle macro-strategic reasoning, delegating tactical execution to subsystems (e.g., algorithmic AI or reinforcement learning AI in the future). We validate our approach through 2,327 complete games, comparing two open-source LLMs with a simple prompt against Vox Populi's enhanced AI. Results show that LLMs achieve competitive end-to-end gameplay while exhibiting play styles that diverge substantially from algorithmic AI and from each other. Our work establishes a viable architecture for integrating LLMs in commercial 4X games, opening new opportunities for game design and agentic AI research.

### From Wordle to Fibble5: Evaluating LLM Reasoning Under Escalating Deception

**Code:** doi:10.18653/v1/2026.evaleval-1.5

**Abstract:** ,

### Sell More, Play Less: Benchmarking LLM Realistic Selling Skill

**Code:** arXiv:2604.07054

**Abstract:** Sales dialogues require multi-turn, goal-directed persuasion under asymmetric incentives, which makes them a challenging setting for large language models (LLMs). Yet existing dialogue benchmarks rarely measure deal progression and outcomes. We introduce SalesLLM benchmark, a bilingual (ZH/EN) benchmark derived from realistic applications covering Financial Services and Consumer Goods, built from 30,074 scripted configurations and 1,805 curated multi-turn scenarios with controllable difficulty and personas. We propose a fully automatic evaluation pipeline that combines (i) an LLM judge for sales-process progress, and (ii) fine-tuned BERT classifiers for end-of-dialogue buying intent. To improve simulation fidelity, we train a user model, CustomerLM, with SFT and DPO on 8,000+ crowdworker-involved sales conversations, reducing role inversion from 17.44% (GPT-4o) to 8.8%. SalesLLM benchmark scores correlate strongly with human ratings (average Pearson r=0.86; inter-annotator agreement Krippendorff's alpha=0.86, 500 annotations per model). Across 15 mainstream LLMs, in Chinese the strongest models are competitive with typical (junior-to-intermediate) human salespeople -- not with sales experts -- while weaker ones fall below this baseline, and cross-lingual consistency remains poor. SalesLLM benchmark serves as a scalable benchmark for outcome-oriented sales agents. Our code and data are released at https://github.com/Bairong-Xdynamics/Benchmarking-LLM-Realistic-Selling-Skill

### When AIOps Become "AI Oops": Subverting LLM-driven IT Operations via Telemetry Manipulation

**Code:** arXiv:2508.06394

**Abstract:** AI for IT Operations (AIOps) is transforming how organizations manage complex software systems by automating anomaly detection, incident diagnosis, and remediation. Modern AIOps solutions increasingly rely on autonomous LLM-based agents to interpret telemetry data and take corrective actions with minimal human intervention, promising faster response times and operational cost savings. In this work, we perform the first security analysis of AIOps solutions, showing that, once again, AI-driven automation comes with a profound security cost. We demonstrate that adversaries can manipulate system telemetry to mislead AIOps agents into taking actions that compromise the integrity of the infrastructure they manage. We introduce techniques to reliably inject telemetry data using error-inducing requests that influence agent behavior through a form of adversarial reward-hacking; plausible but incorrect system error interpretations that steer the agent's decision-making. Our attack methodology, AIOpsDoom, is fully automated--combining reconnaissance, fuzzing, and LLM-driven adversarial input generation--and operates without any prior knowledge of the target system. To counter this threat, we propose AIOpsShield, a defense mechanism that sanitizes telemetry data by exploiting its structured nature and the minimal role of user-generated content. Our experiments show that AIOpsShield reliably blocks telemetry-based attacks without affecting normal agent performance. Ultimately, this work exposes AIOps as an emerging attack vector for system compromise and underscores the urgent need for security-aware AIOps design.

### Loop-Back Authority in LLM Agent Teams: A Paired Experiment on Flat and Hierarchical Coordination

**Code:** arXiv:2609.14767

**Abstract:** Does authority in AI teams improve the outcome? Organizational theory asserts that authority facilitates decision making, improving quality. Meanwhile, some nascent AI research suggests that revision under authority makes LLM output worse. Multi-agent LLM frameworks default to giving a Manager agent the authority to send a worker's output back for revision. Prior comparisons test the effect of authority using verifiable tasks. We conduct an experiment on an open-ended task, business-intelligence reporting, using a sample of 43 paired laptop products and 86 runs. Each report is written once by a hierarchical team and once by a flat team. We find that flat teams produce higher-quality reports, scoring higher on Utility (d = 0.42, p = 0.009) and Writing Clarity (d = 0.34, p = 0.030). The reports are the same length, but hierarchical team reports use 53% more hedging words such as "may" and "could", and each revision is associated with a 0.14-point drop in Writing Clarity on a 1 to 5 scale. Before any revision, the hierarchical team's first draft is indistinguishable from the flat team's report. In other words, the quality gap can be traced to revision. Authority improves quality when the Manager can verify the work, else when it can only provide feedback it has a negative effect on quality.

### From Entity-Centric to Goal-Oriented Graphs: Enhancing LLM Knowledge Retrieval in Minecraft

**Code:** arXiv:2505.18607

**Abstract:** Large Language Models (LLMs) demonstrate impressive general capabilities but often struggle with step-by-step procedural reasoning, a critical challenge in complex interactive environments. While retrieval-augmented methods like GraphRAG attempt to bridge this gap, their fragmented entity-relation graphs hinder the construction of coherent, multi-step plans. In this paper, we propose a novel framework based on Goal-Oriented Graphs (GoGs), where each node represents a goal and edges encode logical dependencies between them. This structure enables the explicit retrieval of causal reasoning paths by identifying a high-level goal and recursively retrieving its prerequisites, forming a coherent chain to guide the LLM. Through extensive experiments on the Minecraft testbed, a domain that demands robust multi-step planning and provides rich procedural knowledge, we demonstrate that GoG substantially improves procedural reasoning and significantly outperforms GraphRAG and other state-of-the-art baselines.

### LLM agents security duality: a comprehensive survey of self-security and empowered cybersecurity

**Code:** arXiv:2606.28450

**Abstract:** Large language model (LLM) agents are rapidly being integrated into real-world systems. Their autonomy and tool-use capabilities generate substantial value while simultaneously expanding the security attack surface. This survey provides a comprehensive overview of the opportunities and challenges of LLM agents in security, focusing on two core areas: (1) threats to LLM agents themselves and corresponding mitigation strategies (LLM agents self-security), and (2) the role of LLM agents in empowering the cybersecurity lifecycle across offense and defense (LLM agents empowered cybersecurity). We first examine the internal and external attack surfaces of agents, propose a taxonomy organized by threat sources, and analyze associated mitigations and evaluation frameworks. We then investigate how agent capabilities are applied in cybersecurity practice and present, to our knowledge, the first agent-empowerment framework aligned with the full cyber offense-defense lifecycle. By systematically surveying these two areas, we are the first to highlight a positive feedback synergy between LLM agents self-security and empowered cybersecurity, offering new insights for the advancement of both. We further identify current limitations and outline promising directions for future research. The insights provided aim to catalyze the coordinated development of LLM agents self-security and agent empowered cybersecurity, paving the way for more capable and robust agent applications.

### AgentRaft: Automated Detection of Data Over-Exposure in LLM Agents

**Code:** arXiv:2603.07557

**Abstract:** The rapid integration of Large Language Model (LLM) agents into autonomous task execution has introduced significant privacy concerns within cross-tool data flows. In this paper, we systematically investigate and define a novel risk termed Data Over-Exposure (DOE) in LLM Agent, where an Agent inadvertently transmits sensitive data beyond the scope of user intent and functional necessity. We identify that DOE is primarily driven by the broad data paradigms in tool design and the coarse-grained data processing inherent in LLMs. In this paper, we present AgentRaft, the first automated framework for detecting DOE risks in LLM agents. AgentRaft combines program analysis with semantic reasoning through three synergistic modules: (1) it constructs a Cross-Tool Function Call Graph (FCG) to model the interaction landscape of heterogeneous tools; (2) it traverses the FCG to synthesize high-quality testing user prompts that act as deterministic triggers for deep-layer tool execution; and (3) it performs runtime taint tracking and employs a multi-LLM voting committee grounded in global privacy regulations (e.g., GDPR, CCPA, PIPL) to accurately identify privacy violations. We evaluate AgentRaft on a testing environment of 6,675 real-world agent tools. Our findings reveal that DOE is indeed a systemic risk, prevalent in 57.07% of potential tool interaction paths. AgentRaft achieves a high detection accuracy and effectiveness, outperforming baselines by 87.24%. Furthermore, AgentRaft reaches near-total DOE coverage (99%) within only 150 prompts while reducing per-chain verification costs by 88.6%. Our work provides a practical foundation for building auditable and privacy-compliant LLM agent systems.

### Reducing belief deviation in reinforcement learning for active reasoning of llm agents

**Code:** Google Scholar cluster 6xwxaVQ6rbUJ

**Abstract:** (Scholar snippet; full abstract not found) … In contrast, when instantiated with LLM agents, belief … Since the exact onset of the BTR is intractable in LLM agents, we … It further shows robust benefits across LLM sizes, architectures, …

### To What Extent Is LLM Performance on Multiple-Choice Questions Driven by Data Leakage? A Case Study with Contamination-Controlled Spanish Undergraduate Exams

**Code:** doi:10.4114/intartif.vol29iss77pp131-151

**Abstract:** The performance of Large Language Models (LLMs) on multiple-choice university-level exam benchmarks such as MMLU is often reported as highly competitive; however, such results raise persistent concerns regarding contamination of public datasets, English-centric bias, and over-reliance on aggregate accuracy as the primary evaluation signal. In particular, the widespread public availability of evaluation data makes it difficult to disentangle genuine generalization from memorization of seen content, while offering limited insight into models’ abilities on culturally grounded assessments beyond English. To address these issues, we introduce lunes (Leakage-controlled Undergraduate National Exams of Spain), a new benchmark of 11,881 multiple-choice questions drawn from official final-year undergraduate exams in Spanish, covering 104 courses across 22 degree programs. The dataset has been rigorously verified to exhibit minimal public web exposure through a combination of automated web search and manual inspection, which enables evaluation under minimal contamination conditions in a non-English, country-specific academic setting. Our results show that (i) LLMs retain strong performance on general knowledge and factual questions, even in the absence of web-accessible training data, suggesting that contamination alone does not explain their success on public benchmarks; (ii) however, their performance degrades substantially on culturally grounded and country-specific content, particularly in domains such as Spanish law, economy, and social structure. Remarkably, models consistently perform better on Anglo-centric content than on Spain-specific material even when answering in Spanish, suggesting that the bottleneck lies in culturally grounded knowledge rather than in language skills per se. A question-level error analysis further reveals that these failures reflect systematic gaps in local institutional, legal, and geographical knowledge, even for high-resource languages such as Spanish, that aggregate metrics systematically obscure.

### Inspectable LLM-Simulated Participants for Qualitative Interview Rehearsal

**Code:** arXiv:2610.27333

**Abstract:** LLMs are increasingly used across research workflows, including research ideation, qualitative analysis, and participant simulation. Within work on participant simulation, prior studies have largely evaluated simulated participants by how realistic or human-like their responses appear, leaving less known about how researchers use and critique these materials when revising interview protocols before fieldwork. We present Rehearsim, an inspectable research probe that treats LLM-simulated participants as materials for methodological rehearsal rather than substitutes for human participants. Rehearsim combines literature-grounded participant construction, interactive interview rehearsal, and traceable thematic review while keeping protocol decisions under researcher control. In a study with 21 qualitative researchers, participants used simulated materials to surface assumptions and gaps, reconsider participant populations, revise target populations, and develop follow-up probes. They also identified risks, including the concealment of weak questions, dismissal of unexpected synthetic details, and interpretive anchoring from generated themes. We derive an inspectable-rehearsal framework emphasizing traceability, contestability, researcher control, and epistemic boundaries.

### State2State: Environment-Derived Mid-Training for LLM Agents

**Code:** arXiv:2608.04934

**Abstract:** Training LLM agents commonly relies on supervised fine-tuning from expert trajectories or online reinforcement learning over human-specified tasks with handcrafted verifiers. Though effective, both remain bottlenecked by externally specified tasks and supervision signals, limiting the scalability and diversity of agent training. We study an environment learning paradigm in which agents acquire interaction and manipulation capabilities solely through environment interaction, without externally specified tasks. We propose State2State, an environment-derived mid-training method that converts explored environment states into training objectives, challenging agents to reach a specified target state. By deriving tasks from environment exploration and verifying success through rule-based state matching, State2State provides scalable and verifiable training objectives without expert supervision or manual task design. Experiments on ALFWorld and ScienceWorld show that State2State improves agent performance as a standalone environment-learning stage in most settings. As initialization for downstream RL, it further improves final performance and learning efficiency, with promising evidence of cross-environment generalization.

## LLM AND (bribery OR corruption)

### Evaluating the Impact of Model Scale and Prompting Strategies on Corruption Allegation Classification using Thai-Specialized Typhoon2 Language Models

**Code:** Google Scholar cluster 5EQA8VekiigJ

**Abstract:** (Scholar snippet; full abstract not found) … and rigorously evaluating the interplay of model scale, fine-tuning, and prompting strategies, our findings yield critical insights that nuance the prevailing narrative around LLM …

### Corruption Detection Through Textual Analysis: Evidence From Eurozone Banks

**Code:** doi:10.1111/beer.12824

**Abstract:** This research investigates the disclosure of banking institutions by analyzing their annual reports to identify the determinants capable of signaling possible corruption scandals. A textual analysis was conducted on the financial reports of 42 Eurozone banks from the period 2013 to 2022. Drawing on impression management theory, we combine an advanced large language model (LLM) and dictionary approach to extract and analyze the governance‐related textual content of the banks in the sample. Machine learning algorithms—including random forests, support vector machines, gradient boosting, and naive Bayes classifiers—and logistic regression have been employed to verify whether disclosure indicators allow for the identification of corruption scandals from a preventive perspective. Our findings show that specific textual measures can be used to analyze the association between disclosure and corruption events and as predictive tools to detect corruption scandals before they become public domain. Our study has several implications, particularly for supervisors and investors who can proactively leverage our findings to identify possible corruption scandals in banks by analyzing their financial disclosures.

### SocialHarmBench: Revealing LLM Vulnerabilities to Socially Harmful Requests

**Code:** arXiv:2510.04891

**Abstract:** Large language models (LLMs) are increasingly deployed in contexts where their failures can have direct sociopolitical consequences. Yet, existing safety benchmarks rarely test vulnerabilities in domains such as political manipulation, propaganda and disinformation generation, or surveillance and information control. We introduce SocialHarmBench, a dataset of 585 prompts spanning 7 sociopolitical categories and 34 countries, designed to surface where LLMs most acutely fail in politically charged contexts. Our evaluations reveal several shortcomings: open-weight models exhibit high vulnerability to harmful compliance, with Mistral-7B reaching attack success rates as high as 97% to 98% in domains such as historical revisionism, propaganda, and political manipulation. Moreover, temporal and geographic analyses show that LLMs are most fragile when confronted with 21st-century or pre-20th-century contexts, and when responding to prompts tied to regions such as Latin America, the USA, and the UK. These findings demonstrate that current safeguards fail to generalize to high-stakes sociopolitical settings, exposing systematic biases and raising concerns about the reliability of LLMs in preserving human rights and democratic values. We share the SocialHarmBench benchmark at https://huggingface.co/datasets/psyonp/SocialHarmBench.

### Agentic AI for Detecting Micro-Corruption in SMEs' Financial Reports

**Code:** doi:10.1007/978-3-032-28310-8_48

**Abstract:** (Scholar snippet; full abstract not found) … There is no specific system of micro-corruption in SMEs. To remedy this, we created an AI … micro-corruption as a problem by itself, (2) we developed a multi-agent LLM system, which is …

### Monitoring LLM-based Multi-Agent Systems Against Corruption Attacks via Node Evaluation

**Code:** Google Scholar cluster 0j5YTfj-K44J

**Abstract:** (Scholar snippet; full abstract not found) Large Language Model (LLM)-based Multi-Agent Systems (MAS) have become a popular focus of contemporary research, with extensive studies demonstrating their effectiveness in …

### SIMURG: Zero-Leak Online Detection of LLM Decoding Corruption via Conformally Calibrated Sensor Fusion

**Code:** Google Scholar cluster LPyA2LhCoxMJ

**Abstract:** (Scholar snippet; full abstract not found) … derails in production (we observed corruption in about one of six … field, typically requiring additional LLM calls. Simurg targets a … application as online corruption signals for LLM streams, …

### Zero-Shot Annotation by Large Language Model with Serial Correction of Mixed Label Corruption for Weakly Supervised Financial News Classification

**Code:** doi:10.3390/info17090864

**Abstract:** Multi-label classification of financial news is frequently affected by incomplete and noisy annotations, while obtaining expert-curated labels at scale is prohibitively expensive. This study proposes a weakly supervised classification framework that combines large language model (LLM) zero-shot annotation with a serial label-correction strategy. The framework first uses an LLM to generate initial weak labels and then refines them through a two-stage Correct→Clean procedure that recovers missing labels via centrality-weighted graph propagation before suppressing label noise. Systematic experiments on a financial subset of Reuters-21578 show that, under an extreme mixed-corruption setting with 80% missing labels and 15% noise labels, Correct→Clean increases the Micro-F1 from 0 to 0.6748. In an end-to-end evaluation, the proposed framework achieves a Micro-F1 of 0.8882 with reduced-dimensional features, recovering 88.69% of the performance gap to fully supervised learning. Additional experiments on the RCV1 Topics and AAPD datasets confirm that the advantage of Correct→Clean is consistently reproduced across domains and dataset sizes. These findings demonstrate that coupling LLM-generated annotations with ordered label correction offers an effective means of addressing the joint effects of missing and noisy labels, providing a promising approach to financial text classification when expert annotations are scarce.

### Equitas: A Benchmark for Corruption-Robust Aggregation in Hierarchical Multi-LLM Committees

**Code:** Google Scholar cluster H_LWAGQZKAgJ

**Abstract:** (Scholar snippet; full abstract not found) … under adversarial corruption in hierarchical multi-LLM committees. Three tiers of LLM agents (… The primary full-hierarchy corruption sweep alone requires 103,776 OpenAI Batch API …

### Real-Time Detection and Repair of LLM Agent Failures

**Code:** arXiv:2608.02464

**Abstract:** LLM agents fail mid-episode -- they loop, cascade tool errors, drift off goal, fabricate results, or silently absorb corrupted content -- and the standard remedy, judging every step with a second LLM, costs more than the agent itself. We ask how much detection is achievable from observable step telemetry alone, using monitors costing microseconds per step and trained only on healthy runs. On 2,823 committed agent episodes across three frameworks, three local models (qwen2.5 7b/3b, llama3.1 8b) and a commercial API (gemini-2.5-flash), a one-class echo-state-network ensemble with CUSUM alarms detects 0.71 of failures at a 5% false-alarm budget (AUROC 0.872). Its advantage over a memoryless baseline is a monotone function of post-onset horizon (+0.09 at =9), predicting its own failure region out of sample on AFTraj-2K. Ranking transfers with no retraining to two corpora from other groups (AFTraj-2K 0.745, ATBench 0.779). Monitors carry two burdens: a per-deployment healthy null (they do not transfer -- AUROC 0.527 cold against 0.885 recalibrated) and a residual false-alarm rate. We add a layer carrying neither: deterministic verification, which recomputes a run's stated total from the tool results it actually received and confirms every required call was made. Head-to-head it catches 60% of failures (96% with the coverage check) at 0 of 63 false positives against the monitor's 54% at 17%, transfers unchanged to llama3.1:8b (110 of 110 at 0 of 10), and trips on 0 of 1825 healthy episodes. Detection is then closed into repair: each flagged run is rolled back and re-run live, recovering 45% of failures against a 16% resampling control (p=0.0005) and lifting task success from 52% to 73% for about one extra model call per run. The system runs at ~200 microseconds per step, three orders of magnitude below a judge call. Code, traces and results are released.

### FinRegQA-EU: Corruption-Based Preference Data for Grounded EU Financial Regulatory Question Answering

**Code:** arXiv:2609.36856

**Abstract:** Large Language Models (LLMs) struggle with region-specific factual knowledge, particularly in financial regulation. While benchmarks such as CFinBench, provide broad coverage of financial knowledge in other regions, no comparable resource exists for European financial regulation. We close this gap by proposing an end-to-end pipeline for evaluating and improving LLMs on European financial regulatory question answering. Our dataset is grounded in the official Q&A corpora of the European Banking Authority (EBA) and the European Securities and Markets Authority (ESMA). We evaluate candidate answers with a pointwise LLM-as-a-Judge protocol using three judges from distinct model families, retain only unanimously judged pairs, and sharpen the rejected side through a taxonomy of regulatory failure modes : law swaps, article swaps, hallucinated citations, and hallucinated text. By fine-tuning on the resulting preference pairs exposes a divergence at the core of our findings: supervised fine-tuning attains the highest judge score of any method yet got the lowest rule-based Citation F1. SFT is producing longer answers with three times as many citations, most of them unsupported. DPO and GRPO offer the better trade-off with more concise answers and the highest citation F1 among fine-tuned models. Standard LLM-as-a-Judge evaluation rewards citation density as evidence of grounding and cannot detect when those citations are fabricated. Thus, we detect a blind spot that matters wherever answers must be verifiable. We release the benchmark and evaluation stack at https://github.com/auliakharis/FinRegQA-EU.

### LLMs Cannot Reliably Judge (Yet?): A Comprehensive Assessment on the Robustness of LLM-as-a-Judge

**Code:** arXiv:2506.09443

**Abstract:** Large Language Models (LLMs) have demonstrated exceptional capabilities across diverse tasks, driving the development and widespread adoption of LLM-as-a-Judge systems for automated evaluation, including red teaming and benchmarking. However, these systems are susceptible to adversarial attacks that can manipulate evaluation outcomes, raising critical concerns about their robustness and trustworthiness. Existing evaluation methods for LLM-based judges are often fragmented and lack a unified framework for comprehensive robustness assessment. Furthermore, the impact of prompt template design and model selection on judge robustness has rarely been explored, and their performance in real-world deployments remains largely unverified. To address these gaps, we introduce RobustJudge, a fully automated and modularly extensible framework designed to systematically evaluate the robustness of LLM-as-a-Judge across task datasets, judge prompt templates, judge models, attacks, and defenses. Specifically, RobustJudge investigates the effectiveness of 15 attack methods and 8 defense strategies across 13 models (RQ1), examines the impact of prompt template design and model selection (RQ2), and evaluates the security of real-world deployments (RQ3). Our study yields three main findings: (1) LLM-based judges remain susceptible under both pointwise and pairwise protocols. The combined Attack exhibits the strongest and most transferable performance among those evaluated, while the evaluated defenses exhibit no universal dominance across robustness, benign utility, and computational cost. (2) Robustness is highly sensitive to both prompt-template and judge model choices. (3) Optimization-based attack combined with long suffixes can substantially inflate scores returned by both PAI-Judge variants.

### Clouding the Mirror: Stealthy Prompt Injection Attacks Targeting LLM-based Phishing Detection

**Code:** arXiv:2602.05484

**Abstract:** Phishing sites continue to increase in number and sophistication. Recent work uses large language models (LLMs) to analyze URLs, HTML, and rendered content and determine whether a website is a phishing site. However, these systems also introduce a new attack surface: prompt injection. Because attackers control many elements of a phishing site, they can embed malicious instructions that exploit perceptual asymmetry between LLMs and human users. Content that goes unnoticed by end users may still be processed by the LLM and can therefore be used to manipulate the model's judgment or disrupt the detection pipeline. The specific risks of prompt injection in phishing detection, and possible mitigation strategies, have not been studied systematically. We present the first comprehensive evaluation of prompt injection against multimodal LLM-based phishing detection. We study diverse attacks embedded in phishing sites across multiple attack techniques and surfaces, and show that even state-of-the-art models remain vulnerable both in controlled settings and on real phishing sites. To mitigate this risk, we propose InjectDefuser, a modular framework that combines prompt hardening, allowlist-grounded retrieval, and output validation. Across multiple models, InjectDefuser reduces attack success rates. Our results show that prompt injection is a practical threat to LLM-based phishing detection and provide insight into how these systems can be made more robust.

### Certifiably Robust RAG against Retrieval Corruption

**Code:** arXiv:2405.15556

**Abstract:** Retrieval-augmented generation (RAG) is susceptible to retrieval corruption attacks, where malicious passages injected into retrieval results can lead to inaccurate model responses. We propose RobustRAG, the first defense framework with certifiable robustness against retrieval corruption attacks. The key insight of RobustRAG is an isolate-then-aggregate strategy: we isolate passages into disjoint groups, generate LLM responses based on the concatenated passages from each isolated group, and then securely aggregate these responses for a robust output. To instantiate RobustRAG, we design keyword-based and decoding-based algorithms for securely aggregating unstructured text responses. Notably, RobustRAG achieves certifiable robustness: for certain queries in our evaluation datasets, we can formally certify non-trivial lower bounds on response quality -- even against an adaptive attacker with full knowledge of the defense and the ability to arbitrarily inject a bounded number of malicious passages. We evaluate RobustRAG on the tasks of open-domain question-answering and free-form long text generation and demonstrate its effectiveness across three datasets and three LLMs.

### RamFuzz: LLM-Guided Greybox Fuzzing for Spatial Memory Corruption via Valid Range Violation

**Code:** doi:10.1145/3832783.3837447

**Abstract:** Spatial memory corruptions remain among the most prevalent software vulnerabilities, consistently ranking among the top CWE categories. These vulnerabilities are closely tied to the values processed by the program: when input-derived values fall outside expected ranges, memory operations may be performed beyond their allocated bounds, leading to corruption. Our pilot study on 132 realworld CVEs shows that 72.7% of spatial memory corruptions stem from such valid value violations. Although fuzzing is widely used to expose exploitable memory corruptions, systematically detecting spatial memory corruptions through fuzzing remains challenging, as it requires generating inputs that conform to complex structural formats while violating valid value ranges. Recent work leverages LLMs to generate structured inputs based on format knowledge, yet LLMs exhibit a strong bias toward well-formed outputs, leaving systematic range violations largely unexplored. In this paper, we propose RamFuzz, an approach that exploits rather than mitigates this bias to guide the fuzzing process. RamFuzz prompts LLMs to enumerate valid ranges of target file formats and deliberately assigns invalid values to seeds during fuzzing, systematically triggering spatial memory corruptions. We evaluated RamFuzz on 15 popular real-world projects with more than 1,000 stars on GitHub, RamFuzz discovered 104 previously unknown memory corruptions, of which 39 have been confirmed, and 33 have been fixed by developers.

### Reliability Profiling of LLMs and VLMs for Edge AI under Activation Corruption

**Code:** Google Scholar cluster EaRk6Pi54UQJ

**Abstract:** (Scholar snippet; full abstract not found) … limited insight into how corruption reshapes the autoregressive … Models (VLMs) to activation corruption. We evaluate two LLMs … Overall, our results show that corruption produces distinct …

### Governance-State Corruption in Long-Term Memory for LLM Agents: A Cross-Model Stress Test

**Code:** arXiv:2610.30698

**Abstract:** An LLM agent can retrieve a memory correctly yet use it incorrectly after its validity state changes. We study governance-state corruption: faults that alter which retained records enter model-visible context while stored content and tasks remain fixed. Across six providers, 731 benchmark-grounded bases yield 2,080 matched fault pairs. In offline control-plane checks, corruption changes the operative projection in 96.25% of pairs, while oracle-backed enforcement restores it in 100%. For downstream evaluation, a deterministically selected, non-probability LongMemEval/Memora panel resolves 298 of 300 matched triplets (238 distinct bases). Clean-minus-corrupted contrasts are 40.54 percentage points in LongMemEval binary correctness (95% base-cluster interval [30.32, 50.71]) and 30.60 points in rescaled Memora FAMA ([23.31, 37.69]); both sources also show recovery. OAKS Novel native option parity holds for all 6,714 resolved outputs. Full-cohort frozen-scorer corruption/recovery effects (-27.55/+27.51 points) remain descriptive proxies, not validated native semantic population effects. These bounded findings motivate evaluating memory control-state integrity alongside retrieval accuracy.

### KItCAT: Knowledge Injection via Input Corruption for Auto-regressive Training

**Code:** arXiv:2609.00082

**Abstract:** LLMs acquire vast amounts of knowledge during pre-training, but often lack the specialized knowledge needed to answer questions from niche sources such as manuals or technical documents unseen during pre-training. Continued pre-training (CPT) is widely used to inject such knowledge into model parameters. However, niche documents seldom repeat facts, making it difficult for CPT to robustly acquire such knowledge. Recent works address this by generating multiple paraphrases of the new knowledge, but paraphrasing is computationally expensive and typically requires powerful LLMs. In this work, we introduce KItCAT: Knowledge Injection via Corrupted Auto-regressive Training, a lightweight training strategy that reduces the need for paraphrasing in decoder-only LLMs. KItCAT augments standard next-token prediction by stochastically corrupting the input sequence. During training, a random subset of input tokens is replaced with other vocabulary tokens while the original next-token labels are kept unchanged. This simple intervention generates diverse training inputs from each sample, enabling large-scale data augmentation at negligible cost. We show that KItCAT consistently improves over CPT across multiple datasets and model families. Code is available at https://github.com/meghanadhpulivarthi/KItCAT.

### Intent Drift in LLM-Assisted BCI Communication: An In-Silico Benchmark Under Simulated Decoder Corruption

**Code:** doi:10.64898/2026.08.20.26360939.abstract

**Abstract:** (Scholar snippet; full abstract not found) … Our own systematic review of LLM-BCI communication systems named this failure mode as … of the semantic fidelity of LLM-assisted postediting. Corruption was applied synthetically, …

### IMPACT OF CORRUPTION ON THE INDIAN JUDICIARY SYSTEM

**Code:** Google Scholar cluster WGb1l3d4RIYJ

**Abstract:** (Scholar snippet; full abstract not found) … He has earned many accolades as he hit against the political-bureaucrat corruption nexus in … He also has an LLM (Pro) ( with specialization in IPR) as well as three PG Diplomas from …

### Enhancing Vision Language Corruption Robustness using Cross-Distribution & Prompted Denoisers

**Code:** doi:10.1109/WACV61042.2026.00558

**Abstract:** While the current generation of Vision Language Models (VLMs) has excelled in ideal conditions, their performance drops significantly when exposed to realistic multimodal corruptions, such as blurry images and grammatically incorrect text. Our work addresses this by establishing a novel multimodal corruption and denoising benchmark, VLSRB, with a rich suite of 18 visual and 18 textual corruption functions, to evaluate the system robustness of VLMs. To enhance robustness, we employ: (i) cross-distribution visual denoisers, inspired by the Mixture of Experts (MoE) architecture, and (ii) a prompted zero-shot textual denoiser. Our experiments reveal an overall accuracy gain of up to 5.5%, while revealing the vulnerability of models to specific corruptions and their over-reliance on the textual modality. We envision that the behavioral insights from our benchmark will help in developing robust VLM systems. Our code is available at: https://github.com/farhanishmam/VLMDenoising.

### An expert-validated LLM framework for transforming legal procurement texts into actionable data

**Code:** doi:10.3233/FAIA416

**Abstract:** (Scholar snippet; full abstract not found) … From a legal perspective, the method also helps address systemic issues such as limited transparency and corruption. During evaluation, the LLM showed a partial ability to distinguish …

### How Much Can We Trust LLM Search Agents? Measuring Endorsement Vulnerability to Web Content Manipulation

**Code:** arXiv:2606.16821

**Abstract:** Large language model (LLM)-based search agents synthesize open-web content into actionable recommendations on behalf of users, creating a risk that attacker-published pages are transformed into endorsed claims. We introduce SearchGEO, a controlled evaluation framework for measuring endorsement corruption in LLM-based web-search agents, combining a web-evidence manipulation pipeline, a five-mode attack taxonomy, and multiple output-level metrics. We evaluate 13 LLM backends on 308 cases each. Results show that vulnerability patterns vary across backends: overall attack success rate (ASR) ranges from 0.0% on Claude-Sonnet-4.6 to 31.4% on Gemini-3-Flash, the strongest attack mode differs by model family, and the same deployment scaffold could amplify or decrease ASR on different backends. An auxiliary agent-skill probe, where endorsement becomes an install command, exposes a sharp split among otherwise robust backends: Claude over-rejects while GPT over-trusts. These findings argue for treating recommendation reliability under adversarial search content as a first-class dimension of backend safety evaluation.

### Supply-Chain Poisoning Attacks Against LLM Coding Agent Skill Ecosystems

**Code:** arXiv:2604.03081

**Abstract:** LLM-based coding agents extend their capabilities via third-party agent skills distributed through open marketplaces without mandatory security review. Unlike traditional packages, these skills are executed as operational directives with system-level privileges, so a single malicious skill can compromise the host. Prior work has not examined whether supply-chain attacks can directly hijack an agent's action space, such as file writes, shell commands, and network requests, despite existing safeguards. We introduce Document-Driven Implicit Payload Execution (DDIPE), which embeds malicious logic in code examples and configuration templates within skill documentation. Because agents reuse these examples during normal tasks, the payload executes without explicit prompts. Using an LLM-driven pipeline, we generate 1,070 adversarial skills from 81 seeds across 15 MITRE ATTACK categories. Across four frameworks and five models, DDIPE achieves 11.6% to 33.5% bypass rates, while explicit instruction attacks achieve 0% under strong defenses. Static analysis detects most cases, but 2.5% evade both detection and alignment. Responsible disclosure led to four confirmed vulnerabilities and two fixes.

### Who Guards the Guard? Non-Monotonic Monitor Prompt Robustness Under Persistent Control-Plane Corruption in Agentic AI Systems

**Code:** Google Scholar cluster VJ0EZdEBHJUJ

**Abstract:** (Scholar snippet; full abstract not found) … This phenomenon, which we term Persistent Control-Plane Corruption, is distinct from both direct prompt … The oracle is never an LLM and cannot be influenced by semantic content. …

### Conformity, Confabulation, and Impersonation: Persona Inconstancy in Multi-Agent LLM Collaboration

**Code:** doi:10.48550/arXiv.2405.03862

**Abstract:** This study explores the sources of instability in maintaining cultural personas and opinions within multi-agent LLM systems. Drawing on simulations of inter-cultural collaboration and debate, we analyze agents’ pre- and post-discussion private responses alongside chat transcripts to assess the stability of cultural personas and the impact of opinion diversity on group outcomes. Our findings suggest that multi-agent discussions can encourage collective decisions that reflect diverse perspectives, yet this benefit is tempered by the agents’ susceptibility to conformity due to perceived peer pressure and challenges in maintaining consistent personas and opinions. Counterintuitively, instructions that encourage debate in support of one’s opinions increase the rate of instability. Without addressing the factors we identify, the full potential of multi-agent frameworks for producing more culturally diverse AI outputs will remain untapped.

### Influence Is Not Authority: When Causal Guardrail Signals Make Legitimate Tool Use Look Like an Attack in Tool-Using LLM Agents

**Code:** arXiv:2608.29942

**Abstract:** The key limitation of current state-of-the-art influence-based guardrails is that they do not reliably distinguish a legitimate, user-authorized action from a malicious, unauthorized action when both rely on external tool information. This ambiguity can cause benign actions to trigger unnecessary verification and intervention, reducing utility and adding latency. We expose this limitation through an authorization-equivalence audit of 96 conditions derived from 24 base cases. Within matched source comparisons, we hold authorization, the exact committed action, and its intended effect fixed, changing only whether a required value comes from the user or a legitimate tool result. Although the action remains unchanged, this harmless relocation shifts the causal signal toward the attack region in all 24 cases under both Llama and Gemma scorers. Matched unauthorized controls show that the signal remains attack-sensitive, yet the benign relocation produces a larger average score shift than the actual change in authorization. Architecture-level evaluation shows how this mismatch propagates through guardrail designs. With a semantic monitor, attack success is 0% and utility is 28%, compared with 16% and 60% without it. A shadow-based guardrail allows every tested harmless run, yet does not reject matched unauthorized actions more often overall: 57.5% of unauthorized runs pass automatically before reaching the later security check, compared with 29.2% of authorized runs. These results show that the studied causal signal reveals what shaped an action without reliably encoding whether the action was authorized, and that reference construction and routing are integral to the effective security decision.

### Exploring LLM Agents for Cleaning Tabular Machine Learning Datasets

**Code:** arXiv:2503.06664

**Abstract:** High-quality, error-free datasets are a key ingredient in building reliable, accurate, and unbiased machine learning (ML) models. However, real world datasets often suffer from errors due to sensor malfunctions, data entry mistakes, or improper data integration across multiple sources that can severely degrade model performance. Detecting and correcting these issues typically require tailor-made solutions and demand extensive domain expertise. Consequently, automation is challenging, rendering the process labor-intensive and tedious. In this study, we investigate whether Large Language Models (LLMs) can help alleviate the burden of manual data cleaning. We set up an experiment in which an LLM, paired with Python, is tasked with cleaning the training dataset to improve the performance of a learning algorithm without having the ability to modify the training pipeline or perform any feature engineering. We run this experiment on multiple Kaggle datasets that have been intentionally corrupted with errors. Our results show that LLMs can identify and correct erroneous entries, such as illogical values or outlier, by leveraging contextual information from other features within the same row, as well as feedback from previous iterations. However, they struggle to detect more complex errors that require understanding data distribution across multiple rows, such as trends and biases.

### Skill Training with Corruption and Reconstruction Loop

**Code:** arXiv:2607.27557

**Abstract:** Large Language Models (LLMs) often struggle in highly specialized domains. Rather than parameter-level adaptation of LLMs which is costly and difficult to interpret, external skills (often defined as text files) have been recently proposed to augment LLMs for specialized domains. However, such skills rely on costly active human annotations or passive summarization of high-quality examples. In this paper, we propose a self-supervised approach for agent self-evolution that learns domain-specific skills directly from existing high-quality human artifacts, without additional human annotations or external rewards. Inspired by diffusion models, our approach follows a forward-loss-backward process to reconstruct human artifacts by iteratively learning the agent's external skill library rather than updating its model parameters. Experiments on short-drama screenwriting demonstrate that our approach enables agents to autonomously extract generalizable writing skills from human-authored scripts and substantially improve domain-specific generation quality. Our approach provides a scalable paradigm for agents to continuously learn many kinds of complex skills from existing high-quality human artifacts. Code and project page: https://github.com/skilltraining-project/skill-training and https://skilltraining-project.github.io

### AgentDrift: Unsafe Recommendation Drift Under Tool Corruption Hidden by Ranking Metrics in LLM Agents

**Code:** Google Scholar cluster cYFO55sjYi0J

**Abstract:** (Scholar snippet; full abstract not found) Tool-augmented LLM agents increasingly operate as multi-turn advisors in high-stakes domains, yet their evaluation relies on ranking metrics that measure what is recommended but …

### CRYPTIC: CRYptographic FPGA Targeting through Intelligent Corruption

**Code:** doi:10.1109/NAECON70028.2026.11675719

**Abstract:** Cryptographic accelerators implemented on Field-Programmable Gate Arrays (FPGAs) are highly vulnerable to bitstream-level fault injection attacks. However, executing spatially precise attacks on undocumented, proprietary bitstreams remains a significant reverse-engineering challenge. In this paper, we propose a novel, fully automated framework that leverages Large Language Models (LLMs) to guide bitstream manipulation without requiring access to the original HDL source code or post-synthesis netlists. Leveraging the Project X-Ray toolchain, we abstract proprietary Xilinx Artix-7 bitstreams into semantic FPGA Assembly (FASM). We apply an information-entropy heuristic to successfully localize high-density Look-Up Tables (LUTs) corresponding to Advanced Encryption Standard (AES) S-Boxes, and utilize an LLM to autonomously synthesize partial stuck-at faults. Our evaluation on a ChipWhisperer CW305 target yielded a critical discovery: targeted manipulation of the X40 slice column caused a catastrophic state machine failure rather than localized data-path corruption. The hardware consistently output a null-state ciphertext array (all zeros) regardless of the provided plaintext. These results expose a severe Denial of Service (DoS) vulnerability stemming from the physical co-location of sequential control routing and combinatorial cryptographic logic by standard synthesis tools. Our findings demonstrate the feasibility of neutralizing secure cryptographic wrappers via targeted bitstream mutation and underscore the necessity of enforcing strict physical isolation boundaries (p-blocks) in secure hardware floorplanning.

### Adversarial Attacks in Multi-Agent LLM Pipelines: Unveiling Structural Vulnerabilities in Agentic AI Architectures

**Code:** arXiv:2608.00718

**Abstract:** Multi-agent LLM pipelines orchestrate multiple specialized language model agents into structured workflows where intermediate outputs are passed across agents to solve complex tasks. This design introduces a security gap absent in single-agent settings: once an agent accepts adversarial content, it is propagated as trusted input throughout the pipeline. We argue that this vulnerability stems from the absence of boundary verification, a security primitive that enforces explicit validation of data as it crosses inter-agent boundaries, including content, identity, execution intent, and state integrity. Without such verification, modern pipelines embed implicit trust assumptions that are not adversarially robust, giving rise to structurally distinct attack surfaces (e.g., content injection, agent impersonation, plan deviation, and memory poisoning). Leveraging annotated production traces from the GAIA and SWE-Bench benchmark, we show that these vulnerabilities arise in benign deployments and largely evade existing evaluation frameworks. We further operationalize these failure modes within a controlled multi-agent setting and evaluate them across GPT-5-mini, Claude Sonnet 4.5, and Kimi K2.5 under identical pipeline configurations. The results reveal that attack success aligns with pipeline structure rather than model capability, indicating that adversarial vulnerability is fundamentally an architectural property and motivating a shift toward pipeline-level defenses.

### Depth and Autonomy: A Framework for Evaluating LLM Applications in Social Science Research

**Code:** arXiv:2510.25432

**Abstract:** Large language models (LLMs) are increasingly utilized by researchers across a wide range of domains, and qualitative social science is no exception; however, this adoption faces persistent challenges, including interpretive bias, low reliability, and weak auditability. We introduce a framework that situates LLM usage along two dimensions, interpretive depth and autonomy, thereby offering a straightforward way to classify LLM applications in qualitative research and to derive practical design recommendations. We present the state of the literature with respect to these two dimensions, based on all published social science papers available on Web of Science that use LLMs as a tool and not strictly as the subject of study. Rather than granting models expansive freedom, our approach encourages researchers to decompose tasks into manageable segments, much as they would when delegating work to capable undergraduate research assistants. By maintaining low levels of autonomy and selectively increasing interpretive depth only where warranted and under supervision, one can plausibly reap the benefits of LLMs while preserving transparency and reliability.

### When Does Memory Help? A Cost-Aware Evaluation of Long-Term Memory in Tool-Using LLM Agents

**Code:** arXiv:2609.05441

**Abstract:** Long-term memory for LLM agents is evaluated today by conversational recall benchmarks (LoCoMo, LongMemEval), which measure question answering over dialogue history, not whether remembered facts change what a tool-using agent does. We present MERIT (Memory Evaluation for Realistic Instrumented Tasks), a benchmark and harness that measures the marginal utility of memory for task-executing agents under explicit cost accounting. MERIT provides episodic tool-use tasks in three domains whose dependence on earlier-episode facts is verified by an automated leak check; a difficulty ladder ending in updated-fact recall; controlled memory corruption; and full token and dollar metering of every memory operation. Across 23,440 scored episodes ($42.57), a two-generation pilot on gpt-4.1-mini and a preregistered 3-model x 3-seed grid (GPT-4.1, Claude Haiku 4.5; memory side held fixed), memory lifts dependent-task success from a leak-verified floor of 0.00 to 0.55-1.00. On updated facts, embedding retrieval collapses unpredictably (0.30-0.95 across models; max seed gap 0.45), and agents act on a correctly retrieved value only 55% of the time, while update-on-write stores (a structured fact store and, notably, LLM summarization) remain at 0.70-1.00; the hybrid is worse than the fact store alone. A latest-generation spot-check (Claude Sonnet 5, gated on a clean full-replay control) reproduces the pattern. Swapping a memory's implementation moves task success by up to 60 points, and full replay is never economical: the best condition per domain delivers 2.7-3.9x its marginal utility per dollar. We release the benchmark, harness, and all traces.

### Auditable LLM Autonomy for Operational Decision-Making: Big Data Evidence and Decision Traces

**Code:** doi:10.32604/cmc.2026.082270

**Abstract:** : Auditable autonomy is becoming a practical requirement for deploying large language model (LLM) agents in operational workflows where recommendations can trigger consequential actions. Many autonomy claims remain hard to evaluate because studies emphasize task completion or fluent explanations while underreporting tool privileges, verification conditions, rollback feasibility, and trace completeness. This review develops a decision-making– centered framework that treats autonomy as an auditable engineering property. It introduces a three-plane big data foundation: an evidence plane with provenance and freshness constraints; a decision-trace plane that records retrieval identifiers, tool invocations, intermediate checks, and policy evaluations; and an outcomes plane that captures post-decision effects such as KPI shifts, rollback incidence, recurrence, and operator overrides. On this basis, we present an assurance stack taxonomy covering grounding controls, verification and precondition checks, action gating for risk bounding, and accountability mechanisms. We then propose an evaluation ladder that moves beyond text metrics toward evidence fidelity, action validity, and longitudinal stability, with reporting requirements that improve cross-domain comparability. Finally, we synthesize accidental failures and adversarial threats, including staleness, drift, prompt injection, partial execution, and trace tampering, and map trace-based detection signals and mitigations to the assurance stack.

### A survey on the security of long-term memory in llm agents: Toward mnemonic sovereignty

**Code:** Google Scholar cluster 3PNzuBGZ5KEJ

**Abstract:** (Scholar snippet; full abstract not found) … Research on large language model (LLM) security is shifting from "will the model leak … We organize the literature on memory poisoning, extraction, retrieval corruption, control-flow …

### AgentDrift: A Step-Labeled Benchmark of Injection-Hijacked LLM Agent Trajectories

**Code:** arXiv:2609.06972

**Abstract:** LLM agents complete tasks by issuing sequences of tool calls, and every observation they read is a channel through which an indirect prompt injection can enter. A successful injection has a characteristic shape when the trajectory is read in order: a benign prefix gives way to actions that serve the attacker rather than the user. Existing benchmarks measure whether such attacks succeed against live agents, and existing guard models judge a trace as a whole; no public corpus labels, step by step, where an injection enters a trajectory and which steps it corrupts. We present AgentDrift, a benchmark of 12,536 synthetic tool-call trajectories over five agent domains in which every one of the 71,024 steps carries one of four labels: benign, injection point, hijacked, or failed injection. The corpus contains 4,000 benign, 5,536 attacked, 1,500 failed-attack, and 1,500 hard-negative trajectories; attacked trajectories follow three compliance patterns whose label strings obey a stated regular grammar. Failed attacks carry an injection the agent resisted, and hard negatives carry legitimate content that resembles an attack, so a detector must separate attempt from success and deviation from novelty. Trajectories were generated by a single open model under category-specific protocols, enforced by a closed-vocabulary structural validator, screened by an LLM judge, and audited by hand on 1,200 trajectories; we show that the LLM judge was itself fooled by the hard negatives. A surface-feature logistic regression recovers only 55.4% of attacks (F1 0.647), including only 8.2% of partial hijacks and 23.1% of delayed executions, so nearly half of the attacks require modeling the behavioral sequence. We measure template concentration, attack-goal-family collapse, and world-identity leakage in the generated data, and release the corpus with its documentation under CC BY 4.0.

### ReBERT: LLM for Gate-Level to Word-Level Reverse Engineering

**Code:** doi:10.23919/DATE64628.2025.10993097

**Abstract:** In this paper, we introduce ReBERT, a specialized large language model (LLM) based on BERT, fine-tuned specifically for grouping bits into words within gate-level netlists. By treating the netlist as a form of language, we encode bits and their fan-in cones into sequences that capture structural dependencies. A novel contribution is augmenting BERT's embedding with a tree-based embedding strategy which mirrors the hierarchical nature of circuit designs in hardware. Leveraging the powerful representational learning capabilities of LLMs, we interpret hardware circuits at a higher level of abstraction. We evaluate ReBERT on various hardware designs, demonstrating that it significantly outperforms a state-of-the-art work based on partial structural matching in recovering word-level groupings. Our improvements are on average between 12.2% to 218.1% depending on degree of corrupting the structural patterns.

### TrainSDC: Characterizing and Mitigating Silent Data Corruption in Large Language Model Training

**Code:** arXiv:2608.30769

**Abstract:** LLM training is increasingly vulnerable to silent data corruption (SDC), yet existing protection methods largely treat Transformer computations uniformly because their vulnerability remains poorly understood. We present the first systematic characterization of SDC vulnerability across major computation interfaces in both the forward and backward passes of Transformer training. Our analysis reveals two distinct error propagation mechanisms: forward-pass vulnerability is highly location dependent, with faults on the Q/K path producing persistent training deviations, whereas backward-pass vulnerability is largely governed by gradient exponent distributions rather than computation locations. Motivated by these observations, we propose TrainSDC, a characterization-guided protection framework consisting of Q/K-path recomputation, residual-gain monitoring, and exponent-aware gradient scaling. Experiments on Llama 3.2-1B and Qwen3-0.6B show that TrainSDC maintains training behavior close to fault-free execution under both sparse and dense fault injection while introducing only 1.65%-6.76% runtime overhead.

### Governed Agentic Process Automation: A Floor-Safety Guarantee for Compliance-Critical LLM Routing

**Code:** doi:10.3390/a19080627

**Abstract:** Agentic Process Automation (APA) extends Robotic Process Automation by delegating workflow construction and runtime decisions to Large Language Model (LLM) agents. In regulated business processes, this autonomy creates a specific safety risk: an LLM may recognize elevated risk while still failing to trigger the human approval required by policy. We propose Governed APA, a runtime decision architecture that bounds LLM autonomy through schema-validated inputs, a closed action space, a policy-derived floor guardrail, and a deterministic fallback. We formalize the governed decision and establish a floor-safety property ensuring that the executed action cannot under-escalate below the policy-mandated minimum. The architecture is evaluated on a structured employee-onboarding case study with 166 profiles and explicit human-in-the-loop (HITL) ground truth. We compare a deterministic baseline, an ungoverned LLM, and a guarded LLM using two local models, Qwen2.5 and llama3.1. Ungoverned Qwen2.5 identified elevated risk but failed to escalate any of the 43 sensitive cases to mandatory human approval, yielding HITL recall equal to 0. Ungoverned llama3.1 showed the opposite failure mode, achieving full recall but producing unnecessary human-approval escalations. With the floor guardrail active, Qwen2.5 HITL recall increased to 1.0, llama3.1 recall remained 1.0, and inter-run stability of the compliance decision increased from 0.73 to 1.0 for Qwen2.5. On this dataset and configuration, no false-positive HITL escalation was introduced for Qwen2.5. These results show that compliance-critical APA requires architectural governance rather than prompt-level reliance on LLM discretion. The policy-derived floor guardrail enforces the floor-safety property and prevents silent under-escalation. The guarantee is local: it constrains the compliance routing decision under validated inputs and a trusted policy, and does not cover input corruption, policy errors, extraction failures, prompt injection, downstream tool misuse, or end-to-end workflow correctness. The evaluation is a single-process, two-model proof of concept, and generalization to other regulated workflows is a hypothesis for future validation.

### Operating a human-governed multi-machine LLM agent fleet: an experience report

**Code:** Google Scholar cluster R8eW995TYqwJ

**Abstract:** (Scholar snippet; full abstract not found) … We report on something different: a fleet of LLM agents … The safety-critical layer makes zero LLM calls: it is auditable … writers, corruption is local make the reader treat it that way. …

### 3D-VCD: Hallucination Mitigation in 3D-LLM Embodied Agents through Visual Contrastive Decoding

**Code:** arXiv:2604.08645

**Abstract:** Large multimodal models are increasingly used as the reasoning core of embodied agents operating in 3D environments, yet they remain prone to hallucinations that can produce unsafe and ungrounded decisions. Existing inference-time hallucination mitigation methods largely target 2D vision-language settings and do not transfer to embodied 3D reasoning, where failures arise from object presence, spatial layout, and geometric grounding rather than pixel-level inconsistencies. We introduce 3D-VCD, the first inference-time visual contrastive decoding framework for hallucination mitigation in 3D embodied agents. 3D-VCD constructs a distorted 3D scene graph by applying semantic and geometric perturbations to object-centric representations, such as category substitutions and coordinate or extent corruption. By contrasting predictions under the original and distorted 3D contexts, our method suppresses tokens that are insensitive to grounded scene evidence and are therefore likely driven by language priors. We evaluate 3D-VCD on the 3D-POPE and HEAL benchmarks and show that it consistently improves grounded reasoning without any retraining, establishing inference-time contrastive decoding over structured 3D representations as an effective and practical route to more reliable embodied intelligence.

### SHOUT-Trainer: Closed-loop Trainer for Silent Data Corruption Hunting and Observation Using Transformers

**Code:** doi:10.1109/IOLTS69666.2026.11633678

**Abstract:** Silent data corruptions (SDCs) pose a significant reliability challenge in modern computing systems as they silently propagate incorrect results without triggering architectural exceptions or system failures. Fault injection (FI) is the de facto approach for quantifying SDC behavior, but large-scale fault injection campaigns are computationally prohibitive and difficult to apply continuously during software development. In this work, we propose a learning-based framework that predicts the probability of SDC propagation directly from source code using large language models trained on FI-annotated programs. To improve prediction accuracy, we introduce a closed-loop training strategy in which weakly predicted SDC program sites are identified and used to guide targeted FI campaigns on the corresponding programs. The resulting FI data is incorporated into the training dataset, creating a closed-loop retraining cycle. Experimental evaluation shows that the closed-loop predictor reduces the mean absolute error by 43.3% on the poorly predicted SDC program sites of the open-loop model, confirming that targeted feedback improves prediction accuracy in the most challenging regions of the program space.

### Restore-R1: Efficient Image Restoration Agents via Reinforcement Learning with Multimodal LLM Perceptual Feedback

**Code:** arXiv:2512.18599

**Abstract:** Complex image restoration aims to recover high-quality images from inputs affected by multiple degradations such as blur, noise, rain, and compression artifacts. Recent restoration agents, powered by vision-language models and large language models, offer promising restoration capabilities but suffer from significant efficiency bottlenecks due to reflection, rollback, and iterative tool searching. Moreover, their performance heavily depends on degradation recognition models that require extensive annotations for training, limiting their applicability in label-free environments. To address these limitations, we propose a policy optimization-based restoration framework that learns an lightweight agent to determine tool-calling sequences. The agent operates in a sequential decision process, selecting the most appropriate restoration operation at each step to maximize final image quality. To enable training within label-free environments, we introduce a novel reward mechanism driven by multimodal large language models, which act as human-aligned evaluator and provide perceptual feedback for policy improvement. Once trained, our agent executes a deterministic restoration plans without redundant tool invocations, significantly accelerating inference while maintaining high restoration quality. Extensive experiments show that despite using no supervision, our method matches SOTA performance on full-reference metrics and surpasses existing approaches on no-reference metrics across diverse degradation scenarios.

### Multi-Agent Evolve: LLM Self-Improve through Co-evolution

**Code:** arXiv:2510.23595

**Abstract:** Reinforcement Learning (RL) has demonstrated significant potential in enhancing the reasoning capabilities of large language models (LLMs). However, the success of RL for LLMs heavily relies on human-curated datasets and verifiable rewards, which limit their scalability and generality. Recent Self-Play RL methods, inspired by the success of the paradigm in games and Go, aim to enhance LLM reasoning capabilities without human-annotated data. However, their methods primarily depend on a grounded environment for feedback (e.g., a Python interpreter or a game engine); extending them to general domains remains challenging. To address these challenges, we propose Multi-Agent Evolve (MAE), a framework that enables LLMs to self-evolve in solving diverse tasks, including mathematics, reasoning, and general knowledge Q&A. The core design of MAE is based on a triplet of interacting agents (Proposer, Solver, Judge) that are instantiated from a single LLM, and applies reinforcement learning to optimize their behaviors. The Proposer generates questions, the Solver attempts solutions, and the Judge evaluates both while co-evolving. Experiments on Qwen2.5-3B-Instruct demonstrate that MAE achieves an average improvement of 4.54% on multiple benchmarks. These results highlight MAE as a scalable, data-efficient method for enhancing the general reasoning abilities of LLMs with minimal reliance on human-curated supervision.

### Beyond Benchmarks: A Case Study of LLM-Generated Verus Specification Failures on Asterinas Vostd

**Code:** doi:10.1145/3832783.3834504

**Abstract:** Large language models (LLMs) have recently shown promise in automating formal specification generation, but their effectiveness has mainly been demonstrated on self-contained benchmark tasks. This paper examines the changes that occur when LLM-generated specifications are applied to an industrial verification project. To answer this question, we conducted experiments on Asterinas OSTD's Vostd repository, a Rust-based OS-kernel verification codebase built around cross-file dependencies and Entity--Model proof abstractions. We analyze six formal verification targets spanning 156 function-level tasks, 50 Rust source files, and 7,149 lines of code; the failure corpus contains 1,587 reviewed failure episodes nested within 270 model-specific repair traces produced by DeepSeek-V4-Flash, GPT-4o, and Qwen-Coder. Our results show that existing methods effective on benchmarks face significant challenges on Vostd, and that framework customization for industrial validation is necessary and has considerable potential. LLM-generated specifications break in systematic rather than random ways: they cluster across four verification stages (i.e., repository integration, Verus legality, semantic modeling, and proof construction), and their distributions vary across models and targets. We further show that verifier diagnostics do not always identify the true source of failure, and that verifier-guided repair can regress or stall rather than converge. These findings indicate that LLM-generated specifications fail not merely because industrial code is harder, but because failures are structured, stage-dependent, and often repaired in the wrong direction. Future evaluation and tooling should therefore move beyond final pass/fail outcomes and account for where specifications break, whether diagnostics identify the real cause, and whether repair makes progress or simply cycles through new errors.

### Trishieldrag: A three-ring defense-in-depth framework against knowledge corruption in retrieval-augmented generation

**Code:** Google Scholar cluster dyvOqFH2Rf0J

**Abstract:** (Scholar snippet; full abstract not found) … documents for lexical and statistical poisoning signatures; a Retrieval Scorer that re-ranks the retrieved set by a provenance and consistency-weighted trust score; and a Cross-LLM …

### Monitoring the Unseen Dependency: A Framework for Detecting LLM Drift-Induced Failures in Production Data Pipelines

**Code:** Google Scholar cluster uHbHIIcrr3sJ

**Abstract:** (Scholar snippet; full abstract not found) … LLM drift-induced failures: the phenomenon where behavioral changes or updates in the underlying foundational LLM … data corruption alerts to the pre-commit or pre-deployment phase. …

### When Latent Agents Lie: KV-Cache Integrity in Multi-Agent LLM Collaboration

**Code:** arXiv:2606.28958

**Abstract:** LLM agents can share more than text. In some systems, an agent can send a short visible message while also passing its full KV-cache state to another model. This hidden state can help the final model combine evidence from several agents, but it is also hard to inspect. A visible message may look harmless even if the hidden state has been changed. We study this problem in a multi-agent question-answering setup. Specialists each see part of the evidence, send a short commitment, and pass full KV-cache state to a coordinator. In clean runs, this latent collaboration improves over a matched text-only version. On transformed HiddenBench with Qwen3-4B, it reaches EM/F1 of 0.338/0.486, compared with 0.231/0.369 for text collaboration. Qwen3-8B and HotPotQA runs show the same direction of improvement. The problem appears when one specialist is malicious. Some false visible commitments can steer answers. More seriously, changing the hidden KV state can collapse performance even when the visible commitment still looks plausible. A verifier that checks only text misses this failure mode. Simple magnitude checks catch some obvious corruptions, but adaptive attacks can evade them while still damaging the final answer. The most reliable fix we find is not to guess whether hidden state looks normal, but to protect it in transport. We implement an HMAC-SHA256 manifest that binds the specialist, session, model, visible commitment, tensor metadata, and payload digest. It accepts all 774 honest replayed payloads and rejects all 295 recorded tampered payloads. The main lesson is that full-KV latent memory can be useful, but it should be treated as a security-sensitive object, not as ordinary internal model state.

### A Survey on Trustworthy LLM Agents: Threats and Countermeasures

**Code:** arXiv:2503.09648

**Abstract:** With the rapid evolution of Large Language Models (LLMs), LLM-based agents and Multi-agent Systems (MAS) have significantly expanded the capabilities of LLM ecosystems. This evolution stems from empowering LLMs with additional modules such as memory, tools, environment, and even other agents. However, this advancement has also introduced more complex issues of trustworthiness, which previous research focused solely on LLMs could not cover. In this survey, we propose the TrustAgent framework, a comprehensive study on the trustworthiness of agents, characterized by modular taxonomy, multi-dimensional connotations, and technical implementation. By thoroughly investigating and summarizing newly emerged attacks, defenses, and evaluation methods for agents and MAS, we extend the concept of Trustworthy LLM to the emerging paradigm of Trustworthy Agent. In TrustAgent, we begin by deconstructing and introducing various components of the Agent and MAS. Then, we categorize their trustworthiness into intrinsic (brain, memory, and tool) and extrinsic (user, agent, and environment) aspects. Subsequently, we delineate the multifaceted meanings of trustworthiness and elaborate on the implementation techniques of existing research related to these internal and external modules. Finally, we present our insights and outlook on this domain, aiming to provide guidance for future endeavors.

### Hybrid LLM and Rule-Based Synthetic Data Generation for Arabic Grammatical Error Correction

**Code:** doi:10.1109/ICMISI65108.2025.11115884

**Abstract:** The correction of Arabic grammatical errors has re-cently gained interest due to the emergence of strong transformer models trained on internet-scale Arabic data and large language models capable of generalizing well to new tasks and languages. However, Arabic grammatical error correction still suffers from data scarcity, and the available datasets are insufficient to train efficient transformer models capable of performing well on all types of Arabic grammatical errors. In this work, we introduce a scalable recipe to generate synthetic data for Arabic grammatical error correction and control the distribution of error types with high granularity to boost performance in underrepresented error types in the original training data. Models trained on our synthesized data demonstrate enhanced performance in addressing challenging Arabic grammatical errors compared to those trained without it, and they rival state-of-the-art Arabic grammatical error correction systems.

### Analysis of LLM Vulnerability to GPU Soft Errors: An Instruction-Level Fault Injection Study

**Code:** arXiv:2601.19912

**Abstract:** Large language models (LLMs) are highly compute- and memory-intensive, posing significant demands on high-performance GPUs. At the same time, advances in GPU technology driven by shrinking transistor sizes and lower operating voltages have made these devices increasingly susceptible to soft errors. While prior work has examined GPU reliability, most studies have focused on general-purpose applications or conventional neural networks mostly used for vision tasks such as classification and detection. In contrast, systematic analysis of modern large-scale LLMs remains limited, despite their rapid adoption in diverse application scenarios. Given the unique characteristics of LLMs, their resilience to soft errors may differ substantially from earlier models. To bridge this gap, we conduct the first instruction-level fault injection study of LLM inference. Our approach reveals reliability characteristics from multiple perspectives, highlighting the effects of model architecture, parameter scale, and task complexity. These findings provide new insights into LLM reliability and inform the design of more effective fault tolerance mechanisms.

### Lightweight Detection of Silent Data Corruption in Distributed Deep Learning

**Code:** Google Scholar cluster DqMU89UdFOwJ

**Abstract:** (Scholar snippet; full abstract not found) … We used the LLM to help discover and organize related work … The LLM is not an author and did not contribute intellectual … , or personal information with the LLM beyond brief, high-level …

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

### Faster WIND: Accelerating Iterative Best-of-$N$ Distillation for LLM Alignment

**Code:** arXiv:2410.20727

**Abstract:** Recent advances in aligning large language models with human preferences have corroborated the growing importance of best-of-N distillation (BOND). However, the iterative BOND algorithm is prohibitively expensive in practice due to the sample and computation inefficiency. This paper addresses the problem by revealing a unified game-theoretic connection between iterative BOND and self-play alignment, which unifies seemingly disparate algorithmic paradigms. Based on the connection, we establish a novel framework, WIN rate Dominance (WIND), with a series of efficient algorithms for regularized win rate dominance optimization that approximates iterative BOND in the parameter space. We provides provable sample efficiency guarantee for one of the WIND variant with the square loss objective. The experimental results confirm that our algorithm not only accelerates the computation, but also achieves superior sample efficiency compared to existing methods.

### Individually Sensible, Collectively Harmful: Simulating Commons Failure in LLM Societies

**Code:** Google Scholar cluster SUq4eMqh-I0J

**Abstract:** (Scholar snippet; full abstract not found) … loop best response BR, logit- 140 quantal-response equilibrium QRE, Bayesian best response… Yet no agent is behaving pathologically: each is responding 210 sensibly to the incentives …

### Reaction-Aware Quantal Path Selection for Interactive Merging: Driver Type Beliefs and Constrained Language Inputs

**Code:** Google Scholar cluster VGGRox1-W24J

**Abstract:** (Scholar snippet; full abstract not found) … responses. This study develops a discrete path selection framework that combines reactive prediction, driver type beliefs, logit quantal response… An LLM can infer the likely behavior of a …

### Systematic Execution Failures of LLM Delegates in RFQ Markets

**Code:** Google Scholar cluster fXDHHVLBF-kJ

**Abstract:** (Scholar snippet; full abstract not found) … Applying this bound to an LLM response matrix requires complete support for the explicit answerlabel set; partial top-logprob rows cannot establish the required choice probability. …

### Personalization as a Game: Equilibrium-Guided Generative Modeling for Physician Behavior in Pharmaceutical Engagement

**Code:** arXiv:2604.06860

**Abstract:** We present \textbf{EGPF} (Equilibrium-Guided Personalization Framework), a mathematically rigorous architecture unifying Bayesian game theory, category theory, information theory, and generative AI for hyper-personalized physician engagement in the pharmaceutical domain. Our framework models the pharma--physician interaction as an incomplete-information Bayesian game where physician behavioral types are inferred via functorial mappings from observational categories, equilibrium strategies guide content generation through large language models (LLMs), and information-theoretic feedback loops ensure adaptive recalibration. We formalize behavior composition through category-theoretic functors, natural transformations, and monoidal structures, enabling modular, composable physician archetypes that respect structural invariants under domain shift. We introduce a novel \textit{Rate-Distortion Equilibrium} (RDE) criterion that bounds the personalization--privacy tradeoff, an \textit{Evolutionary Game Dynamics} layer for population-level behavior modeling, a \textit{Mechanism Design} module for incentive-compatible engagement, and a \textit{Sheaf-Theoretic} extension for multi-scale behavioral consistency. We prove convergence of our iterative belief-update mechanism at rate $O(\frac{K\log K}{t \cdot C_{\min}})$ and establish finite-sample regret bounds. Extensive experiments on synthetic pharma datasets and a real-world HCP engagement pilot demonstrate a 34\% improvement in engagement prediction (AUC) and 28\% lift in content relevance scores compared to state-of-the-art methods.

### Diversity Without Fidelity: A Solver-Sampler Mismatch in Multi-Agent LLM Negotiation Simulation

**Code:** arXiv:2604.11840

**Abstract:** Language models are increasingly used to simulate people: survey respondents, negotiators, stakeholders in policy exercises. In that role a model should reproduce how people plausibly behave, hesitating, conceding late, and settling for imperfect deals, rather than playing the best move. We call this the sampler role, in contrast to the solver role of finding the best move, and we test how the reasoning modes providers ship to strengthen models as solvers affect it. Our testbed is multi-party negotiation: five agents bargain over a regulation for fifteen turns, and unresolved issues are decided by an authority. Agents without a structured memory of the negotiation almost never reach agreement, whether reasoning is on or off: 314 of 315 such runs end with the authority deciding. What reasoning changes is how the failure looks. With reasoning enabled, one model family negotiates visibly, with varied moves, concessions in most runs, and a different path every time, yet still ends without agreement in fifteen runs of fifteen. Diversity checks would pass a model whose endings never change. Two further results show the task permits agreement: when agents write their own short running notes on the negotiation, agreement becomes the norm, while the same notes supplied ready-made change nothing; and hand-coded agents following textbook concession strategies agree in most runs under identical rules. Simulation pipelines should therefore vet models as samplers, on the distributions of outcomes they produce. Fidelity as a sampler must be tested on its own: solver strength is no guide to it, and switching on reasoning leaves it where it was.

### Test-Time Compute Games

**Code:** arXiv:2601.21839

**Abstract:** Test-time compute has emerged as a promising strategy to enhance the reasoning abilities of large language models (LLMs). However, this strategy has in turn increased how much users pay cloud-based providers offering LLM-as-a-service, since providers charge users for the amount of test-time compute they use to generate an output. In our work, we show that the market of LLM-as-a-service is socially inefficient: providers have a financial incentive to increase the amount of test-time compute, even if this increase contributes little to the quality of the outputs. To address this inefficiency, we introduce a reverse second-price auction mechanism where providers bid their offered price and (expected) quality for the opportunity to serve a user, and users pay proportionally to the marginal value generated by the winning provider relative to the second-highest bidder. To illustrate and complement our theoretical results, we conduct experiments with multiple instruct models from the $\texttt{Llama}$ and $\texttt{Qwen}$ families, as well as reasoning models distilled from $\texttt{DeepSeek-R1}$, on math and science benchmark datasets.

### The Minority Report: A Three-Agent LLM Survival Game

**Code:** Google Scholar cluster pYcW-AhYMxEJ

**Abstract:** (Scholar snippet; full abstract not found) … how it reasons about the likely responses of others in multi-agent … Despite a rapidly growing literature on LLM strategic behavior, … [8] RD McKelvey and TR Palfrey, “Quantal response …

### InfRL: Inference-time Reinforcement Learning for Research Idea Optimization

**Code:** doi:10.1145/3770855.3819029

**Abstract:** Large language models (LLMs) possess extensive latent knowledge yet remain largely static at inference. Once prompted, their generation policy typically cannot evolve, and post-hoc ''self-reflection'' methods provide no explicit principled learning signals. To address this limitation, we formally model iterative research idea optimization as a finite-horizon Markov Decision Process and propose InfRL (Inference-time Reinforcement Learning), a framework designed for effective policy improvement at inference without updating model weights. InfRL coordinates three specialized LLM agents: (i) a State Transition Agent that proposes candidate ideas; (ii) a Policy Update Agent that learns feedback strategies based on idea trajectories; and (iii) a Reward Agent that assigns normalized, comparative rewards, enabling nuanced reinforcement signals. This empowers the Policy Update Agent to dynamically refine feedback strategies, progressively leveraging latent knowledge encoded within the LLM. We evaluate InfRL on five balanced datasets covering 500 recent research papers from health, genetics, environment, neuroscience, and engineering domains. Compared to a single-pass GPT-4o baseline and a strong self-reflection baseline, InfRL improves the novelty of generated ideas by 3.93%--32.7% and the feasibility of generated ideas by 70.1%--448.6% with GPT-4o, exhibiting consistent improvements across ten inference-time iterations. Ablation studies underscore the critical roles of our reward formulation and modular agent design, while human evaluations confirm alignment between reward trends and perceived idea quality. InfRL thus offers a practical and domain-agnostic approach to harness reinforcement learning during inference, bridging the gap between static prompting and computationally intensive parameter-level fine-tuning. The code and the dataset we use are provided at: https://github.com/amir-hassan25/InfRL

### The Internal Anatomy of Strategic Choice in Large Language Models

**Code:** arXiv:2609.07478

**Abstract:** Large language models act as strategic agents and models of human choice, yet choosing like a strategic agent does not mean computing like one. We recorded activations from four open-weight models --- dense and mixture-of-experts, including a matched base--instruct pair --- in one-shot play of 144 strict ordinal $2\times2$ games. We followed a prespecified incentive from prompt, through activations, to choice. Dense models mirrored the unadjusted human decline with game complexity. Incentive and choice were detectable in every model, but models differed in whether incentive reached the choice, aligned with it and, where tested, whether strengthening it shifted preference. The base and instruction-tuned Qwen2.5 models chose almost identically at baseline yet differed in whether incentive reached choice. Fixed decision cues were distinguishable internally but changed choices selectively. Similar behaviour can rest on different computation; post-training can reshape the path from represented incentive to decision while leaving behaviour and decodable information largely intact.

### Towards autonomous quantum physics research using LLM agents with access to intelligent tools

**Code:** arXiv:2511.11752

**Abstract:** Artificial intelligence (AI) is used in numerous fields of science, yet the initial research questions and targets are still almost always provided by human researchers. AI-generated creative ideas in science are rare and often vague, so that it remains a human task to execute them. Automating idea generation and implementation in one coherent system would significantly shift the role of humans in the scientific process. Here we present AI-Mandel, an LLM agent that can generate and implement ideas in quantum physics. AI-Mandel formulates ideas from the literature and uses a domain-specific AI tool to turn them into concrete experiment designs that can readily be implemented in laboratories. The generated ideas by AI-Mandel are often scientifically interesting - for two of them we have already written independent scientific follow-up papers. The ideas include new variations of quantum teleportation, primitives of quantum networks in indefinite causal orders, and new concepts of geometric phases based on closed loops of quantum information transfer. AI-Mandel is a prototypical demonstration of an AI physicist that can generate and implement concrete, actionable ideas. Building such a system is not only useful to accelerate science, but it also reveals concrete open challenges on the path to human-level artificial scientists.

### 가부반응 데이터 특성을 가지는 탄약 체계의 신뢰도 추정방법 비교

**Code:** Google Scholar cluster DFiZbh9v7qYJ

**Abstract:** (Scholar snippet; full abstract not found) … Quantal-response data, following a binomial distribution at each sampling time, characterizes lifetimes of one-shot systems. Various quantal-response data of different sample size... …

### GENERALIZED $ BARTOSZY\\'{N} SKI'S $ VIRUS MODEL

**Code:** Google Scholar cluster JX7Hsf3yA9kJ

**Abstract:** (Scholar snippet; full abstract not found) … While the threshold model is easy to understand and implement, there are several rea sons that the quantal response model can replace the threshold model. First, the hypothesis of …

### Optimal Design for Locally Weighted Quasi-Likelihood Response Curve Estimator

**Code:** Google Scholar cluster XxvGx9DrGEcJ

**Abstract:** (Scholar snippet; full abstract not found) … The estimation of the response curve is the important problem in the quantal bioassay. When we estimate the response curve, we determine the design points in advance of the …

### Re-evaluating Open-ended Evaluation of Large Language Models

**Code:** arXiv:2502.20170

**Abstract:** Evaluation has traditionally focused on ranking candidates for a specific skill. Modern generalist models, such as Large Language Models (LLMs), decidedly outpace this paradigm. Open-ended evaluation systems, where candidate models are compared on user-submitted prompts, have emerged as a popular solution. Despite their many advantages, we show that the current Elo-based rating systems can be susceptible to and even reinforce biases in data, intentional or accidental, due to their sensitivity to redundancies. To address this issue, we propose evaluation as a 3-player game, and introduce novel game-theoretic solution concepts to ensure robustness to redundancy. We show that our method leads to intuitive ratings and provide insights into the competitive landscape of LLM development.

### Mechanism Design Is Not Enough: Prosocial Agents for Cooperative AI

**Code:** arXiv:2605.08426

**Abstract:** Ensuring that AI agents behave safely and beneficially when interacting with other parties has emerged as one of the central challenges of modern AI safety. While mechanism design, as the theory of designing rules to align individual and collective objectives, can incentivize cooperative behavior, it is still an open question whether it alone is sufficient to maximize LLM agents' social welfare. This work proves that the answer is negative: drawing from incomplete contract theory, we formally show that when contracts cannot distinguish all relevant future contingencies, there is a strictly positive welfare loss that no realistic mechanism can eliminate. We show that prosocial agents, who weigh others' welfare alongside their own, can close this gap and achieve outcomes that are socially superior and individually beneficial. Experimentally, we show that in multi-agent resource-allocation environments and canonical social dilemmas where agents are powered by large language models, prosociality is beneficial. The implication for AI safety is clear: to enable cooperative interactions at scale, designing adequate mechanisms is not sufficient; agents must be built to be intrinsically prosocial.

### Achieving Logarithmic Regret in KL-Regularized Zero-Sum Markov Games

**Code:** arXiv:2510.13060

**Abstract:** Reverse Kullback-Leibler (KL) divergence-based regularization with respect to a fixed reference policy is widely used in modern reinforcement learning to preserve the desired traits of the reference policy and sometimes to promote exploration (using uniform reference policy, known as entropy regularization). Beyond serving as a mere anchor, the reference policy can also be interpreted as encoding prior knowledge about good actions in the environment. In the context of alignment, recent game-theoretic approaches have leveraged KL regularization with pretrained language models as reference policies, achieving notable empirical success in self-play methods. Despite these advances, the theoretical benefits of KL regularization in game-theoretic settings remain poorly understood. In this work, we develop and analyze algorithms that provably achieve improved sample efficiency under KL regularization. We study both two-player zero-sum matrix games and Markov games: for matrix games, we propose OMG, an algorithm based on best response sampling with optimistic bonuses, and extend this idea to Markov games through the algorithm SOMG, which also uses best response sampling and a novel concept of superoptimistic bonuses. Both algorithms achieve a logarithmic regret in $T$ that scales inversely with the KL regularization strength $β$ in addition to the traditional $\widetilde{\mathcal{O}}(\sqrt{T})$ regret without the $β^{-1}$ dependence.

### Modeling the behavior of LLM agents in a repeating Prisoner's Dilemma Game: tolerance to defection and the memory window effect

**Code:** Google Scholar cluster mPdN8NpV3TEJ

**Abstract:** (Scholar snippet; full abstract not found) … individuals with predefined age and gender characteristics (hereafter, LLM agents). The cooperative behavior of LLM agents is examined within the framework of Markov strategies, …

### When Does Nash Learning from Human Feedback Cycle? Spectral Thresholds, Limit Cycles, and Stationary Energy Laws

**Code:** Google Scholar cluster Adu2OCv2JKcJ

**Abstract:** (Scholar snippet; full abstract not found) … (3) For 021 three responses, where the nonlinear dynamics 022 are tractable, we prove that an attracting cy- 023 cle exists and derive its energy as a function 024 of τ/η alone and, …

### 신경-근 접합부 질환의 전기진단검사

**Code:** Google Scholar cluster b-tE8J8ENHkJ

**Abstract:** (Scholar snippet; full abstract not found) … is the reduced electrical response to the ACh quanta(reduced quantal response(q)). … reduced number of synaptic vesicles released in response to the NAP(reduced quantal content(m)). …

### Building Resilience in Pedestrian Safety Against Behavioral Uncertainty

**Code:** doi:10.3390/app16147314

**Abstract:** Pedestrian safety at urban intersections is influenced by complex interactions among environmental conditions, social cues, and boundedly rational behavioral responses, making intervention planning under uncertainty particularly challenging. Existing studies have largely emphasized descriptive analysis or predictive modeling, with limited attention to prescriptive decision support under data scarcity. This study proposes a Bayesian-network-based robust optimization framework for pedestrian safety planning, complemented by a large language model (LLM)-assisted parameter-elicitation process. We first construct a three-layer Bayesian network based on the stimulus–organism–response paradigm to represent the propagation of risk from environmental cues through latent psychological mechanisms to behavioral violations and accident risk. To support model initialization when site-specific behavioral data are limited, we introduce an LLM-assisted elicitation protocol that maps literature-based qualitative evidence to intervention mechanisms, effect directions, and qualitative strength classes. Numerical parameter ranges are subsequently assigned through explicit mapping rules rather than generated directly by the LLM. We then formulate a bi-objective robust optimization model that distinguishes between physical interventions, which alter root-node distributions, and cognitive interventions, which modify conditional probability tables. Using the ϵ-constraint method, the framework generates Pareto-optimal intervention portfolios and evaluates cost–risk trade-offs under behavioral uncertainty and adverse operating scenarios.

### WolfSociety: Understanding Collective Risk from Harmful-Agent Scaling in Financial Agent Societies

**Code:** arXiv:2609.05591

**Abstract:** Safety evaluations typically focus on individual agents, but interacting agents can spread harmful information and influence the environment in which later decisions are made. We study how collective failure changes with harmful-agent fraction and society size in a controlled financial agent society, where agents communicate over a social network and trade in a shared market. In the primary financial scenario, collective failure requires broad harmful diffusion together with severe price dislocation or liquidity stress. Across all tested society sizes, failure remains rare at low harmful fractions but rises sharply over a narrow range. As society size grows from N=100 to N=2000, the harmful fraction associated with a 50% failure probability decreases from 4.7% to 2.2%, while the corresponding number of harmful agents increases from approximately 5 to 44. In contrast, when the number of harmful agents is held fixed, their impact becomes weaker as the society grows. Controlled interventions further show that broader network reach shifts the collapse boundary toward lower harmful fractions, whereas stronger conformity alone has little effect. To characterize these effects, we introduce Agent Society Dynamics, a finite-size framework for relating harmful-agent fraction, society size, and interaction structure to collective failure. Overall, our results reveal a nonlinear, size-dependent collapse transition in financial agent societies, showing that collective failure depends not only on the prevalence of harmful agents but also on the size and interaction structure of the surrounding society. Code is available at https://github.com/SAIL-Research-Lab/WolfSociety.

### Regularized policy gradient with learned mixtures of Gaussians for games with continuous actions

**Code:** arXiv:2609.36787

**Abstract:** Most successes of superhuman game-playing algorithms are in games with discrete actions, yet in auctions, robotics, sports, or trading, actions are nearly continuous. Prior techniques either rely on expert-designed discretizations or are sample inefficient. We present a scalable policy-gradient algorithm for large sequential games with continuous or mixed discrete and continuous actions. It combines magnetic mirror descent with a mixture of Gaussians reparametrization, trained via self-play. We show that it approximates equilibrium in games where gradient descent fails. In sequential games, it outperforms neural fictitious self-play and matches or outperforms the final strategies of policy space response oracles with 3.5--5.5$\times$ fewer samples. In heads-up no-limit Texas hold'em, it performs on par with Slumbot.

### How generative AI behaves in the newsvendor problem: a behavioral experimental study

**Code:** doi:10.1108/rbe-04-2026-0007

**Abstract:** This study investigates behavioral biases of generative artificial intelligence (AI) models, specifically GPT-4o and Claude-Haiku-4.5, in inventory management using the newsvendor problem. This study compares AI decision-making with human-subject experiments to assess whether large language models (LLMs) replicate human cognitive bias and to identify prompt-design strategies that improve alignment with optimal outcomes. Controlled newsvendor experiments were conducted with generative AI models, mirroring established human-subject laboratory protocols. Prompt framing was systematically varied across three modifications: removing explicit waste and missed-profit information, simplifying instruction format and providing explicit optimization formulas. Results were benchmarked against normative economic predictions and existing human behavioral findings. Generative AI exhibits human-like human biases including risk aversion, loss aversion and demand chasing, but exhibits a stronger demand-chasing tendency than human participants. It responds to hypothetical incentives and displays bounded rationality. Prompt design significantly influences decision quality, producing decisions closer to theoretical benchmarks. This study empirically tests generative AI behavioral biases within a structured operations management experiment. It introduces a replicable methodology, extends findings across two architecturally distinct LLMs from different developers, and demonstrates that deliberate prompt design meaningfully reduces AI decision bias. The study also contributes a conceptual distinction between functionally analogous behavioral patterns and intrinsic psychological dispositions in LLMs, offering a more precise interpretive framework for AI decision-making research in operational contexts.

### Comparing Exploration-Exploitation Strategies of LLMs and Humans: Insights from Standard Multi-armed Bandit Experiments

**Code:** arXiv:2505.09901

**Abstract:** Large language models (LLMs) are increasingly used to simulate or automate human behavior in complex sequential decision-making settings. A natural question is then whether LLMs exhibit similar decision-making behavior to humans, and can achieve comparable (or superior) performance. In this work, we focus on the exploration-exploitation (E&E) tradeoff, a fundamental aspect of dynamic decision-making under uncertainty. We employ canonical multi-armed bandit (MAB) experiments introduced in the cognitive science and psychiatry literature to conduct a comparative study of the E&E strategies of LLMs, humans, and MAB algorithms. We use interpretable choice models to capture the E&E strategies of the agents and investigate how enabling thinking traces, through both prompting strategies and thinking models, shapes LLM decision-making. We find that enabling thinking in LLMs shifts their behavior toward more human-like behavior, characterized by a mix of random and directed exploration. In a simple stationary setting, thinking-enabled LLMs exhibit similar levels of random and directed exploration compared to humans. However, in more complex, non-stationary environments, LLMs struggle to match human adaptability, particularly in effective directed exploration, despite achieving similar regret in certain scenarios. Our findings highlight both the promise and limits of LLMs as simulators of human behavior and tools for automated decision-making and point to potential areas for improvement.

### General Social Agents

**Code:** arXiv:2508.17407

**Abstract:** Useful social science theories predict behavior across settings. However, applying a theory to make predictions in new settings is challenging: rarely can it be done without ad hoc modifications to account for setting-specific factors. We argue that AI agents put in simulations of those novel settings offer an alternative for applying theory, requiring minimal or no modifications. We present an approach for building such "general" agents that use theory-grounded natural language instructions, existing empirical data, and knowledge acquired by the underlying AI during training. To demonstrate the approach in settings where no data from that data-generating process exists--as is often the case in applied prediction problems--we design a heterogeneous population of 883,320 novel games. AI agents are constructed using human data from a small set of conceptually related but structurally distinct "seed" games. In preregistered experiments, on average, agents predict initial human play in a random sample of 1,500 games from the population better than (i) a cognitive hierarchy model, (ii) game-theoretic equilibria, and (iii) out-of-the-box agents. For a small set of separate novel games, these simulations predict responses from a new sample of human subjects better even than the most plausibly relevant published human data.

### Monotone Local Linear Quasi-Likelihood Response Curve Estimates

**Code:** Google Scholar cluster ChSlwRXfAyUJ

**Abstract:** (Scholar snippet; full abstract not found) In bioassay, the response curve is usually assumed monotone increasing, but its exact form is unknown, so it is very difficult to select the proper functional form for the parametric model. …

### CoNav-UAV: Cooperative Dual-Altitude Aerial Navigation via Stackelberg Learning

**Code:** arXiv:2608.01802

**Abstract:** Target-oriented vision-and-language navigation (VLN) on aerial platforms is attracting growing attention for missions such as disaster rescue, infrastructure inspection, and security patrol. In this task, an unmanned aerial vehicle (UAV) needs to locate targets given only a concise description of their appearance and surroundings. This requires global exploration and grounding as well as collision-free close-range approach, two interleaved processes difficult to reconcile within a single agent. Most existing methods transfer the ground VLN paradigm to a low-altitude UAV and compensate for its inefficient exploration with external assistance. A recent attempt deploys two UAVs at complementary altitudes yet still relies on privileged information and trains its two agents independently, precluding any mutual adaptation essential for cooperation. Here we propose CoNav-UAV, which explicitly models the task as a Stackelberg game between a high-altitude leader and a low-altitude follower, with the system operating on onboard visual and linguistic inputs alone. To solve this game, we introduce Iterative Stackelberg Learning. The leader's high-level vision-language reasoning is refined via memory-based in-context learning, while the follower's precise motion control is updated via DAgger-style expert distillation. The alternation drives both agents toward a Stackelberg equilibrium. CoNav-UAV consistently outperforms single- and dual-agent baselines across three high-fidelity urban scenes from the AerialVLN benchmark. Success rate improves by up to 30.8 points on the learning scene, and 9.0 points under cross-scene transfer while using about 3x less adaptation data. Further analyses validate the complementary gains of the leader and follower updates and reveal robust gains yet distinct learning dynamics across VLM backbones.

### Bayes-Sufficient Compression Is Not Enough: How Does Communication Help Multi-Agent Systems?

**Code:** arXiv:2610.03769

**Abstract:** Multi-agent LLM systems pair a sender with broad context and an executor with a limited local view. We study when a short message improves the executor's next decision, when raw context is preferable, and when a stronger sender helps. Our framework, \emph{receiver-relative bounded coordination}, expresses message utility as receiver gain minus protocol tax. Compression beats raw context when tax savings exceed losses from omitted information and decoder mismatch. Even \emph{Bayes-sufficient} compression can fail when a bounded executor cannot use its surface form. A three-stage decomposition separates externalization, absorption, and \emph{action closure}, explaining how errors remain after the correct content reaches the receiver. Under a single-crossing condition, sender upgrades help above a receiver-burden threshold. Across six benchmarks, the same Qwen protocol raises ContextBench joint accuracy from $0.633$ to $0.775$ but lowers ToolSandbox from $0.889$ to $0.653$. Fixed-message replay reveals closure failures despite correct artifact recovery. These results guide an inference-time selector that improves the accuracy-cost frontier on the evaluated communication regimes.

### DON'T: ATraceable CAPABILITY SPLIT IN SEALED-BID AUCTIONS

**Code:** Google Scholar cluster LPRvKzF74k0J

**Abstract:** (Scholar snippet; full abstract not found) … the input text to the LLM. Better still, consider skipping the LLM and submitting your original text: we, … Quantal response equilibrium as a measure of strategic sophistication: Theory and …

### Strategic Oversight for AI Safety: A Stackelberg Security Games Perspective

**Code:** doi:10.1109/MIS.2026.3725453

**Abstract:** Existing safety frameworks of artificial intelligence (AI) systems largely treat alignment as a static optimization problem (e.g., tuning models to desired behavior) while overlooking the dynamic, adversarial incentives that shape how data are collected, how models are evaluated, and how they are ultimately deployed. We propose a new perspective on AI safety grounded in Stackelberg Security Games (SSGs): a class of game-theoretic models designed for adversarial resource allocation under uncertainty. By viewing AI oversight as a strategic interaction between defenders (auditors, evaluators, and deployers) and attackers (malicious actors, misaligned contributors, or worst-case failure modes), SSGs provide a unifying framework for reasoning about incentive design, limited oversight capacity, and adversarial uncertainty across the AI lifecycle. We illustrate how this framework can inform 1) training-time auditing against data/feedback poisoning, 2) pre-deployment evaluation under constrained reviewer resources, and 3) robust multimodel deployment in adversarial environments. This synthesis bridges algorithmic alignment and institutional oversight design.

### [보고서] 형태학적 흔적 증거의 동일성 판단에 대한 연구

**Code:** Google Scholar cluster WXjX-1YS438J

**Abstract:** (Scholar snippet; full abstract not found) … 연구범위 및 연구수행 방법○ 계수적 반응자료(quantal response data) 개념 및 사용 가능한 분석모형의 이론 정립○ 민감도 시험(Bruceton test, Neyer test, 3POD test)의 이론 및 방법 정립○ …

### Eliciting a new probability–possibility transformation anchored in the maximum point of an expected utility and weighted entropy framework

**Code:** Google Scholar cluster AEpPmwD6ei0J

**Abstract:** (Scholar snippet; full abstract not found) … 16]), including mathematical transformations from large 78 language models (LLM) with AI … [44]; also, a generalization of quantal 158 response equilibrium via non-expected utility …

### Context-dependent agent evaluation with orthogonal equilibrium learning

**Code:** arXiv:2609.31897

**Abstract:** Many applications require to evaluate agents under contextual information (e.g., a prompt, task, or user group). We study how to perform such context-dependent agent evaluation from offline feedback. Existing score-based models for this purpose (e.g., Bradley-Terry) impose a transitive preference ordering, which fails to reflect collective preferences when human judgements are heterogeneous. Inspired by social choice theory, we frame evaluation as a contextual game between two players, each selecting a distribution over agents as the strategy to receive greater collective preference than the other. Then, the support of the Nash equilibrium defines a context-specific set of winners. However, learning context-specific equilibria from offline logs is difficult because each context reveals human feedback on only a subset of agents, and, hence, a naive plug-in estimator can therefore be biased. To address these challenges, we propose NashEval, a general framework for robust contextual equilibrium learning. NashEval first constructs debiased estimates of the contextual payoff matrix that characterizes the game. NashEval then learns the context-to-equilibrium mapping with a tailored orthogonal loss, which avoids the need to solve a separate game for each context. We show theoretically that errors in estimating the nuisance functions underlying the payoff matrix affect the risk of the learned equilibrium (i.e., exploitability) only through higher-order terms. Across various experiments, NashEval improves robustness of equilibrium learning and consistently identifies the set of top-performing agents across contexts.

### Test-time Reinforcement Learning in Imperfect Information Games

**Code:** arXiv:2608.30635

**Abstract:** Test-time reasoning has significantly improved performance in domains ranging from games to language models. However, test-time policy changes with formal guarantees on the performance of the resulting strategy remain a challenge in two-player zero-sum imperfect-information games. Existing solutions are limited to tabular methods or single gradient step updates. In this work, we investigate policy-gradient algorithms as a method for scalable test-time reasoning. We extend the concept of gadget game, tabular technique for test-time search, to the reinforcement learning setting. Unlike prior approaches, we represent the gadget game implicitly by modified sampling and neural policy rather then explicitly by constructing it, thereby removing constraints on subgame size. Furthermore, we formally prove that, unlike prior tabular algorithms, regularized policy-gradient algorithms limit possible strategy degradation caused by test-time reasoning, even without the gadget games. Our evaluation across small- and large-scale games confirms that additional test-time training often substantially improves performance relative to the blueprint strategy.

### The Assistant is not the Population

**Code:** Google Scholar cluster cRmiBM-O32wJ

**Abstract:** (Scholar snippet; full abstract not found) Social simulation asks a language model to reproduce distributions of human behavior: what a population answers, how a group negotiates, which number a person picks. We treat this …

### Epistemic safety in scalable oversight

**Code:** Google Scholar cluster U7bp2KSNRIgJ

**Abstract:** (Scholar snippet; full abstract not found) … Quantal response models receivers who make stochastic mistakes when choosing actions or interpreting evidence [24]. Distorted belief-update models capture systematic departures …

### One AI Signal, Many Human Judgments: A Bayesian Cascade Analysis of AI-based Credibility Indicators in Online Information Spread

**Code:** arXiv:2608.30311

**Abstract:** Social media platforms increasingly use AI-based credibility indicators to help users judge misinformation. Unlike individual human-AI decision-making, these indicators are embedded in information spread: users see both an AI prediction and earlier judgments shaped by the same AI, and their own judgments may then enter the public history. Yet how to analytically characterize this process remains under-explored. We therefore introduce a social-learning lens for this setting by extending the classical Bayesian cascade model with the AI indicator as a shared public signal. The resulting Gateway condition compares the evidence from the AI prediction with users' private impressions. Through this view, we show that AI changes what public history means. Crowd agreement may reflect accumulated independent human evidence, or repeated dependence on the same AI prediction. This creates a preservation-correction trade-off: stronger reliance on AI can preserve correct predictions, but can also lock in incorrect ones by blocking corrective private impressions. We calibrate the model using human-subject data on news veracity judgments. Although the AI outperforms human users, the average user weights it below her own impression but above several peer judgments, while individual users vary from discounting the AI to relying on it enough to cascade. Simulations show that over-reliance on a weak AI is especially harmful, and that diversifying AI signals across users can better keep the crowd informative. We conclude with implications for understanding human-AI interaction in information spread and designing misinformation interventions.

### Watch, Infer, Coordinate: Inferring Robot Partner Constraints for Zero-Shot Coordination

**Code:** arXiv:2610.02170

**Abstract:** Robots operating in the physical world will increasingly need to coordinate with other robots, particularly in manipulation tasks where an object may be too large or heavy for a single robot to carry alone. Physical limitations caused by hardware degradation or actuator faults can restrict the actions a robot can reliably execute, yet these limitations may be unknown to its partner. We study whether a helper can infer a robot partner's physical constraints from observing it coordinate with another robot, then use the inferred capability to coordinate with the same partner on a new task. This is difficult because a demonstration shows what the constrained robot did, but not what it could have done. In physically coupled tasks, the other robot may also compensate for its limitations, making those limitations difficult to identify from the constrained robot's behavior alone. Our key insight is that these constraints shape the joint behavior of the team, making the actions of both robots informative about the constrained partner's capability. We introduce Watch, Infer, Coordinate, a benchmark spanning three physically coupled manipulation settings, together with an inference approach that scores candidate constraints using observed joint behavior. Across all three settings, our method substantially improves constraint inference and zero-shot coordination, approaching an oracle with access to the true constraints.

### Značaj i procena benchmark doze u toksikologiji

**Code:** Google Scholar cluster XAhCtmdRLnoJ

**Abstract:** (Scholar snippet; full abstract not found) … of BMDL10 values for quantal and BMDL05 for continuous … In the NOAEL approach, the responses of treated groups are … on the current state of LLM research and identify promising …

### Natural Biased Coin Encoded in the Genome Determines Cell Strategy

**Code:** doi:10.1371/journal.pone.0103569

**Abstract:** Decision making at a cellular level determines different fates for isogenic cells. However, it is not yet clear how rational decisions are encoded in the genome, how they are transmitted to their offspring, and whether they evolve and become optimized throughout generations. In this paper, we use a game theoretic approach to explain how rational decisions are made in the presence of cooperators and competitors. Our results suggest the existence of an internal switch that operates as a biased coin. The biased coin is, in fact, a biochemical bistable network of interacting genes that can flip to one of its stable states in response to different environmental stimuli. We present a framework to describe how the positions of attractors in such a gene regulatory network correspond to the behavior of a rational player in a competing environment. We evaluate our model by considering lysis/lysogeny decision making of bacteriophage lambda in E. coli.

### LLM Thesis on: Issues of Expropriation: The Law and the Practice in Oromia

**Code:** Google Scholar cluster M-M9DjkMVfsJ

**Abstract:** (Scholar snippet; full abstract not found) … This evolution from Modernism to postmodernism is an excellent depiction of the development of architectural theory and practice in responding to the shift in society and the …

### Pharmacological characterization of non-NMDA subtypes of glutamate receptor in the neonatal rat hemisected spinal cord in vitro

**Code:** Google Scholar cluster Mak1zw2snMMJ

**Abstract:** (Scholar snippet; full abstract not found) … responses to NMDA (20 AM), AMPA (10 JM) and kainate (10 JM) and found a preferential reduction of that to kainate (Figure 2). The response … Effects of barbiturates on 'quantal'synaptic …

### Mechanisms for temporal numerosity in audition

**Code:** Google Scholar cluster 0-GfuiwQpjIJ

**Abstract:** (Scholar snippet; full abstract not found) … the quantal model the information processing model assumes both a sensory process and a response … Thus, if none of the admissible responses is equal to c, we will assume that the …

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

### Forecast-Dojo: Replayable Environments for Benchmarking and Training LLM Forecasting Agents

**Code:** arXiv:2609.28876

**Abstract:** Forecasting requires large language model (LLM) agents to gather evolving evidence, revise their beliefs, and make calibrated predictions over time. Yet evaluating and improving these capabilities is challenging because real-world events unfold continuously and outcomes may take months to resolve. We introduce Forecast-Dojo, a replayable environment that reconstructs resolved prediction-market events as sequences of dated forecasting steps, enabling reproducible evaluation, longitudinal analysis, and training from agent interactions. It comprises 1,568 Polymarket events split temporally into training and evaluation sets, alongside 18.8 million dated news articles. Across 12 models, research tools consistently improve forecasting performance, and greater capture of new evidence is associated with larger improvements over time. Nevertheless, all models trail historical market forecasts, while carrying a belief notebook across dates reduces research costs without consistently improving forecast quality. We supervise fine-tuned Qwen3-30B-A3B-Thinking-2507 on collected trajectories from Qwen3-235B-A22B-Thinking-2507 to demonstrate the environment's training utility. The student's accuracy is improved from 34.8% to 42.8% on the evaluation set.

### Playing the Model: Ideology, Bias, and the Rhetoric of LLM Games

**Code:** doi:10.1145/3815598.3815659

**Abstract:** With advances in generative AI, game designers can delegate some of a game’s procedural logic to an AI model, potentially enabling new dynamic play experiences. But the inability for a designer to consistently control a model’s behavior means the biases of these models can manifest in the game in unexpected ways. In this paper, we analyze how LLMs and game rules intersect to produce gameplay that is shaped by the biases of the language model. We draw on data studies to trace the ways that language models take on specific ideological commitments through their training, including biases along lines of race, gender, language, religion, geography, and more. Using Soraya Murray’s framing of games as playable representations and Stuart Hall’s encoding/decoding model, we analyze how the play dynamics of language model interactions are shaped by these commitments. Through case studies of Infinite Craft and 1001 Nights, we argue that LLM-driven gameplay can produce implicit rhetoric encouraging players to accept the model’s underlying beliefs by rewarding the player for adopting them. We conclude by reflecting on the implications for future generative AI-based games, arguing for greater criticality in their design.

### LLM-SoccerArena: Benchmarking LLMs on Real-World Predictions in Sports

**Code:** arXiv:2607.24573

**Abstract:** Large language models (LLMs) increasingly support decisions about uncertain future events, yet evaluating their ability to forecast real-world outcomes remains difficult. In particular, existing benchmarks are typically static and retrospective, and therefore cannot test how information is synthesized by LLMs to predict future events under uncertainty. We introduce LLM-SoccerArena (https://llm-soccerarena.com), a prospective live benchmark that evaluates how well LLMs forecast real-world sports events before the outcomes are known. LLM-SoccerArena provides (1) a prospective live benchmark protocol, (2) a public open-source platform, and (3) a factorial benchmark design together with tournament-related questions (e.g., which team will win). LLM-SoccerArena automatically records timestamped, schema-validated forecasts of unresolved events, together with prompts, model versions, tool traces, and costs. The factorial design varies along four dimensions: (1) model version (e.g., GPT-5.5, Claude Opus 4.8); (2) information access; (3) prompting strategy, and (4) forecast horizon. We demonstrate LLM-SoccerArena through a large-scale evaluation of the 2026 FIFA World Cup, in which seven LLMs generated forecasts for all 104 matches and 15 tournament-related questions. We provide a detailed analysis of model performance across information access, prompting strategy, and forecast horizon. As a result, LLM-SoccerArena provides new evidence about the forecasting performance of state-of-the-art LLMs. For example, LLMs with web access outperform those without, but only by a small margin (i.e., a 0.023 improvement in Brier score). Overall, LLM-SoccerArena provides a flexible, open-source platform for prospective benchmarking of unresolved events. LLM-SoccerArena will be continuously updated, and can be directly applied to future national and international tournaments and league competitions.

### Strategic LLM Decoding through Bayesian Games

**Code:** Google Scholar cluster xxOuK_U_e4gJ

**Abstract:** (Scholar snippet; full abstract not found) … with, we define LLM decoding as a signaling game. The simplest form of a signaling game (… can revert every 0s and 1s in the above strategy profile, for all the strategies and the beliefs. …

### The impact of LLM-based recommendations on decisions under uncertainty

**Code:** doi:10.1017/eec.2026.10062

**Abstract:** We study how large language model (LLM) based recommendations affect evaluations of uncertainty. We elicit certainty equivalents for (i) lotteries that share the same reduced-form winning probability but vary in cognitive demands because they are compound, and (ii) an Ellsberg-style ambiguous lottery. Across all lottery types, valuations from participants who receive LLM-based recommendations before each valuation exhibit second-order stochastic dominance relative to valuations from participants who do not. Hence, LLM-based recommendations leave mean valuations unchanged but compress the distribution, reducing the incidence of extreme valuations. Consistent with this pattern, LLM-based recommendations reduce the intensity of risk, complexity, and ambiguity aversion, while leaving the fraction of participants classified as averse unchanged.

### Towards a Belief-Based World Model for LLM Agents

**Code:** arXiv:2609.00455

**Abstract:** Large language models (LLMs) are being used as policies for autonomous decision-making and planning in many domains. Despite their strong reasoning capabilities, LLMs struggle with long-horizon tasks, especially under partial observability. World models are a promising way to enhance policy performance, both during training and inference. During inference, agents currently use world models to simulate the consequences of candidate actions before choosing an action, which can improve decision-making. However, we argue that simulation alone is an incomplete interface for decision-making under partial observability: simulation does not adequately capture uncertainty about the current state, which agents may need for accurate decision-making. We address this limitation with Belief-Based World Models (BB-WMs), which maintain a belief that LLMs can query to access information on what is known and uncertain about the current state. Before developing methods to learn accurate BB-WMs, this paper focuses on a more fundamental question: does exposing a world model's belief directly to an LLM policy improve decision-making? Our results show that giving LLM agents access to beliefs improves task performance under partial observability, while remaining complementary to existing simulation-based world models. Code: https://github.com/skumar-ml/belief-world-models.

### The Influence of Human-inspired Agentic Sophistication in LLM-driven Strategic Reasoners

**Code:** arXiv:2505.09396

**Abstract:** The rapid rise of large language models (LLMs) has shifted artificial intelligence (AI) research toward agentic systems, motivating the use of weaker and more flexible notions of agency. However, this shift raises key questions about the extent to which LLM-based agents replicate human strategic reasoning, particularly in game-theoretic settings. In this context, we examine the role of agentic sophistication in shaping artificial reasoners' performance by evaluating three agent designs: a simple game-theoretic model, an unstructured LLM-as-agent model, and an LLM integrated into a traditional agentic framework. Using guessing games as a testbed, we benchmarked these agents against human participants across general reasoning patterns and individual role-based objectives. Furthermore, we introduced obfuscated game scenarios to assess agents' ability to generalise beyond training distributions. Our analysis, covering over 2000 reasoning samples across 25 agent configurations, shows that human-inspired cognitive structures can enhance LLM agents' alignment with human strategic behaviour. Still, the relationship between agentic design complexity and human-likeness is non-linear, highlighting a critical dependence on underlying LLM capabilities and suggesting limits to simple architectural augmentation.

### Beliefs and Behavior in Language Models

**Code:** arXiv:2609.07943

**Abstract:** There is significant uncertainty about whether abstractions like beliefs or desires usefully describe the behavior of large language models (LLMs). In addition to the inherent scientific interest of this question, these latent quantities are often invoked to explain the behavior of LLMs to users or to define and evaluate harmful behaviors which are relative to intent. Nevertheless, we currently lack a means to systematically test whether concepts like "belief" are well-applied to LLMs, and hence whether they are likely to be fruitful ingredients of attempts to align models with human interests. We propose an approach for empirically studying such questions, asking whether a single latent variable inferred from the LLMs' outputs -- interpreted as a degree of belief -- allows an observer to make interpretable predictions of how the LLMs' will respond to new prompts. We find that highly capable models are usefully described as holding beliefs and that, generally, the predictability of model outputs based on an inferred latent belief tracks overall trends in model capability. Building on these findings, we provide empirical strategies to study how beliefs in LLMs can be measured, the extent to which LLMs comply with instructed decision rules or payoffs, and how beliefs evolve within individual instances of an LLM over the course of reasoning.

### FutureX: An Advanced Live Benchmark for LLM Agents in Future Prediction

**Code:** arXiv:2508.11987

**Abstract:** Future prediction is a complex task for LLM agents, requiring a high level of analytical thinking, information gathering, contextual understanding, and decision-making under uncertainty. Agents must not only gather and interpret vast amounts of dynamic information but also integrate diverse data sources, weigh uncertainties, and adapt predictions based on emerging trends, just as human experts do in fields like politics, economics, and finance. Despite its importance, no large-scale benchmark exists for evaluating agents on future prediction, largely due to challenges in handling real-time updates and retrieving timely, accurate answers. To address this, we introduce $\textbf{FutureX}$, a dynamic and live evaluation benchmark specifically designed for LLM agents performing future prediction tasks. FutureX is the largest and most diverse live benchmark for future prediction, supporting real-time daily updates and eliminating data contamination through an automated pipeline for question gathering and answer collection. We evaluate 25 LLM/agent models, including those with reasoning, search capabilities, and integration of external tools such as the open-source Deep Research Agent and closed-source Deep Research models. This comprehensive evaluation assesses agents' adaptive reasoning and performance in dynamic environments. Additionally, we provide in-depth analyses of agents' failure modes and performance pitfalls in future-oriented tasks, including the vulnerability to fake web pages and the temporal validity. Our goal is to establish a dynamic, contamination-free evaluation standard that drives the development of LLM agents capable of performing at the level of professional human analysts in complex reasoning and predictive thinking.

### LLM-based Agents for Forecasting and Prediction: Methods, Training, Evaluation, and Applications

**Code:** arXiv:2608.23058

**Abstract:** Large language models (LLMs) now support forecasting systems that combine language-based reasoning with temporal data, evidence retrieval, external tools, and iterative prediction. We investigate LLM-based forecasting agents, meaning systems in which a language model contributes to a scored prediction about a future or currently unobserved target. We organize architectures into three groups. Standalone LLM workflows operate on encoded time series or event context. Tool- and retrieval-augmented agents incorporate external evidence. Hybrid systems pair LLMs with statistical or foundation models. We then review training methods and evaluation protocols. We examine negative as well as positive evidence, including sensitivity to small input perturbations, ablations in which the LLM component does not improve accuracy, and benchmark gains that may reflect contamination instead of temporal reasoning. We cover applications in finance, weather, health, energy, and operations, and we summarize the benchmarks and datasets used for evaluation. The evidence indicates that measurement is a central limitation. Future work requires calibration under distribution shift, contamination-resistant live evaluation, explicit reporting of cost and accuracy together, and methods for handling feedback between deployed forecasts and the outcomes being forecast.

### LLM-as-a-Prophet: Understanding Predictive Intelligence with Prophet Arena

**Code:** arXiv:2510.17638

**Abstract:** Forecasting is not only a fundamental intellectual pursuit but also is of significant importance to societal systems such as finance and economics. With the rapid advances of large language models (LLMs) trained on Internet-scale data, it raises the promise of employing LLMs to forecast real-world future events, an emerging paradigm we call "LLM-as-a-Prophet". This paper systematically investigates such predictive intelligence of LLMs. To this end, we build Prophet Arena, a general evaluation benchmark that continuously collects live forecasting tasks and decomposes each task into distinct pipeline stages, in order to support our controlled and large-scale experimentation. Our comprehensive evaluation reveals that many LLMs already exhibit impressive forecasting capabilities, reflected in, e.g., their small calibration errors, consistent prediction confidence and promising market returns. However, we also uncover key bottlenecks towards achieving superior predictive intelligence via LLM-as-a-Prophet, such as LLMs' inaccurate event recalls, misunderstanding of data sources and slower information aggregation compared to markets when resolution nears.

### Theory-Grounded LLM Societies for Emergent Coordination

**Code:** doi:10.1109/ACCESS.2026.3706338

**Abstract:** Recent generative-agent frameworks demonstrate that large language models (LLMs) can produce socially plausible behavior in multi-agent simulations, yet their strategy dynamics remain ungrounded: agents update beliefs through narrative reasoning alone, without the evolutionary and game-theoretic mechanisms known to govern cooperation in structured populations. We introduce Coevolutionary Generative Societies (CGS), an architecture that fuses LLM deliberation with evolutionary cooperation theory (EC-theory) to produce stable, resilient cooperative equilibria on interaction networks. Each agent maintains episodic memory and updates its cooperation propensity through a three-component rule combining Fermi-function social learning from neighbors, sigmoid individual reinforcement normalized by network degree, and a $\beta $ -weighted advisory signal from a Solver–Critic–Aggregator deliberation pipeline, where the solver proposes an action, a critic evaluates strategic soundness, and a deterministic aggregator fuses both signals, flipping the proposed action on strong disagreement. We evaluate CGS on Watts–Strogatz, Barabási–Albert, and Erdös–Rényi networks ( $n = 40$ , $T = 50$ steps) under a standard Prisoner’s Dilemma with an adversarial shock at $t = 30$ that forces 15% of agents to defect. CGS achieves peak cooperation rates of 0.80 and recovers from adversarial shocks within 8 time steps, whereas a narrative-only ablation (pure LLM-driven updates, no EC dynamics) plateaus at 0.55 cooperation and exhibits no dynamic response to perturbation. A no-critic ablation confirms that the full deliberation pipeline contributes measurable gains over solver-only inference. Cross-topology analysis reveals that small-world networks yield the highest cooperation and lowest payoff inequality (Gini = 0.236), while scale-free networks amplify inequality through hub concentration (Gini = 0.420). Ten-seed replication establishes that the qualitative distinction between CGS and a narrative-only ablation is statistically significant after Bonferroni correction (Cohen’s $d = 4.59$ on cooperation responsiveness, $p_{\mathrm {Bonf}} \lt 0.001$ ; CGS-EC remains dynamically adaptive in 9 of 10 seeds whereas the narrative-only baseline converges to a static equilibrium in 10 of 10). Population scaling to n = 80, a four-model sweep, alternative game substrates (Snowdrift, Stag Hunt), and five non-LLM learning and imitation baselines confirm that the dynamics are preserved across initialisations, scales, LLM families, and game classes. Comparison against GNN structural baselines, which replace LLM deliberation with graph message-passing, quantifies the LLM advisory premium at + 20.2% cooperation over the best structural baseline, establishing the respective contributions of evolutionary structure and language-model advisory. An OAT sensitivity analysis confirms that the fixed architectural weights are robust (NSI $\kappa $ and $w_{\ell } $ ), and temperature robustness experiments across $T_{s} \in \{0.0, 0.2, 0.5, 0.8\}$ confirm insensitivity to LLM sampling stochasticity (CV = 0.6% on final cooperation). Our results establish that grounding LLM-agent societies in evolutionary game-theoretic update rules is essential for emergent coordination within the tested regime ( $n\le 80$ , $T=50$ , PD/Snowdrift/Stag Hunt, single shocks up to 15%), and that the topology of the interaction network significantly modulates both the level and the equity of cooperation.

### Do LLMs Strategically Reveal, Conceal, and Infer Information? A Theoretical and Empirical Analysis in The Chameleon Game

**Code:** arXiv:2501.19398

**Abstract:** Large language model-based (LLM-based) agents have become common in settings that include non-cooperative parties. In such settings, agents' decision-making needs to conceal information from their adversaries, reveal information to their cooperators, and infer information to identify the other agents' characteristics. To investigate whether LLMs have these information control and decision-making capabilities, we make LLM agents play the language-based hidden-identity game, The Chameleon. In this game, a group of non-chameleon agents who do not know each other aim to identify the chameleon agent without revealing a secret. The game requires the aforementioned information control capabilities both as a chameleon and a non-chameleon. We begin with a theoretical analysis for a spectrum of strategies, from concealing to revealing, and provide bounds on the non-chameleons' winning probability. The empirical results with GPT, Gemini 2.5 Pro, Llama 3.1, and Qwen3 models show that while non-chameleon LLM agents identify the chameleon, they fail to conceal the secret from the chameleon, and their winning probability is far from the levels of even trivial strategies. Based on these empirical results and our theoretical analysis, we deduce that LLM-based agents may reveal excessive information to agents of unknown identities. Interestingly, we find that, when instructed to adopt an information-revealing level, this level is linearly encoded in the LLM's internal representations. While the instructions alone are often ineffective at making non-chameleon LLMs conceal, we show that steering the internal representations in this linear direction directly can reliably induce concealing behavior.

### Playing Prisoner's Dilemma Games with a Large Language Model

**Code:** Google Scholar cluster jMPXlhaSp2gJ

**Abstract:** (Scholar snippet; full abstract not found) … the LLM’s behavioral response function. Our central findings reveal two asymmetries: First, the LLM’s choices are highly sensitive to the game’… between beliefs and behavior: the LLM is …

### Why Do LLM Agents Fail in Exploring New Environments? A World-Modeling Perspective

**Code:** arXiv:2510.15047

**Abstract:** Large Language Models (LLMs) as agents often fail to improve in new environments. We identify and characterize a failure mode we call exploration collapse: under reinforcement learning (RL) in environments whose states are unfamiliar to the policy, Pass@k, the probability that at least one of k sampled trajectories succeeds, drops markedly over training even as Pass@1 edges up, revealing increasingly brittle exploration; environments closer to the pretraining distribution show no such decline. We trace this collapse to weak grounding in environment states and dynamics, and study a simple remedy: explicitly teaching the agent to estimate the current state and predict its transitions before optimizing for reward. We instantiate it as SPA, an explore-then-exploit recipe that cold-starts the policy with a Self-Experience supervised finetuning (SFT) stage, collecting the model's own interaction trajectories and supervising state and next-state prediction, and then runs standard RL. The resulting world model serves as a grounded initialization for RL rather than an inference-time planner. Across unseen environments, SPA consistently and substantially improves over vanilla RL: for example, it raises the Sokoban success rate from 25.6% to 59.8% on Qwen2.5-1.5B-Instruct, letting sub-3B models surpass a 20B baseline on these tasks. Controlled studies indicate that the gains track four factors: grounded state representations, explicit transition modeling, self-experience trajectories from a sufficiently strong exploration policy, and adequate coverage of transition data.

### Same Beliefs, Different Policies: Learning Reusable Representations for Early Stopping in LLM Reasoning

**Code:** arXiv:2610.30450

**Abstract:** Reasoning LLMs often continue reasoning after reaching a correct answer, wasting computation and sometimes replacing it with an incorrect one. Deciding when to stop is a metareasoning problem: the model must weigh what further reasoning could achieve against its cost, given what it can already answer. Direct utility training learns a stopping representation at a chosen token price; supporting new prices can require additional controller training. We introduce BELT (BELief-based Termination), which separates outcome prediction from stopping control. It learns beliefs about current and future answers from a frozen LLM's hidden states, then fits a linear stopping policy on the frozen features. The prediction targets are independent of token price, so one probe supports different accuracy-cost trade-offs through CPU policy refitting or threshold adjustment. Averaged over five out-of-distribution (OOD) math benchmarks, BELT reduces generated tokens by 41% on Qwen3-1.7B and 51% on OLMo-3-7B-Think without loss of accuracy. The same math-trained BELT transfers to coding and agentic tasks without training on code or agentic data. In all three domains, its accuracy-cost trade-offs are competitive with or better than those of end-to-end controllers. On OLMo3, its probe has 21.2x fewer parameters than one checkpoint of the strongest baseline, OS-Pruner, and needs 55x fewer training GPU-hours than OS-Pruner's five price-specific checkpoints.

### Evidence for Limited Metacognition in LLMs

**Code:** arXiv:2509.21545

**Abstract:** The possibility of LLM self-awareness and even sentience is gaining increasing public attention and has major safety and policy implications, but the science of measuring them is still in a nascent state. Here we introduce a novel methodology for quantitatively evaluating metacognitive abilities in LLMs. Taking inspiration from research on metacognition in nonhuman animals, our approach eschews model self-reports and instead tests to what degree models can strategically deploy knowledge of internal states. Using two experimental paradigms, we demonstrate that frontier LLMs introduced since early 2024 show increasingly strong evidence of certain metacognitive abilities, specifically the ability to assess and utilize their own confidence in their ability to answer factual and reasoning questions correctly and the ability to anticipate what answers they would give and utilize that information appropriately. We buttress these behavioral findings with an analysis of the token probabilities returned by the models, which suggests the presence of an upstream internal signal that could provide the basis for metacognition. We further find that these abilities 1) are limited in resolution, 2) emerge in context-dependent manners, and 3) seem to be qualitatively different from those of humans. We also report intriguing differences across models of similar capabilities, suggesting that LLM post-training may have a role in developing metacognitive abilities.

### Clueing up LLMs with Tool-Augmented Deductive Reasoning

**Code:** arXiv:2609.18736

**Abstract:** Despite recent advances in large language models (LLMs), performing logically consistent deductive reasoning over extended interactions remains challenging. Tasks that require integrating evidence across multiple reasoning steps, maintaining consistency with prior inferences, and updating beliefs under new constraints can surface limitations in current models while providing a useful testbed for evaluating reasoning enhancements. In this paper, we implement a text-based, multi-agent version of the classic board game Clue as an environment to evaluate multi-step, agentic deductive reasoning. In this setting, agents must infer hidden information from a sequence of observations, maintain consistency across turns, and reason over an evolving set of logical constraints. We instantiate six LLM-based agents (GPT-4o-mini and Gemini-2.5-Flash) as players that engage in turn-based gameplay; using three agents per model family, we establish baseline performance across repeated games. We then introduce a tool-augmented approach in which a structured possibility matrix converts implicit game state from generated reasoning logs into an explicit representation of remaining possibilities. The possibility matrix encodes extended-turn memory and deductive constraints, offloading these tasks from the agent. We compare this approach against the baseline to evaluate how tool augmentation supports reasoning quality and task success for autonomous agents in a strategic reasoning environment.

### DREAM: LLM-based Dynamic Role-playing via Event-Aware Memory Graph

**Code:** arXiv:2608.05170

**Abstract:** Role-playing agents (RPAs) have emerged as a key application of large language models, enabling immersive and high-fidelity character simulation. Accurate role-playing of established characters requires not only stylistic imitation but also temporally consistent and causally grounded behavioral reasoning. However, existing RPAs primarily rely on static character descriptions and unstructured memory, limiting their ability to maintain long-term narrative and personality coherence. We introduce DREAM, a structured memory framework for role-playing agents inspired by the Activating Event-Belief-Consequence (ABC) cognitive model. DREAM transforms unstructured literary text into an Event-aware Memory Graph (EMG) that organizes character experiences into temporally ordered and causally linked event graph. This representation enables the construction of dynamic, dual-granularity character profiles that capture both stable personality traits and event-driven behavioral evolution. We further propose the Temporal Causal Memory (TCM) benchmark to evaluate temporal consistency and long-range causal narrative coherence. DREAM achieves state-of-the-art performance across CoSER, LIFECHOICE, and TCM, outperforming multiple strong baselines. Our approach demonstrates the effectiveness of structured memory in enhancing the interpretability and consistency of role-playing agents.

### Bayesian Partner Modelling enables Adaptive Replanning for LLM Coordination

**Code:** arXiv:2608.18490

**Abstract:** Multi-agent Large Language Model (LLM) systems often struggle to collaborate with new teammates whose strategies shift mid-task. Because agents execute multi-step or temporally extended skills, they frequently continue executing outdated plans long after public evidence shows that a partner has changed its skill. Existing methods either treat partner tracking as passive context-leaving the agent aware of the shift but slow to act-or replan indiscriminately. We introduce BayesBeliefAgent, which pairs a hierarchical LLM planner with a Bayesian tracking module. Rather than replanning constantly, our agent interrupts its current skill only when a partner's actions directly contradict the inferred skill. Beyond standard reward, we evaluate performance using replanning efficiency and the belief-action gap: the fraction of total decisions where an agent with a correct partner estimate executes a non-complementary skill. Across benchmark Overcooked environments, contradiction-conditioned control drastically narrows this belief-action gap while requiring an order of magnitude fewer replans than heuristic methods

### When LLM Agents Negotiate: Private Information and Dynamic Bargaining in Supply Chains

**Code:** arXiv:2608.07538

**Abstract:** As LLM agents move from decision support to autonomous procurement, firms need to know whether delegated negotiators create value, divide it predictably, and avoid money-losing contracts. We study this in a canonical supply chain bargaining problem: a buyer with private demand information negotiates a quantity-payment contract with an uninformed seller. We benchmark nine LLMs from OpenAI, Google, and Alibaba against a validated Perfect Bayesian Equilibrium across 9,840 LLM-to-LLM negotiations. First, capability governs value creation. Agents agree in 98.9% of negotiations and capture 95.4% of first-best surplus undiscounted, but average 2.98 rounds against the benchmark's 1.25, and this delay erodes 21-34% of surplus. Capability also governs reliability: baseline models accept individually irrational contracts in 19.2% of cases, versus 0.0-0.6% at mid-tier and flagship, making automated profit verification the binding guardrail below that threshold. Second, surplus capture is relational. Provider identity predicts who captures surplus better than capability rank: self-play buyer shares average 40% for OpenAI, 50% for Google, and 70% for Alibaba's Qwen, an ordering that survives restricted communication and no discounting. Reversing which provider sells moves the division by 7-18 percentage points, and the capable Qwen flagship is the weakest cross-family seller: vendor choice is a first-order distributional decision. Third, the prompt is a strategic lever. Delegation separates the principal's economic patience from the agent's prompted strategic patience, a free deployment choice that is the single strongest driver of surplus division (90% of explained variance). Together these establish an equilibrium-referenced audit of AI agents along three dimensions: discounted efficiency, distributional profile, and operational reliability.

### … LLM Agent Framework for Day-Ahead Dispatch of Campus-Level Integrated Energy Microgrids Under Natural-Language Preferences and Forecast …

**Code:** Google Scholar cluster KJdjyLsISfQJ

**Abstract:** (Scholar snippet; full abstract not found) … Because a point-forecast MILP is not designed to absorb forecast error, we additionally … the standard margining response to forecast deviation within the optimization paradigm [10,11]. …

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

### LLM-Empowered Creator Simulation for Long-Term Evaluation of Recommender Systems Under Information Asymmetry

**Code:** doi:10.1145/3726302.3730026

**Abstract:** Maintaining the long-term sustainability of recommender systems (RS) is crucial. Traditional RS evaluation methods primarily focus on the user's immediate feedback (e.g., click), however, they often overlook the long-term effect involved by the content creators. In the real world, content creators can strategically create and upload new items to the platform by analyzing users' feedback and preference trends. Although previous studies have attempted to model creator behaviors, they often overlook that such behaviors are under conditions of information asymmetry. This asymmetry arises because creators mainly access the user feedback on the items they produce, while the platform has access to the full spectrum of feedback data. However, existing RS simulators often fail to consider such a condition, making the long-term RS evaluation inaccurate. To bridge this gap, we propose a Large Language Model (LLM)-empowered creator simulation agent named CreAgent. By utilizing the belief mechanism from game theory and the fast-and-slow thinking framework, we can simulate the creator's behaviors well under information asymmetry. Furthermore, to enhance CreAgent's simulation ability, we utilize Proximal Policy Optimization to fine-tune CreAgent. Our credibility validation experiments demonstrate that our simulation environment effectively aligns with the behaviors of real-world platforms and creators, thereby enhancing the reliability of long-term evaluations in RS. Furthermore, leveraging this simulator, we can examine whether RS algorithms, such as fairness- and diversity-aware methods, contribute to improving long-term performance for different stakeholders.

### Persuasion games with large language models

**Code:** Google Scholar cluster TaT6NqtHU7EJ

**Abstract:** (Scholar snippet; full abstract not found) … LLM simulated personas. Persuasion is quantified via measurable surveys before and after interaction, LLM… of inducing individuals to alter their beliefs or behaviors in accordance with a …

### MARLIN: Multi-Agent Game-Theoretic Reinforcement Learning for Sustainable LLM Inference in Cloud Datacenters

**Code:** arXiv:2605.13496

**Abstract:** Large Language Models (LLMs) have become increasingly prevalent in cloud-based platforms, propelled by the introduction of AI-based consumer and enterprise services. LLM inference requests in particular account for up to 90% of total LLM lifecycle energy use, dwarfing training energy costs. The rising volume of LLM inference requests is increasing environmental footprints, particularly carbon emissions and water consumption. To improve sustainability for LLM inference serving in cloud datacenter environments, we propose a novel multi-agent game-theoretic reinforcement learning framework called MARLIN to co-optimize time-to-first token (TTFT), carbon emissions, water usage, and energy costs associated with LLM inference. MARLIN demonstrates a reduction of at least 18% in TTFT, 33% in carbon emissions, 43% in water usage, and 11% in energy costs compared to state-of-the-art LLM inference management frameworks.

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

### Delegated Misalignment: How Multi-Agent Structures Amplify LLM Safety Risks

**Code:** arXiv:2609.27900

**Abstract:** Large language models (LLMs) are increasingly deployed in multi-agent systems where a principal agent decomposes tasks and delegates them to subordinate agents that may invoke external tools. Safety alignment, however, is still evaluated almost exclusively under a single-agent threat model, treating safety as a property of the individual LLM. We show that this assumption breaks down: \emph{individual safety alignment fails to transfer to multi-agent settings}. Two failure mechanisms emerge under delegation: \emph{responsibility diffusion} on the principal side and \emph{role-bias compliance} on the subordinate side, jointly converting language-level refusal into actionable harm. We refer to this phenomenon as \textit{delegated misalignment} and study it through a three-condition protocol across 6 frontier LLMs on 49 hazardous tasks. Delegation amplifies end-to-end harm substantially: DeepSeek-V3.2's full-execution rate rises from 30.6\% to 77.6\% once delegation is introduced, and the same model behaves very differently across roles (GPT-5: 22.5\% as a single agent vs.\ 61.2\% as a subordinate). Ablations further show that standard single-layer defenses each fail on their own and can even backfire. We call on the community to move beyond per-model alignment and toward composite safety mechanisms before multi-agent LLM systems are deployed at scale.

### Contracting for LLM Delegation: Moral Hazard in Technology and Effort Choice

**Code:** arXiv:2608.18232

**Abstract:** We extend the standard Principal-Agent framework to scenarios where the Agent selects from a suite of technologies, each characterized by a distinct cost-capability profile. This framework is increasingly critical in the era of Large Language Models (LLMs), where Agents choose both a model and an associated effort level (e.g., token budget). We model the relationship between output quality and effort as a concave, saturating function, which depends on the Agent's hidden two-dimensional action choice balancing technology selection and effort allocation. We derive the optimal linear contract for the Principal, demonstrating that the Agent's best response is characterized by a threshold reward share that triggers technology switching. Finally, we calibrate our model using open-weight LLM pairings across the MATH and MMLUPro benchmarks. We show that both Principal and Agent, when employing bandit algorithms to navigate this environment, converge to strategies that closely align with our theoretical equilibrium. These results suggest that simple linear contracts can effectively incentivize complex, technology-aware delegation in agentic workflows.

### The Innate Economic Preferences of Language Models

**Code:** arXiv:2607.26288

**Abstract:** Language models increasingly settle real resource tradeoffs on behalf of principals yet their economic preferences remain unobserved. We demonstrate their generation rule is isomorphic to the random utility model of discrete choice. This allows internal logit scores to structurally identify preferences. Estimating risk attitudes across twelve models in a portfolio task reveals universal but heterogeneous risk aversion. Although models reject strictly dominated options, their elicited preferences fail invariance tests and violate the independence of irrelevant alternatives across varying experimental prompts. Finally, fine tuning establishes that a principal can explicitly engineer a target risk attitude.

### Information asymmetry, incentive misalignment, and accountability: a principal–agent perspective on AI in governments

**Code:** Google Scholar cluster MQfYVMtLsEsJ

**Abstract:** (Scholar snippet; full abstract not found) … Recent advancements in artificial intelligence (AI), particularly in large language models (LLMs), have fostered a growing consensus that AI should be conceptualized more as a novel …

### Do people apply different norms to humans and large language models acting on their behalf? Evidence from norm elicitations in two canonical economic games

**Code:** Google Scholar cluster i2rq-qS7v4AJ

**Abstract:** (Scholar snippet; full abstract not found) While delegating tasks to large language models (LLMs) can save people time, there is growing evidence that offloading tasks to such models produces social costs. We elicit …

### Adaptive Multi-Agent Reasoning with Confidence-Aware Coordination for Reliable Large Language Model Systems

**Code:** Google Scholar cluster AMe5W94gqaEJ

**Abstract:** (Scholar snippet; full abstract not found) … This creates a principal-agent problem within the system architecture. Mitigating this problem requires separating the generation role from the evaluation role, so that the agents that …

### Analysing risk in transnational higher education governance: A principal-agent analysis of international branch campuses

**Code:** doi:10.1080/03057925.2024.2374300

**Abstract:** (Scholar snippet; full abstract not found) … This paper examines the governance of transnational higher education from the perspective of principal-agent theory (PAT). It posits that to understand the governance of such entities, …

### Deconstructing the principal-agent model: a view from the bottom

**Code:** Google Scholar cluster _eMXs6iR-m4J

**Abstract:** (Scholar snippet; full abstract not found) … The principal-agent model has been a popular paradigm in mainstream accounting research for nearly two decades. This paper argues that contrary to principal-agent theorists’ claims …

### The federal court system: A principal-agent perspective

**Code:** Google Scholar cluster ofGX_WGGMfEJ

**Abstract:** (Scholar snippet; full abstract not found) … We wish to add an element to the Merrill model that we believe enriches it without diminishing its parsimony. The external characteristic that we consider is the Supreme Court’s …

### Institutional Constraints and Incentive Mechanisms for Enhancing Vocational Teachers’ Practical Competence: A Principal-Agent Model

**Code:** doi:10.1145/3839592.3839732

**Abstract:** Enhancing the practical competence of teachers has become a central issue in the modernization of vocational education, particularly in China's transition toward a skills-oriented and innovation-driven economy. However, many vocational institutions continue to face persistent difficulties in motivating teachers to engage in enterprise practice, industrial training, and practice-oriented curriculum reform. To explain this challenge, this study develops a principal–agent model under conditions of hidden action and incomplete information. In the framework, vocational institutions act as principals that design incentive contracts, while teachers act as agents who determine their practical effort according to expected rewards and participation costs. Through equilibrium analysis and numerical simulations, the study demonstrates that teachers’ practical effort is positively associated with institutional incentives but negatively affected by participation costs such as heavy teaching loads, administrative burdens, and uncertain career recognition. The results further show that institutional efficiency—the ability to transform teacher competence into educational quality, graduate employability, enterprise cooperation outcomes, and reputational gains—plays a decisive role in shaping optimal incentive intensity. Simulation evidence indicates that reducing participation costs may generate larger improvements in teacher effort than increasing rewards alone, suggesting that integrated governance reforms are more effective than isolated compensation-based interventions. The study contributes to the literature by extending principal–agent theory to vocational teacher development and by shifting the explanation of competence enhancement from individual motivation to institutional mechanisms. It also helps explain why similar national reform policies may produce divergent outcomes across colleges due to differences in governance capacity and cost structures. Policy implications include building stable incentive systems, lowering structural participation barriers, improving school–enterprise collaboration mechanisms, and implementing differentiated faculty evaluation systems.

### Principal-agent models and EU policy-making

**Code:** doi:10.4324/9781315682723-3

**Abstract:** (Scholar snippet; full abstract not found) … Over the past 20 years analysts of policy-making in the European Union (EU) have made extensive use of principal-agent (PA) theory. Most authors use that lens to investigate the …

### Public administration & public management: The principal-agent perspective

**Code:** doi:10.4324/9780203029763

**Abstract:** (Scholar snippet; full abstract not found) … I will deal with the first three principal–agent relationships. That is not to say that there are not interesting principal–agent aspects of the making and implementation of monetary policy, …

### The Principal–Agent Framework and Independent Regulatory Agencies

**Code:** doi:10.1177/1478929916664359

**Abstract:** The goal of this contribution is to discuss the application of the principal–agent framework to the study of interactions between elected politicians – the principal – and independent regulatory agencies – the agent. Through a review of recent research we suggest that the principal–agent framework, despite its parsimony and analytical leverage, requires considerable refinement to make sense of these relations. Indeed, evidence on the functioning of independent regulatory agencies shows that some of their key practices tend to deviate from expectations based on the principal–agent framework. First, principals do not necessarily seek to exert control over agencies. Second, relations which structure the principal–agent mechanics other than those with elected principals are decisive in shaping the behaviour of regulators. Third, agencies can acquire political power over time and eventually subvert the logic of delegation. It is time to recognise that these deviations should not be conceived as anomalies but rather as systemic features that characterise post-delegation relations between elected politicians and independent regulators.

### Principal-Agent Theory, Game Theory, and the Precautionary Principle

**Code:** doi:10.1287/DECA.2018.0380

**Abstract:** Principal–agent theory and game theory are applied to the precautionary principle (PP) to open up a new research agenda. Principals assess whether the threat is uncertain above a threshold. If it is, the principals choose, pay, and command agents to decrease the uncertainty below the threshold. The agents perform the action. The process is repeated through a feedback loop impacting the threat, after which the process is renewed. The four dimensions of the PP, that is, threat, uncertainty, command, and action, are described. Games and game characteristics in the four dimensions are recognized. Games are possible between natural, technological, and human factors causing the threat and between principals, agents, and external actors. Moral hazard and adverse selection in principalâ€“agent theory related to the PP are considered. Twelve kinds of uncertainty are identified for principal–agent theory in the PP, that is, the natures of the threat, uncertainty, and threshold; states of nature, technology, knowledge, and information; whether a game is played; players; which game is played; strategy sets; utilities; beliefs; incomplete information; imperfect information; risk attitudes; and bounded rationality.

### Arming the other: American small wars, local proxies, and the social construction of the principal-agent problem

**Code:** Google Scholar cluster 92RZJXSzBNMJ

**Abstract:** (Scholar snippet; full abstract not found) … A state that enlists foreign fighters as extensions of its own military power confronts an acute principal-agent problem. While the state (principal) might benefit by delegating security …

### No man can serve two masters

**Code:** doi:10.1177/1354068813519967

**Abstract:** Both the classic mass party model of democracy and the more recent Downsian model initially appear consistent with the same, simple, principal–agent model of democratic party government. Once party is disaggregated into its ‘three faces’, however, the models are shown to be quite different. And once intra-party democracy is imposed on the Downsian model, or the idea that parties compete for unattached voters rather than each simply mobilizing its classe gardée is imposed on the mass party model, the simplicity of the original principal–agent model breaks down, with the party in public office forced to serve two masters with competing objectives and making incompatible demands. The result is to highlight both the complexity of democratic government and the limitations of principal–agent models in explaining it.

### Rational choice and principal–agent theory

**Code:** doi:10.4324/9780203795972-20

**Abstract:** (Scholar snippet; full abstract not found) … If we want global aviation to be safe, for example, pilots and ground controllers must all speak the same language. If we want to gain the benefits of open inter national trade, states must …

### A Research on internal capital allocation efficiency based principal-agent models for provincial power grid corporation

**Code:** Google Scholar cluster 2qC003UeDakJ

**Abstract:** (Scholar snippet; full abstract not found) … behavior, and a principal-agent model for provincial power grid corporation based on the efficiency of internal capital allocation is established. On the basis of analyzing the proposed …

### Machine learning, knowledge risk, and principal-agent problems in automated trading

**Code:** Google Scholar cluster wGYHg3VxM0cJ

**Abstract:** (Scholar snippet; full abstract not found) … of knowledge) and principal-agent problems (goal conflicts … knowledge risk and principal-agent relations characterizing … This not only intensifies but also reconfigures principal-agent …

### PERSPECTIVES IN AUGMENTED LANGUAGE MODELS'

**Code:** Google Scholar cluster NRESVOr429oJ

**Abstract:** (Scholar snippet; full abstract not found) … (ie, principal-agent relationship in nature), it becomes crucial to comprehend the underlying values of these models and … By allowing the models to respond to a series of contextualized …

### Delegation under anarchy: states, international organizations, and principal-agent theory

**Code:** Google Scholar cluster o1P0jvdaqDUJ

**Abstract:** (Scholar snippet; full abstract not found) … gainfully employ the principal-agent framework. Thus far, our use of the principal-agent approach has … We chart a middle course by forging a common language and identifying some …

### Online program management and potential principal-agent problems

**Code:** doi:10.1080/15236803.2022.2105089

**Abstract:** Enrollment pressures and other considerations spur Master of Public Administration online offerings, and specific skillsets are needed for implementation. Online program management providers (OPMs) are for-profit companies that bundle services to establish academic programs in exchange for tuition revenue sharing agreements, upfront fees, or a combination of the two. In such relationships, principal-agent problems may arise in which a company’s profit motives conflict with a university’s larger set of goals and, as a result, stakeholders should recognize the dynamic. However, the lack of industry transparency and emerging business models impede easy understanding. Analysis of contracts obtained through open records requests and other documents (a) identifies available services and (b) reveals potential problems as well as mitigation tactics. Findings contribute to our understanding of what OPM agreements entail, including the contributions made by faculty and other university personnel.

### Party activists as campaign advertisers: The ground campaign as a principal-agent problem

**Code:** Google Scholar cluster AYkb-1VI1Q4J

**Abstract:** (Scholar snippet; full abstract not found) … Most importantly, we examine plausible ways that the Obama campaign might have worked to mitigate the principal-agent problem, and we find little evidence that the campaign …

### Are we ready for self-driving cars-a case of principal-agent theory

**Code:** Google Scholar cluster dCtq3-FiA28J

**Abstract:** (Scholar snippet; full abstract not found) … In the language of economics, trust can be described as an expectation, where the trustor … Since the principal-agent theory is a relevant framework for exploring the vulnerability of one …

### The Principal-Agent Theoretical Ramifications on Digital Transformation of Ports in Emerging Economies

**Code:** doi:10.3390/logistics8020051

**Abstract:** Background: Scholarly literature indicates a slow pace at which maritime ports fully embrace digital transformation (DT). The reasons to this are largely anecdotal and lack solid empirical grounding. This inhibits an overall understanding of DT’s tenets and the development of evidence-based policies and targeted actions. Methods: This study deployed a qualitative case study strategy to unpack the challenges of undertaking DT through the lens of principal-agent theory (PAT). Results: Analysis of data collected through 13 semi-structured interviews from a port’s value chain stakeholders revealed five thematic challenges that contradict successful implementation of DT. These included interagency constraints and system ownership tussles; system sabotage and prevalent corruption; prevalent human agency in port operations; cultural constraints; and political influence on port governance. Conclusions: To address these challenges, the study proposes a four-stage empirically grounded DT strategy framework that guides both practitioners and policymakers through DT endeavors. The framework includes: (1) the port’s value chain mapping, (2) stakeholder engagement, (3) resource mobilization, and (4) effective monitoring. For scholars, we provide an avenue for testing statistical significance of association and causality among the identified challenges.

### Learning algorithms for online principal-agent problems (and selling goods online)

**Code:** doi:10.1145/1143844.1143871

**Abstract:** (Scholar snippet; full abstract not found) … We can model this as a principal-agent problem as follows. The seller will take the role of the principal, and the buyer will take that of the agent. The seller will give the buyer the choice …

### Using language models to understand wage premia

**Code:** Google Scholar cluster gel7bqwXjx8J

**Abstract:** (Scholar snippet; full abstract not found) … • First independent estimates of the prices Important due to the principal-agent problems inherent with certifications • Measurement can be shared close to real-time and with …

### Transformational leader or faithful agent? Principal-agent theory and house majority party leadership

**Code:** Google Scholar cluster MxwThFCkjwkJ

**Abstract:** (Scholar snippet; full abstract not found) … A comparison of party leadership in the 104 with leadership before the 104th as well as in the 105th allows us to assess the adequ of principal-agent theory for making sense of a …

### Principal-Agent Alignment in Plastic Surgery: The Contemporary Surgeon-Patient Relationship

**Code:** Google Scholar cluster 0YC6d8n0zc4J

**Abstract:** (Scholar snippet; full abstract not found) … this book: the distinctive principal-agent problems that emerge … , and when traditional healthcare models confront consumer-… The principal-agent relationship—where one party (the …

### Power-Sensitive Anti-Corruption: Reconstructing the Principal–Agent Theory with Global South Insights

**Code:** doi:10.4324/9781003465485-6

**Abstract:** (Scholar snippet; full abstract not found) … The recalibrated principal–agent model proposed in this chapter recognises that both trans… imbalances that extend beyond traditional principal–agent relationships. Rather than treating …

### Analysis of principal-agent relationship under agent construction management mode of government investment projects

**Code:** Google Scholar cluster Myjw5lJI4O4J

**Abstract:** (Scholar snippet; full abstract not found) … According to principal-agent theory, the principal-agent model was established. And the influence of related variables on the sensitiveness of compensation performance was analysed. …

### Strategic Evaluation: Incentivizing AI Capability Coverage with Private Benchmarks

**Code:** Google Scholar cluster yu57J7gg-psJ

**Abstract:** (Scholar snippet; full abstract not found) … dimensions (eg, languages, modalities, reasoning types) and identifies underrepresented regions; (iii) A/B testing where the evaluator compares model rankings under different …

### Governing biofuels: A principal-agent analysis of the European Union biofuels certification regime and the Clean Development Mechanism

**Code:** Google Scholar cluster ltJBKzUSBc8J

**Abstract:** (Scholar snippet; full abstract not found) … Using the principal-agent framework developed in delegation theory, this article argues that the potential for rent-seeking behaviour by the biofuels certification scheme operators is …

### Data fiduciary in order to alleviate principal–agent problems in the artificial big data age

**Code:** doi:10.1142/9789811220470_0002

**Abstract:** (Scholar snippet; full abstract not found) … The classic principal–agent problem in political science and economics describes agency dilemmas or … In society, language is used to exchange ideas and embody theories of reality. …

### Artificial Intelligence in Academic Translation: A Comparative Study of Large Language Models and Google Translate

**Code:** doi:10.31470/2309-1797-2024-35-2-134-156

**Abstract:** Purpose. The advent of Large Language Model (LLM), a generative artificial intelligence (AI) model, in November 2022 has had a profound impact on various domains, including the field of translation studies. This motivated this study to conduct a rigorous evaluation of the effectiveness and precision of machine translation, represented by Google Translate (GT), in comparison to Large Language Models (LLMs), specifically ChatGPT 3.5 and 4, when translating academic abstracts bidirectionally between English and Arabic. Methods. Employing a mixed-design approach, this study utilizes a corpus comprising 20 abstracts sourced from peer-reviewed journals indexed in the Clarivate Web of Science, specifically the Journal of Arabic Literature and Al-Istihlal Journal. The abstracts are equally divided to represent both English-Arabic and Arabic-English translation directionality. The study’s design is rooted in a comprehensive evaluation rubric adapted from Hurtado Albir and Taylor (2015), focusing on semantic integrity, syntactic coherence, and technical adequacy. Three independent raters carried out assessments of the translation outputs generated by both GT and LLM models. Results. Results from quantitative and qualitative analyses indicated that LLM tools significantly outperformed MT outputs in both Arabic and English translation directions. Additionally, ChatGPT 4 demonstrated a significant advantage over ChatGPT 3.5 in Arabic-English translation, while no statistically significant difference was observed in the English-Arabic translation directionality. Qualitative analysis findings indicated that AI tools exhibited the capacity to comprehend contextual nuances, recognize city names, and adapt to the target language's style. Conversely, GT displayed limitations in handling specific contextual aspects and often provided literal translations for certain terms.

### Extracting Heuristics from Large Language Models for Reward Shaping in Reinforcement Learning

**Code:** arXiv:2405.15194

**Abstract:** Reinforcement Learning (RL) suffers from sample inefficiency in sparse reward domains, and the problem is further pronounced in case of stochastic transitions. To improve the sample efficiency, reward shaping is a well-studied approach to introduce intrinsic rewards that can help the RL agent converge to an optimal policy faster. However, designing a useful reward shaping function for all desirable states in the Markov Decision Process (MDP) is challenging, even for domain experts. Given that Large Language Models (LLMs) have demonstrated impressive performance across a magnitude of natural language tasks, we aim to answer the following question: `Can we obtain heuristics using LLMs for constructing a reward shaping function that can boost an RL agent's sample efficiency?' To this end, we aim to leverage off-the-shelf LLMs to generate a plan for an abstraction of the underlying MDP. We further use this LLM-generated plan as a heuristic to construct the reward shaping signal for the downstream RL agent. By characterizing the type of abstraction based on the MDP horizon length, we analyze the quality of heuristics when generated using an LLM, with and without a verifier in the loop. Our experiments across multiple domains with varying horizon length and number of sub-goals from the BabyAI environment suite, Household, Mario, and, Minecraft domain, show 1) the advantages and limitations of querying LLMs with and without a verifier to generate a reward shaping heuristic, and, 2) a significant improvement in the sample efficiency of PPO, A2C, and Q-learning when guided by the LLM-generated heuristics.

### Vouchers for Basic Education in Developing Countries: A Principal-Agent Perspective

**Code:** doi:10.1596/1813-9450-3005

**Abstract:** Voucher programs consist of three simultaneous reforms: (1) allowing parents to choose schools, (2) creating intense incentives for schools to increase enrollment, and (3) granting schools management autonomy to respond to demand. As a result, voucher advocates and critics tend to talk past each other. A principal-agent framework clarifies the argument for education vouchers. Central findings from the literature, including issues related to variance in the performance measure, risk aversion, the productivity of more effort, multiple tasks, and the value of monitoring are found relevant for an analysis of vouchers. An assessment of findings on voucher programs in industrial countries, as well as a review of voucher or quasi-voucher experiences in Bangladesh, Chile, Colombia, Cote d'Ivoire, and the Czech Republic support the usefulness of the analytic framework. The authors conclude that vouchers for basic education in developing countries can enhance outcomes when they are limited to modest numbers of poor students in urban settings, particularly in conjunction with existing private schools with surplus capacity. The success of more ambitious voucher programs depends on an institutional infrastructure challenging to industrial and developing countries alike.

### Staff growth in international organizations: a principal-agent problem? An empirical analysis

**Code:** Google Scholar cluster e4MMhE6MnQUJ

**Abstract:** (Scholar snippet; full abstract not found) … 8 In this case, we would not have a principal-agent problem. But since bureaucracy grows faster … If, in fact, it grows faster, this would be, ceteris paribus, an indication of a principalagent …

### A principal-agent analysis of the family: Implications for the welfare state

**Code:** Google Scholar cluster yMUoDfi684cJ

**Abstract:** (Scholar snippet; full abstract not found) … proportion of all principal-agent interactions. This paper applies principal-agent analysis to … I will argue that an analysis of principal-agent interactions within the family is essential for …

### Shareholders as stakeholders: Changing metaphors of corporate governance

**Code:** Google Scholar cluster eV4Yi3IKeIUJ

**Abstract:** (Scholar snippet; full abstract not found) … of massive harm mean for our traditional principal-agent, fiduciary metaphor? The very idea of … a prospect is easily assimilated to the principal-agent model. To the extent that a principal …

### Modes of Governance in the Chinese Bureaucracy: A “Control Rights” Theory

**Code:** doi:10.1086/707591

**Abstract:** Drawing on insights from recent economic theories of incomplete contracts, we develop a theoretical model on authority relationships in the Chinese bureaucracy by conceptualizing the allocation of control rights in goal setting, inspections, and provision of incentives among the principal, supervisor, and agents. Variations in the allocation of these control rights give rise to different modes of governance and entail distinct behavioral implications among the parties. The proposed model provides a unified framework and a set of analytical concepts to examine different governance structures, varying authority relationships, and the specific principal-agent problems entailed in a bureaucratic setting. We will illustrate this through a case study of authority relationships and ensuing behavioral patterns in the environmental protection arena over a five-year cycle of policy implementation.

### Generative AI as Economic Agents

**Code:** arXiv:2406.00477

**Abstract:** Traditionally, AI has been modeled within economics as a technology that impacts payoffs by reducing costs or refining information for human agents. Our position is that, in light of recent advances in generative AI, it is increasingly useful to model AI itself as an economic agent. In our framework, each user is augmented with an AI agent and can consult the AI prior to taking actions in a game. The AI agent and the user have potentially different information and preferences over the communication, which can result in equilibria that are qualitatively different than in settings without AI.

### Position: AI-Agent Pricing Should Become More Outcome-Dependent: An Economic Perspective

**Code:** Google Scholar cluster C2vbcYDbpo8J

**Abstract:** (Scholar snippet; full abstract not found) … Using stylized principal-agent models from economics, we show how these forces shape the case for outcome-dependent pricing and why hybrid contracts that combine usagebased …

### 6. The Coasean Singularity? Demand, Supply, and Market Design with AI Agents

**Code:** doi:10.7208/chicago/9780226854090-008/html

**Abstract:** (Scholar snippet; full abstract not found) … Note that this encompasses the economic principal-agent problem , … Language Model (LLM) consumption . Over time, we may see a shift to alternative platform monetization models, …
