# Quoridor AI based on Monte Carlo Tree Search

[Quoridor](https://en.wikipedia.org/wiki/Quoridor) is an abstract strategy game played on a board of 81 (9x9) square spaces where the objective is to get your pawn to the opposite side of the board.

This AI agent that plays Quoridor is based on [Monte Carlo tree search](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search). Pure Monte Carlo tree search resulted in a poor performance. The performance was significantly improved after applying some heuristics. I added heuristics to the selection, expansion and simulation phase of the tree search (and also to post processes after search). You can see the heuristics on the comments of the source code. (Find the word "heuristic".)

You can play against this AI on the website https://gorisanson.github.io/quoridor-ai/.
The number of rollouts per move for each AI level on the website are following. 

| Level   | Rollouts per Move |
| -----   | ---- |
| Novice  | 2,500 |
| Average | 7,500 |
| Good    | 20,000 |
| Strong  | 60,000 |


## Previous works

There are some previous works done by others.
(For available previous agents, I matched my agent against them to compare. You can see the results on the "Result" section below.)

- Victor Massagué Respall, Joseph Alexander Brown and Hamma Aslam. *[Monte Carlo Tree Search for Quoridor](https://www.researchgate.net/publication/327679826_Monte_Carlo_Tree_Search_for_Quoridor)*. 2018. - This paper led me to apply Monte Carlo tree search on my agent. Although I couldn't find the source code or the AI agent on this paper, just to know the viability in advance was very encouraging to me.

- [Daniel Borowski's Quoridor AI](https://danielborowski.github.io/site/quoridor-ai/display.html) - It's hard for me to grasp his AI algorithm from his source code. But I found [his comment on reddit](https://www.reddit.com/r/learnprogramming/comments/461woc/cminimax_implementation_for_quoridor/d01yo1m?utm_source=share&utm_medium=web2x) which says "I "sort of" implemented minimax with a depth of ~2 (hehe)." (Thanks to his Quoridor AI webpage, I could see that to implement AI in javascript and demonstrate it on right in the browser is viable. Also, I had trained myself with the AI on his webpage for playing Quoridor when I was a novice (hehe).)

- [Martijn van Steenbergen's SmartBrain 4](https://github.com/MedeaMelana/quoridorai) - This agent uses negamax of depth 4 with some heuristics (In his implementation, there are also SmartBrain 1, SmartBrain 2 and SmartBrain 3 each of which uses negamax of depth 1, 2 and 3. But, obviously, SmartBrain 4 is the strongest.)

## Result
The following table is a comparison of my 60k agent (Strong) to other agent types. Each agent from "2.5k agent (Novice)" to "180k agent" is my AI agent in this repository's source code just with different number of rollouts. The games were played half as light-colored pawn and half as dark-colored pawn for 60k (assuming light-colored pawn moves first). But, against Dainel's Quoridor AI, the games were played as light-colored pawn only since his AI only takes dark-colored pawn. Against Daniel's Quoridor AI and Martijin's SmartBrain 4, the matches are done manually, taking the moves from my 60k agent and playing the moves against them, and vice versa.

| Opponent | Number of games played (as light-colored / as dark-colored for 60k) | Wins as light-colored for 60k | Wins as dark-colored for 60k | Percentage of Wins for 60k | Lower Confidence Bound (95%) | Upper Confidence Bound (95%)
| -------------------- | ----- | ---- | ---- | --- | --- | --- |
| 2.5k agent (Novice)  | 100 (50/50) | 46 | 38 | 84% | 75.3% | 90.6% |
| 7.5k agent (Average) | 100 (50/50) | 39 | 36 | 75% | 65.3% | 83.1% |
| 20k agent (Good)     | 100 (50/50) | 31 | 33 | 64% | 53.8% | 73.4% |
| 120k agent           | 100 (50/50) | 26 | 25 | 51% | 40.8% | 61.1% |
| 180k agent           | 100 (50/50) | 23 | 20 | 43% | 33.1% | 53.3% |
| Daniel's Quoridor AI | 20 (20/0) | 15 | 0 | 75% | 50.9% | 91.3% | 
| Martijn's SmartBrain 4 | 10 (5/5) | 4 | 4 | 80% | 44.4% | 97.5% |

I thought Martijn's SmartBrain 4 was stronger than Daniel's Quoridor AI when I played against them by myself. But, interestingly, the 60k agent seemed to play better against Martijin's SmartBrain 4. In some matches, the play of Daniel's Quoridor AI somehow made the 60k agent exhaust walls so quickly and lose the game.

Martijn's implementation of Quoridor allows diagonal jump even if there is not a wall or the board edge behind the pawn to be jumped. (Original Quoridor rule allows diagonal jump "only if" there is a wall or the board edge behind the pawn to be jumped.) In a match against Martijn's SmartBrain 4, the 60k agent won the match although this illegal diagonal jump was played twice by SmartBrain 4. This match is included on the statistics of the table above. And in another match, this illegal diagonal jump was played by SmartBrain 4 when there were no left walls for both players, and the win or lose would be decided by whether the illegal jump accepted or not. So, I nullified this match.


## References

- Victor Massagué Respall, Joseph Alexander Brown and Hamma Aslam. *[Monte Carlo Tree Search for Quoridor](https://www.researchgate.net/publication/327679826_Monte_Carlo_Tree_Search_for_Quoridor)*. 2018.

- Levente Kocsis and Csaba Szepesva ́ri. *Bandit based Monte-Carlo Planning*. 2006.

- Peter Auer, Cesa-Bianchi and Fischer. *Finite-time Analysis of the Multiarmed Bandit Problem*. 2002.


