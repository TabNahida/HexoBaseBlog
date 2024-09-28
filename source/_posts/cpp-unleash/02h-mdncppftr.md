---
title: "C++ Unleashed: Modern C++ Features"
date: 2024-09-27 01:18:46
tags:
    - c-cpp
    - modern-cpp
    - cpp-unleash
    - 02Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Templates and Generic Programming](/2024/09/27/cpp-unleash/02h-tplgenpgm)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Modern C++ Features

Modern C++ (C++11 and later) introduced a range of features that enhance the language's expressiveness, performance, and safety. This chapter will cover some of the most important features that you should know to write effective C++ code today.

In this chapter, we'll discuss:

- Type Inference with `auto`
- Range-Based for Loops
- Smart Pointers
- Lambda Expressions
- `nullptr`
- `constexpr`
- Move Semantics
- The `std::optional` Class

<!--more-->

## Type Inference with `auto`

The `auto` keyword allows the compiler to automatically deduce the type of a variable at compile time, simplifying code and improving readability.

### Example:

```cpp
#include <iostream>
#include <vector>

int main() {
    auto x = 42; // x is int
    auto y = 3.14; // y is double
    auto str = "Hello, World!"; // str is const char*

    std::vector<int> vec = {1, 2, 3, 4, 5};
    auto it = vec.begin(); // it is std::vector<int>::iterator

    std::cout << "x: " << x << ", y: " << y << ", str: " << str << std::endl;

    return 0;
}
```

## Range-Based for Loops

Range-based for loops provide a more readable way to iterate through containers, eliminating the need for iterators and index-based loops.

### Example:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    for (const auto& num : numbers) {
        std::cout << num << " "; // Outputs: 1 2 3 4 5
    }
    std::cout << std::endl;

    return 0;
}
```

## Smart Pointers

Smart pointers manage the memory of dynamically allocated objects, reducing the risk of memory leaks and dangling pointers. The three main types are:

- `std::unique_ptr`
- `std::shared_ptr`
- `std::weak_ptr`

### Example: `std::unique_ptr`

```cpp
#include <iostream>
#include <memory>

class MyClass {
public:
    MyClass() { std::cout << "Constructor" << std::endl; }
    ~MyClass() { std::cout << "Destructor" << std::endl; }
};

int main() {
    std::unique_ptr<MyClass> ptr = std::make_unique<MyClass>();
    // No need to manually delete; memory is automatically managed

    return 0;
}
```

### Example: `std::shared_ptr`

```cpp
#include <iostream>
#include <memory>

class MyClass {
public:
    MyClass() { std::cout << "Constructor" << std::endl; }
    ~MyClass() { std::cout << "Destructor" << std::endl; }
};

int main() {
    std::shared_ptr<MyClass> ptr1 = std::make_shared<MyClass>();
    {
        std::shared_ptr<MyClass> ptr2 = ptr1; // Both share ownership
    } // Destructor called when ptr2 goes out of scope

    return 0;
}
```

## Lambda Expressions

Lambda expressions provide a concise way to define anonymous functions directly within your code, enabling inline function definitions.

### Syntax:

```cpp
[capture](parameters) -> return_type {
    // Function body
}
```

### Example:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // Lambda to print each number
    std::for_each(numbers.begin(), numbers.end(), [](int n) {
        std::cout << n << " ";
    });
    std::cout << std::endl;

    // Lambda to filter even numbers
    auto is_even = [](int n) { return n % 2 == 0; };
    auto count = std::count_if(numbers.begin(), numbers.end(), is_even);
    std::cout << "Count of even numbers: " << count << std::endl;

    return 0;
}
```

## `nullptr`

`nullptr` is a null pointer constant introduced in C++11, replacing the old `NULL` macro. It provides a type-safe way to represent null pointers.

### Example:

```cpp
#include <iostream>

void func(int* ptr) {
    if (ptr == nullptr) {
        std::cout << "Pointer is null." << std::endl;
    }
}

int main() {
    int* p = nullptr; // Safe null pointer
    func(p);

    return 0;
}
```

## `constexpr`

The `constexpr` keyword allows you to define functions and variables that can be evaluated at compile time, improving performance and enabling more powerful compile-time computations.

### Example:

```cpp
#include <iostream>

constexpr int square(int x) {
    return x * x;
}

int main() {
    constexpr int result = square(5); // Computed at compile time
    std::cout << "Square of 5 is: " << result << std::endl;

    return 0;
}
```

## Move Semantics

Move semantics allow the resources of temporary objects to be transferred rather than copied, enhancing performance. This is particularly useful for objects with dynamic memory allocation.

### Example:

```cpp
#include <iostream>
#include <vector>

class MyVector {
private:
    std::vector<int> data;

public:
    MyVector(std::initializer_list<int> init) : data(init) {}

    // Move constructor
    MyVector(MyVector&& other) noexcept : data(std::move(other.data)) {}

    void display() const {
        for (const auto& val : data) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    MyVector v1 = {1, 2, 3, 4, 5};
    MyVector v2 = std::move(v1); // Move v1 into v2

    v2.display(); // Outputs: 1 2 3 4 5
    return 0;
}
```

## The `std::optional` Class

`std::optional` is a utility that represents an optional value that may or may not be present, offering a safer alternative to using pointers or other methods to signify optionality.

### Example:

```cpp
#include <iostream>
#include <optional>

std::optional<int> findValue(bool shouldFind) {
    if (shouldFind) {
        return 42; // Optional value is present
    }
    return std::nullopt; // No value present
}

int main() {
    auto value = findValue(true);
    if (value) {
        std::cout << "Found value: " << *value << std::endl; // Dereference
    } else {
        std::cout << "No value found." << std::endl;
    }

    return 0;
}
```

## Summary

In this chapter, you learned about important features introduced in modern C++:

- **Type Inference with `auto`:** Automatically deducing variable types.
- **Range-Based for Loops:** Simplifying iterations over containers.
- **Smart Pointers:** Managing memory safely and efficiently.
- **Lambda Expressions:** Defining anonymous functions inline.
- **`nullptr`:** A type-safe null pointer constant.
- **`constexpr`:** Enabling compile-time computation for functions and variables.
- **Move Semantics:** Optimizing resource management for temporary objects.
- **`std::optional`:** Representing values that may or may not be present.

These features make modern C++ more powerful, expressive, and safer, helping you write better code with less risk of errors. In the next chapter, we will delve into **Standard Template Library (STL)**, exploring its containers, algorithms, and iterators.

Next chapter: [Standard Template Library (STL)](/2024/09/27/cpp-unleash/02h-stl)
