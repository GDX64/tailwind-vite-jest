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

This idea is very simple, but it works quite well. Here on my machine, for 500 circles we can speed up the simulation for a factor of 10.


## The classic one: Quadtree

Maybe the most famous space indexing data structure is the quadtree. It is a tree where each node has 4 children, and each child represents a quadrant of the parent node. Every time you insert an entity in the quadtree, it will be inserted in the smallest node that contains it. This way, when you want to know what entities are close to a given entity, you can just traverse the tree and get all the entities in the nodes that are close to the node that contains the given entity.

Lets try it out:


<space-index-example kind="quadtree"></space-index-example>

A quad tree is a bit more complicated than a grid, but it has some advantages. With the grid we can end up with lots of empty cells, and with the quadtree we can have a more dynamic structure that will adapt to the entities that are being inserted. But dispite that, the quadtree can be slower than the grid in some cases, maily because of the computational cost of traversing the tree. Modern hardware likes arrays, and the grid is just an array of arrays, so it can be faster in some cases.

## The cool kids one: Spatial Hash

The spatial hash is very similar to the grid, but it is more dynamic. Instead of having a fixed grid, we have a hash table where the keys are the cells and the values are the entities that are inside the cell. This way we have a fixed size grid, but it wont be as sparse as the grid we've seen before.

Try changing the number of cells and the number of entities in the example below:

<space-index-example kind="hashgrid"></space-index-example>

I found it kind of tricky to get the parameters right for the hashgrid. You can set a number of cells, and the size of the cells, and it affects the performance of the queries. It looks like usually you should set the cell size to be the size of your most common queries. If the cell is too big, you will end up looking at too many entities, and if it is too small you will end up looking at too many cells (and too many entities also).

## What did I end up using?

My game is an RTS, so units tend to group themselves in clusters. So something like a quadtree fits well for this case. We can also mix up quadtrees and hashgrids so that the quadtree does not get too deep (wich is what harms the performance at the end). 

That all said... I'm using just a grid anyways, because it is simple and it is fast enough for now 🤭. I'm also using rust for my core game logic, and rust is very efficient with arrays, much more than javascript. So I will roll this thing with a grid for a while. It's all very easy to swap if I need to, so I won't worry much about that.