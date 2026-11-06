# Assignment 6

Due 27 Nov. Graded.

### Reading: 

Rabiner (1989), Problems 2 and 3 and the section on continuous mixture densities; the scikit-learn user guide on [Gaussian mixture models](https://scikit-learn.org/stable/modules/mixture.html).

### Implementation 

Use the Activity 6 cards and your own recordings. Compute features as in Assignment 3 (25 ms window, 10 ms hop) and drop the silent frames as in Assignment 4.

1. **GMMs on the Activity 6 cards.** Use `sklearn.mixture.GaussianMixture` on the cards 1, 2, 3, 4, 5, 6, 12, 13, 14, 15 (reshape them to one column).
   - Fit a model with `n_components=2`. Report the means (`means_`), standard deviations (the square root of `covariances_`) and mixture weights (`weights_`). Compare the means with the last round of the human k-means from the lecture: (3.5, 13.5).
   - Plot a histogram of the cards with the two weighted Gaussians and their sum drawn on top.
   - Use `predict_proba` to get the shares of three new cards: 8, 9 and 10. Which group does each one join, and how sure is the model? Where between 9 and 10 do the shares cross 0.5?
   - Fit models with 1, 2 and 3 components and compare them with `bic`. Which number of components does BIC pick, and does it match what you see in the histogram?

2. **Which vowel is it?** Record yourself saying a long /aː/ and a long /iː/ (about 3 s each, 16 kHz). Compute 13 MFCCs per frame and keep the last 20% of each vowel's frames for testing.
   - For each vowel, fit a `GaussianMixture` with `covariance_type="diag"` on its training frames, with $M = 1, 2, 4$ components.
   - Score each test frame with both vowel models (`score_samples`) and pick the vowel with the higher log-likelihood. Report the accuracy for each $M$.
   - Plot $c_1$ against $c_2$ for the frames of both vowels, with the contours of the 2-component model of each vowel on top. Do the two vowels overlap?
   - Repeat with `covariance_type="full"` for $M = 2$ only. Does the accuracy change? Connect your answer to the diagonal vs. full covariance slide from the lecture.

3. **Forced alignment** (demonstrated at the start of the lab). Run [Montreal Forced Aligner](https://montreal-forced-aligner.readthedocs.io) on a recording of *salaam* (your own voice, or a classmate's with their consent). MFA writes its output as a TextGrid, a plain-text file that lists each word and phone with its start and end time. Read it in Python with the `textgrid` package (`pip install textgrid`), then use `librosa` to plot the waveform and spectrogram with the phone boundaries drawn as vertical lines.
   - Where does /l/ start? Compare it with the class's Slido guesses from Lecture 4 (Activity 1).
   - How long are /a/ and /aː/, in ms, and what is the ratio?
   - If MFA's Arabic model is not available in your version, align an English sentence instead (`english_mfa`) and compare a short and a long vowel.

4. **Explore.** Open `lectures/public/trellis.html` (Trellis Lab) from the course repository in your browser. In the Sum vs Max tab, find your own pair of words that the forward score and the Viterbi score rank differently; do not use "Show me one". Report the observations and both words' settings, and explain in two sentences why the two scores disagree.

Submit one notebook. Report the hardware you used and the wall-clock time for Task 2.
