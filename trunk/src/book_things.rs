use std::collections::BTreeSet;

#[derive(Clone)]
pub struct Offer {
    pub index: usize,
}

impl PartialEq for Offer {
    fn eq(&self, other: &Self) -> bool {
        self.index == other.index
    }
}

impl Eq for Offer {}

impl PartialOrd for Offer {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.index.cmp(&other.index))
    }
}

impl Ord for Offer {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.index.cmp(&other.index)
    }
}

pub trait BookBuilder {
    fn add_offer(&mut self, offer: Offer);
    fn remove_offer(&mut self, offer: Offer);

    fn to_vec(self) -> Vec<Offer>;
}

pub struct ArrBook {
    offers: Vec<Offer>,
}

impl ArrBook {
    pub fn new() -> ArrBook {
        ArrBook {
            offers: vec![Offer { index: 0 }; 16_000],
        }
    }
}

impl BookBuilder for ArrBook {
    fn add_offer(&mut self, offer: Offer) {
        if self.offers.len() == 0 {
            self.offers.push(offer)
        } else {
            self.offers
                .insert(offer.index.min(self.offers.len() - 1), offer);
        }
    }
    fn remove_offer(&mut self, offer: Offer) {
        self.offers.remove(offer.index);
    }
    fn to_vec(self) -> Vec<Offer> {
        self.offers
    }
}

pub struct MapBook {
    pub offers: BTreeSet<Offer>,
}

impl MapBook {
    pub fn new() -> MapBook {
        MapBook {
            offers: BTreeSet::from_iter((0..16_000).map(|i| Offer { index: i })),
        }
    }
}

impl BookBuilder for MapBook {
    fn add_offer(&mut self, offer: Offer) {
        self.offers.insert(offer);
    }
    fn remove_offer(&mut self, offer: Offer) {
        self.offers.remove(&offer);
    }
    fn to_vec(self) -> Vec<Offer> {
        self.offers.into_iter().collect()
    }
}

#[cfg(test)]
mod test {
    use super::{BookBuilder, MapBook, Offer};

    #[test]
    fn test_ordering() {
        let mut mb = MapBook::new();
        [1, 4, 5, 3 as usize].into_iter().for_each(|v| {
            mb.add_offer(Offer { index: v });
        });
        let values = mb
            .offers
            .into_iter()
            .map(|offer| offer.index)
            .collect::<Vec<_>>();
        assert_eq!(&[1, 3, 4, 5], &values[..]);
    }
}
