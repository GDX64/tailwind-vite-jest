use crate::{Guesser, Wordle::Correctness, WORDLE_SIZE, WORDS};
const MAP_ARR_SIZE: usize = 3usize.pow(WORDLE_SIZE as u32);

pub struct NaiveGuesser {
    words: Vec<&'static str>,
}

impl NaiveGuesser {
    pub fn new() -> Self {
        let dict = WORDS.split_whitespace().collect();
        NaiveGuesser { words: dict }
    }
}

impl Guesser for NaiveGuesser {
    fn guess(&mut self, history: &[crate::Guess]) -> String {
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

fn filter_with<'a>(all_words: &[&'a str], history: &[crate::Guess]) -> Vec<&'a str> {
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
