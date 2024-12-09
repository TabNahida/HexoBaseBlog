---
title: "Embracing Modularity: Incremental Programming and My Journey with the CBuer Compiler"
date: 2024-11-21 00:02:01
tags:
    - C++
    - Compiler
    - CBuer
    - Diary
categories: Thought
---

After some help from GPT-4, I finally began working on the [CBuer language compiler](https://github.com/C-Buer/Compiler). Initially, I was hesitant about breaking things apart. I wanted to put most of the frontend, such as the Lexer and Parser, into a single state machine. It seemed simpler at first, but it quickly became a nightmare to maintain. Every change meant sifting through a tangled mess, and extending functionality was getting harder by the day.

Eventually, I embraced a modular approach, separating each of the compiler components into distinct modules. By breaking down the components into manageable parts, everything started falling into place. Each module had a well-defined responsibility—Lexer, Parser, and the subsequent stages were their own entities, communicating through clear interfaces.

This separation brought several benefits. Writing new features became more straightforward, debugging became easier, and more importantly, making changes didn't feel like defusing a bomb anymore. I could work on the Lexer without worrying about breaking the Parser, and vice versa. Each piece of the puzzle had its own rules and scope, reducing the complexity of the overall system. It's like building with LEGO blocks rather than trying to mold a monolithic, shapeless lump of clay.

One major lesson I learned during this journey is the power of incremental programming. It wasn't about building everything perfectly right away, but rather developing each module iteratively. As I grew more familiar with the project, my development speed increased as well. Incremental changes became second nature, and adding new features felt like stacking another brick rather than reconstructing a tower.

Of course, AI assistance played a significant role in this transformation. I found that, while AI is great for a lot of tasks, it struggles even after moving to a modular approach, especially when the problems are deeply interconnected. Despite the modularity, GPT-4 often faced challenges in addressing the complexities inherent in such systems.

Modularity has truly changed the way I approach programming. It made my work more structured and efficient, but also much more enjoyable. Taking this step towards embracing separation and incremental progress was a game-changer for developing the CBuer compiler.
