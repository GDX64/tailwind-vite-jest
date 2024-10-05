# Some things about space indexing

## What is it

When making a game it is very common that you need to know what is close to what, so that you know what entities can interact with each other. And you need to do it fast, so this is where space indexing data structures come in.

## The classic one: Quadtree

Maybe the most famous space indexing data structure is the quadtree. It is a tree where each node has 4 children, and each child represents a quadrant of the parent node. Every time you insert an entity in the quadtree, it will be inserted in the smallest node that contains it. This way, when you want to know what entities are close to a given entity, you can just traverse the tree and get all the entities in the nodes that are close to the node that contains the given entity.

Lets try it out:

<quad-tree-example/>