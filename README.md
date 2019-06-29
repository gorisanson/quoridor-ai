# Quoridor AI based on Monte Carlo Tree Search

[Quoridor](https://en.wikipedia.org/wiki/Quoridor) is an abstract strategy game played on a board of 81 (9x9) square spaces where the objective is to get your pawn to the opposite side of the board.

This AI agent that plays Quoridor is based on [Monte Carlo tree search](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search).
Pure Monte Carlo tree search resulted in a poor performance. The performance was significantly improved after applying some heuristics. I added heuristics to the selection, expansion and simulation phase of the tree search (and also to post processes after search). You can see the heuristics on the comments of the source code (Find the word "heuristic".)

You can play against this AI on the website https://gorisanson.github.io/quoridor-ai/.


## References

Victor Massagué Respall, Joseph Alexander Brown, *[Monte Carlo Tree Search for Quoridor](https://www.researchgate.net/publication/327679826_Monte_Carlo_Tree_Search_for_Quoridor)*, 2018.

Levente Kocsis & Csaba Szepesva ́ri, *Bandit based Monte-Carlo Planning*, 2006.

Peter Auer & Cesa-Bianchi & Fischer, *Finite-time Analysis of the Multiarmed Bandit Problem*, 2002.


