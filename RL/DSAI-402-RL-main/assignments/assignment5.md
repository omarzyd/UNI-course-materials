# Assignment 5

Graded. Due at Nov 27th.

## Reading

- Read Sections 5.2 and 5.4 of Sutton and Barto (MC estimation of action values and MC control without exploring starts). Skip Section 5.3.

## Implementation: FrozenLake

In Assignment 4 you used MC to find the value of a fixed policy. In this assignment MC finds the best policy by itself, only from games it plays. You will use FrozenLake because Gymnasium gives its model. This means you can find the true optimal policy with your value iteration from Assignment 4 and then check how close MC gets to it.

### The game

Create the 4x4 FrozenLake environment of Gymnasium.

```python
import gymnasium as gym
env = gym.make("FrozenLake-v1", map_name="4x4", is_slippery=True)
```

These are the rules the environment follows.

- The map is a 4x4 grid. `S` is the start, `G` is the goal, `F` is frozen ice that is safe to walk on and `H` is a hole.

  ```text
  S F F F
  F H F H
  F F F H
  H F F G
  ```

- The states are the cells, numbered 0 to 15 row by row. State 0 is the start and state 15 is the goal.
- There are four actions: 0 = left, 1 = down, 2 = right and 3 = up.
- The ice is slippery. You move in the direction you picked with probability $1/3$. Otherwise you slide to one of the two sides with probability $1/3$ each. For example, if you pick down you can end up going down, left or right. You never move backwards. A move into a wall leaves you where you are.
- The game ends when you fall into a hole (reward 0) or reach the goal (reward $+1$). It also stops after 100 steps.
- Use $\gamma = 0.99$.

`env.unwrapped.P` gives the model in the same format as Assignment 4, i.e. `P[s][a]` is a list of `(prob, next_state, reward, done)` tuples. Use the model only in Part A. The MC code in Parts B to D must learn from the games it plays and must not read `P`.

### Part A. The target

1. Use your value iteration from Assignment 4 to find $q_*$ and the optimal policy $\pi_*$. Draw $\pi_*$ on the 4x4 grid with arrows.
2. Look at the action $\pi_*$ picks in the start state and in state 4 (the cell below the start). In both states it walks into the wall. Explain why this is the best action on slippery ice.
3. In state 6 (the cell between two holes), two actions have the same value in $q_*$. Which two? Why?
4. Write a function that plays $n$ games with a given policy and returns the share of games that reach the goal. Report this success rate for $\pi_*$ and for a random policy with $n = 10{,}000$. You use this function in every part below.

### Part B. On-policy MC control with an $\epsilon$-greedy policy

1. Implement on-policy first-visit MC control with an $\epsilon$-greedy policy, as in Lecture 6. Start with $Q(s, a) = 0$ for every pair. When two actions have the same value, pick one of them at random.
2. Train with $\epsilon = 0.1$ for 50,000 episodes. Every 1,000 episodes, take the greedy policy of your current $Q$ and measure its success rate over 1,000 games. Plot the success rate against the number of episodes and add a flat line for the success rate of $\pi_*$.
3. At the end, draw the greedy policy on the grid. In which states does it pick a worse action than $\pi_*$? An action with the same $q_*$ value as the best one counts as correct. For those states, compare $Q(s, a)$ of the action MC picked with $q_*(s, a)$ of the best action. Are these states visited often or rarely?
4. Report the largest gap between your $Q$ and $q_*$ over the pairs $(s, a)$ with a non-terminal $s$. Which pairs have the largest gap? Why?

### Part C. The cost of $\epsilon$

1. Repeat Part B.2 with $\epsilon = 0.01$, $\epsilon = 0.3$ and a decaying $\epsilon_k = 1 / (1 + k / 1000)$, where $k$ is the episode number. Put the four learning curves on one plot. Run each setting with 3 different seeds and show the mean.
2. After 50,000 episodes, measure two success rates for each setting: one for the $\epsilon$-greedy policy that MC used to play and one for its greedy policy. Fill in this table.

| $\epsilon$ | Success of the $\epsilon$-greedy policy | Success of the greedy policy | States that differ from $\pi_*$ |
|---|---|---|---|
| 0.01 | | | |
| 0.1 | | | |
| 0.3 | | | |
| decaying | | | |

3. Which setting learns the best greedy policy after 50,000 episodes? Which setting plays the best while it learns? Explain why the two answers can be different.
4. On-policy MC control finds the best $\epsilon$-greedy policy, not the best policy. Use your table to explain what this means for FrozenLake.

### Part D. Why exploration is needed

1. Create the non-slippery version with `is_slippery=False`. Run MC control with $\epsilon = 0$ and no exploring starts for 2,000 episodes. Break ties with `np.argmax`, which always picks the first action. What happens? Look at $Q$ after training and explain.
2. Run it again with $\epsilon = 0.1$. Does it find the goal now?
3. Answer each question in a few lines.
   - In Part D.1, the agent never learned that the goal exists. Is this a problem of the policy, of $Q$ or of both?
   - FrozenLake has 16 states and 4 actions. What would change if the map were 100x100 with the goal far away?
   - Think about your class project. Can your environment start from any state? Which kind of exploration fits it?

## What to submit

- Your code and plots.
- A short report with your answers, the grids and the table.
