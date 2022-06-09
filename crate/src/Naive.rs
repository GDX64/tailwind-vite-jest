use crate::{Guess, Wordle::Correctness, WORDLE_SIZE, WORDS};
const MAP_ARR_SIZE: usize = 3usize.pow(WORDLE_SIZE as u32);

pub struct NaiveGuesser {
    words: Vec<&'static str>,
}

impl NaiveGuesser {
    pub fn new() -> Self {
        let dict = WORDS.split_whitespace().collect();
        NaiveGuesser { words: dict }
    }

    pub fn guess(&mut self, history: &[Guess]) -> String {
        let available_words = filter_with(&self.words, history);
        let best_guess = available_words
            .iter()
            .map(|word| (*word, calc_goodness(word, &available_words)))
            .reduce(|a, b| if a.1 > b.1 { a } else { b });
        if let Some(guess_word) = best_guess {
            println!("guessing: {:?}", guess_word);
            guess_word.0.to_string()
        } else {
            panic!("no words available to make a guess")
        }
    }

    pub fn calc_best_guesses(&self, history: &[Guess]) -> Vec<(&str, f64)> {
        let available_words = filter_with(&self.words, history);
        let mut best_guesses = available_words
            .iter()
            .map(|word| (*word, calc_goodness(word, &available_words)))
            .collect::<Vec<_>>();
        best_guesses.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        best_guesses[..10.min(best_guesses.len())].to_vec()
    }

    pub fn guess_information(&self, history: &[Guess], guess: &Guess) -> f64 {
        let available_words = filter_with(&self.words, &history);
        let after_guess_count = available_words
            .iter()
            .filter(|&&word| guess.matches(word))
            .count();
        (after_guess_count as f64 / available_words.len() as f64).log2()
    }
}

fn calc_goodness(guess_word: &str, valid_words: &[&str]) -> f64 {
    let mut map_arr = [0usize; MAP_ARR_SIZE];
    valid_words.iter().for_each(|&word| {
        let mask = Correctness::check(word, guess_word);
        let mask_radix = Correctness::mask_radix(&mask);
        map_arr[mask_radix] = map_arr[mask_radix] + 1;
    });
    map_arr.iter().fold(0f64, |acc, value| {
        if *value != 0 {
            acc + calc_information(*value as f64 / valid_words.len() as f64)
        } else {
            acc
        }
    })
}

fn calc_information(probability: f64) -> f64 {
    probability as f64 * probability.log2().abs()
}

fn filter_with<'a>(all_words: &[&'a str], history: &[Guess]) -> Vec<&'a str> {
    all_words
        .iter()
        .filter(|&&word| {
            history
                .iter()
                .all(|guess| guess.matches(word) && guess.word != word)
        })
        .map(|&str| str)
        .collect()
}
