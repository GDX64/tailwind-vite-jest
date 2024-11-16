use piet::{kurbo, Color};
use taffy::prelude::*;

pub enum MyShapes {
    Rect {
        color: Color,
        size: (f32, f32),
        children: Vec<MyShapes>,
    },
}

#[derive(Debug, Clone)]
pub enum LayoutResults {
    Rect {
        color: Color,
        node: Node,
        children: Vec<LayoutResults>,
    },
}

fn create_leaf(shape: &MyShapes, taffy: &mut Taffy) -> Node {
    let key = match shape {
        MyShapes::Rect {
            color,
            size,
            children,
        } => {
            // let style = Style;
            let node = taffy
                .new_leaf(Style {
                    flex_direction: FlexDirection::Row,
                    size: Size {
                        width: points(size.0),
                        height: points(size.1),
                    },
                    flex_grow: 1.0,
                    gap: points(10.0),
                    ..Default::default()
                })
                .unwrap();
            node
        }
    };
    key
}

pub fn calc_layout(shapes: MyShapes) -> Option<(LayoutResults, Taffy)> {
    let mut taffy = Taffy::new();
    fn recursive(shape: &MyShapes, taffy: &mut Taffy, parent: Node) -> LayoutResults {
        let node = create_leaf(shape, taffy);
        taffy.add_child(parent, node).ok();
        match shape {
            MyShapes::Rect { 
                color,
                size,
                children,
            } => LayoutResults::Rect {
                children: children
                    .iter()
                    .map(|child| recursive(child, taffy, node))
                    .collect(),
                color: *color,
                node,
            },
        }
    }
    let node = create_leaf(&shapes, &mut taffy);
    let res = recursive(&shapes, &mut taffy, node);
    taffy.compute_layout(node, Size::MIN_CONTENT).ok()?;
    Some((res, taffy))
}

mod test {
    #[test]
    pub fn test() {
        use taffy::prelude::*;

        // First create an instance of Taffy
        let mut taffy = Taffy::new();

        // Create a tree of nodes using `taffy.new_leaf` and `taffy.new_with_children`.
        // These functions both return a node id which can be used to refer to that node
        // The Style struct is used to specify styling information
        let header_node = taffy
            .new_leaf(Style {
                size: Size {
                    width: points(800.0),
                    height: points(100.0),
                },
                ..Default::default()
            })
            .unwrap();

        let body_node = taffy
            .new_leaf(Style {
                size: Size {
                    width: points(800.0),
                    height: auto(),
                },
                flex_grow: 1.0,
                ..Default::default()
            })
            .unwrap();

        let root_node = taffy
            .new_with_children(
                Style {
                    flex_direction: FlexDirection::Column,
                    size: Size {
                        width: points(800.0),
                        height: points(600.0),
                    },
                    ..Default::default()
                },
                &[header_node, body_node],
            )
            .unwrap();

        // Call compute_layout on the root of your tree to run the layout algorithm
        taffy.compute_layout(root_node, Size::MAX_CONTENT).unwrap();

        // Inspect the computed layout using taffy.layout
        assert_eq!(taffy.layout(root_node).unwrap().size.width, 800.0);
        assert_eq!(taffy.layout(root_node).unwrap().size.height, 600.0);
        assert_eq!(taffy.layout(header_node).unwrap().size.width, 800.0);
        assert_eq!(taffy.layout(header_node).unwrap().size.height, 100.0);
        assert_eq!(taffy.layout(body_node).unwrap().size.width, 800.0);
        assert_eq!(taffy.layout(body_node).unwrap().size.height, 500.0);
    }
}
