---
title: "C++ Unleashed: Control Structures"
date: 2024-09-26 14:36:02
tags:
    - C/C++
    - Modern C++
    - C++ Unleashed
    - Zero to Hero
categories: Tutorial
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Getting Start](/2024/09/26/cpp-unleash/02h-getstart)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Control Structures

Control structures are fundamental to programming as they dictate the flow of execution within your programs. In C++, control structures allow you to make decisions, repeat actions, and alter the flow based on certain conditions. This chapter covers conditional statements, loops, and jump statements, including the use of `goto`.

<!--more-->

## Conditional Statements

Conditional statements allow your program to execute different sections of code based on whether a condition is true or false. The primary conditional statements in C++ are `if` and `switch`.

### `if` Statement

The `if` statement executes a block of code if a specified condition is true. You can also include `else if` and `else` clauses to handle additional conditions.

**Syntax:**
```cpp
if (condition) {
    // Code to execute if condition is true
} else if (another_condition) {
    // Code to execute if another_condition is true
} else {
    // Code to execute if none of the above conditions are true
}
```

**Example:**
```cpp
#include <iostream>

int main() {
    int number;
    std::cout << "Enter a number: ";
    std::cin >> number;

    if (number > 0) {
        std::cout << "Positive number." << std::endl;
    } else if (number < 0) {
        std::cout << "Negative number." << std::endl;
    } else {
        std::cout << "Zero." << std::endl;
    }

    return 0;
}
```

### `switch` Statement

The `switch` statement allows multi-way branching based on the value of an integral or enumeration type.

**Syntax:**
```cpp
switch (expression) {
    case value1:
        // Code to execute if expression == value1
        break;
    case value2:
        // Code to execute if expression == value2
        break;
    // More cases...
    default:
        // Code to execute if none of the cases match
}
```

**Example:**
```cpp
#include <iostream>

int main() {
    char grade;
    std::cout << "Enter your grade (A, B, C, D, F): ";
    std::cin >> grade;

    switch (grade) {
        case 'A':
            std::cout << "Excellent!" << std::endl;
            break;
        case 'B':
            std::cout << "Good job!" << std::endl;
            break;
        case 'C':
            std::cout << "Fair." << std::endl;
            break;
        case 'D':
            std::cout << "Needs improvement." << std::endl;
            break;
        case 'F':
            std::cout << "Fail." << std::endl;
            break;
        default:
            std::cout << "Invalid grade." << std::endl;
    }

    return 0;
}
```

## Loops

Loops allow you to execute a block of code multiple times. C++ provides several types of loops: `for`, `while`, and `do-while`.

### `for` Loop

The `for` loop is typically used when the number of iterations is known beforehand.

**Syntax:**
```cpp
for (initialization; condition; increment) {
    // Code to execute each iteration
}
```

**Example:**
```cpp
#include <iostream>

int main() {
    for (int i = 1; i <= 5; ++i) {
        std::cout << "Iteration " << i << std::endl;
    }

    return 0;
}
```

### `while` Loop

The `while` loop continues to execute as long as the specified condition remains true. It's useful when the number of iterations is not known in advance.

**Syntax:**
```cpp
while (condition) {
    // Code to execute each iteration
}
```

**Example:**
```cpp
#include <iostream>

int main() {
    int count = 1;
    while (count <= 5) {
        std::cout << "Count: " << count << std::endl;
        ++count;
    }

    return 0;
}
```

### `do-while` Loop

The `do-while` loop is similar to the `while` loop, but it guarantees that the loop body is executed at least once, as the condition is checked after the execution of the loop body.

**Syntax:**
```cpp
do {
    // Code to execute each iteration
} while (condition);
```

**Example:**
```cpp
#include <iostream>

int main() {
    int number;
    do {
        std::cout << "Enter a positive number (0 to exit): ";
        std::cin >> number;
        std::cout << "You entered: " << number << std::endl;
    } while (number != 0);

    return 0;
}
```

## Jump Statements

Jump statements allow you to alter the flow of control by jumping to a different part of the program. The primary jump statements in C++ are `break`, `continue`, `return`, and `goto`.

### `break`

The `break` statement exits the nearest enclosing loop or `switch` statement.

**Example: Exiting a Loop Early**
```cpp
#include <iostream>

int main() {
    for (int i = 1; i <= 10; ++i) {
        if (i == 5) {
            break; // Exit the loop when i is 5
        }
        std::cout << i << " ";
    }
    // Output: 1 2 3 4
    return 0;
}
```

### `continue`

The `continue` statement skips the rest of the current loop iteration and proceeds to the next iteration.

**Example: Skipping Odd Numbers**
```cpp
#include <iostream>

int main() {
    for (int i = 1; i <= 5; ++i) {
        if (i % 2 != 0) {
            continue; // Skip odd numbers
        }
        std::cout << i << " ";
    }
    // Output: 2 4
    return 0;
}
```

### `return`

The `return` statement exits a function and optionally returns a value to the caller.

**Example: Exiting a Function Early**
```cpp
#include <iostream>

int divide(int a, int b) {
    if (b == 0) {
        std::cerr << "Error: Division by zero!" << std::endl;
        return 0; // Exit the function early
    }
    return a / b;
}

int main() {
    int result = divide(10, 2);
    std::cout << "Result: " << result << std::endl; // Output: Result: 5

    result = divide(10, 0); // Triggers error message and returns 0
    std::cout << "Result: " << result << std::endl; // Output: Result: 0

    return 0;
}
```

### `goto`

The `goto` statement allows you to jump to a labeled statement within the same function. While `goto` can be used for error handling or breaking out of deeply nested loops, its use is generally discouraged as it can lead to spaghetti code, making programs harder to read and maintain.

**Syntax:**
```cpp
goto label;

// ...

label:
    // Code to jump to
```

**Example: Using `goto` for Error Handling**
```cpp
#include <iostream>

int main() {
    int num;
    std::cout << "Enter a positive number: ";
    std::cin >> num;

    if (num <= 0) {
        std::cerr << "Invalid input. Number must be positive." << std::endl;
        goto end; // Jump to the end label
    }

    std::cout << "You entered: " << num << std::endl;

    end:
        std::cout << "Program ended." << std::endl;
    return 0;
}
```

**Best Practices:**
- **Avoid Using `goto` When Possible**: Prefer structured control flow constructs (`if`, `for`, `while`, etc.) to maintain code readability.
- **Use Sparingly and Carefully**: If you must use `goto`, ensure it's used in a controlled and understandable manner, such as for error handling in C-style code.

## Summary

In this chapter, you've learned about the fundamental control structures in C++ that dictate the flow of your programs:

- **Conditional Statements**: `if` and `switch` allow you to execute code based on conditions.
- **Loops**: `for`, `while`, and `do-while` enable you to repeat actions.
- **Jump Statements**: `break`, `continue`, `return`, and `goto` allow you to alter the flow of execution within loops and functions.

Understanding and effectively utilizing these control structures is essential for writing dynamic and efficient C++ programs. As you continue, you'll apply these concepts in more complex scenarios, building robust and responsive applications.

---

Now you're ready to move on to **Functions**, where you'll learn how to create reusable blocks of code to perform specific tasks within your programs.

Next chapter: [Functions](/2024/09/26/cpp-unleash/02h-func)