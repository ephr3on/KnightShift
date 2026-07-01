# Puzzle verification + hint update

## Default puzzle card corrections

All built-in puzzle cards now show BFS-verified optimal move counts for the current standard board:

| Puzzle | Mode | Correct optimal moves |
|---|---:|---:|
| The Flag | No Turns | 32 |
| The Star | No Turns | 32 |
| The Bridge | No Turns | 36 |
| The Tower | No Turns | 38 |
| The House | No Turns | 56 |
| The Pyramid | With Turns | 12 |
| The Line | With Turns | 15 |
| The Center | With Turns | 19 |
| The Gate Keepers | With Turns | 25 |
| The Arrow Head | With Turns | 30 |

The old no-turn values came from a different/earlier board interpretation and were not valid for the current board graph.

## Solo hint feature

Normal solo games now have a floating **Hint** button on the play board. It computes the next move on a shortest path from the current position using BFS and highlights:

- the knight to move,
- the destination cell,
- the number of moves still left on an optimal route.

Online race screens intentionally do not include hints.
