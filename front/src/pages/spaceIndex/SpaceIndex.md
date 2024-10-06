# Some things about space indexing

## What is it

When making a game it is very common that you need to know what is close to what, so that you know what entities can interact with each other. And you need to do it fast, so this is where space indexing data structures come in.

## The interface

An interface we could use in typescript for this structure is the following:

```typescript

interface Entity{
    position(): Vec2;
}

interface SpaceCollection<T extends Entity>{
    insert(entity: T): void;
    remove(entity: T): void;
    query(position: Vec2, r: number): T[];
    iter(): Iterable<T>;
}

```

Where `Entity` is the interface we will use for all the things that we may store.

## The simplest one: Just use a Grid

Maybe the first thing you think of when confronted with this problem is "why not just using a grid?". And that may be a good solution, so lets try it out:

Lets suppose that we have a map that is 100x100 and we have random circles in this map and whe whant to know if they collide. We can divide the space in 10x10 cells and put the circles inside the cells.

<space-index-example kind="grid"></space-index-example>


## The classic one: Quadtree

Maybe the most famous space indexing data structure is the quadtree. It is a tree where each node has 4 children, and each child represents a quadrant of the parent node. Every time you insert an entity in the quadtree, it will be inserted in the smallest node that contains it. This way, when you want to know what entities are close to a given entity, you can just traverse the tree and get all the entities in the nodes that are close to the node that contains the given entity.

Lets try it out:


<space-index-example kind="quadtree"></space-index-example>