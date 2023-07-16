use futures::{stream::StreamExt, Stream};
use futures_signals::{
    signal::{Mutable, SignalExt},
    signal_vec::{MutableVec, SignalVec, SignalVecExt, VecDiff},
};

mod anchors_test;

fn test_signal() -> (impl Stream<Item = f64>, MutableVec<f64>) {
    let data_points = MutableVec::new();

    let desired_view_slice = Mutable::new((0, 5));
    let canvas_size = Mutable::new((100, 100));

    let vec_sum =
        data_points
            .signal_vec()
            .to_stream()
            .scan((0.0, Vec::<f64>::new()), |acc, diff| {
                let (sum, data_points) = acc;
                match diff {
                    VecDiff::Replace { values } => {
                        *sum = values.iter().clone().sum();
                        *data_points = values;
                    }
                    VecDiff::InsertAt { index, value } => {
                        data_points.insert(index, value);
                        *sum += value;
                    }
                    VecDiff::UpdateAt { index, value } => {
                        let el = data_points[index];
                        data_points[index] = value;
                        *sum -= el;
                        *sum += value;
                    }
                    VecDiff::RemoveAt { index } => {
                        let el = data_points.remove(index);
                        *sum -= el;
                    }
                    VecDiff::Clear { .. } => {
                        *sum = 0.0;
                        data_points.clear();
                    }
                    VecDiff::Move {
                        old_index,
                        new_index,
                    } => {
                        data_points.swap(old_index, new_index);
                    }
                    VecDiff::Pop {} => {
                        let el = data_points.pop().unwrap();
                        *sum -= el;
                    }
                    VecDiff::Push { value } => {
                        data_points.push(value);
                        *sum += value;
                    }
                }
                let sum = *sum;
                async move { Some(sum) }
            });
    return (vec_sum, data_points);

    //block on the stream
}

#[cfg(test)]
mod tests {
    use futures::{pin_mut, task::noop_waker};
    use futures_signals::signal::{from_stream, Signal};

    use super::*;

    #[tokio::test]
    async fn it_works() {
        let (s, v) = test_signal();
        let mut lock = v.lock_mut();
        lock.push(3.0);
        let sig = from_stream(s);
    }
}
