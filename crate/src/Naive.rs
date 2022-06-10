use std::ops::Neg;

use crate::{Guess, Wordle::ByteStr};

pub fn guess(words: &[ByteStr]) -> ByteStr {
    let best_guess = words
        .iter()
        .map(|word| (*word, entropy_of(word, words)))
        .reduce(|a, b| if a.1 > b.1 { a } else { b });
    if let Some(guess_word) = best_guess {
        println!("guessing: {:?}", guess_word);
        guess_word.0
    } else {
        panic!("no words available to make a guess")
    }
}

pub fn calc_best_guesses(words: &[ByteStr]) -> Vec<(ByteStr, f64)> {
    let mut best_guesses = words
        .iter()
        .map(|word| (*word, entropy_of(word, words)))
        .collect::<Vec<_>>();
    best_guesses.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    best_guesses[..10.min(best_guesses.len())].to_vec()
}

pub fn guess_information(words: &[ByteStr], guess: &Guess) -> f64 {
    let after_guess_count = words.iter().filter(|&&word| guess.matches(&word)).count();
    (after_guess_count as f64 / words.len() as f64).log2().neg()
}

pub fn entropy_of(guess_word: &ByteStr, valid_words: &[ByteStr]) -> f64 {
    let map_arr = Guess::calc_distribution(valid_words, guess_word);
    map_arr.iter().fold(0f64, |acc, value| {
        if *value != 0 {
            acc + calc_information(*value as f64 / valid_words.len() as f64)
        } else {
            acc
        }
    })
}

// pub fn calc_best_guesses(words: &[ByteStr]) -> Vec<(ByteStr, f64)> {}

fn calc_information(probability: f64) -> f64 {
    probability as f64 * probability.log2().abs()
}
