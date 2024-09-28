---
title: "C++ Unleashed: Templates and Generic Programming"
date: 2024-09-27 00:53:14
tags:
    - C/C++
    - Modern C++
    - C++ Unleashed
    - Zero to Hero
categories: Tutorial
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Object-Oriented Programming](/2024/09/27/cpp-unleash/02h-oop)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Templates and Generic Programming

Templates and generic programming are powerful features in C++ that allow you to write flexible and reusable code. Templates enable functions and classes to operate with generic types, making your programs more abstract and adaptable.

In this chapter, we'll cover:

- Function Templates
- Class Templates
- Template Specialization
- Variadic Templates
- Concepts (C++20)

<!--more-->

## Function Templates

Function templates allow you to write a single function that works with any data type.

### Basic Syntax

```cpp
template <typename T>
ReturnType FunctionName(T parameter) {
    // Function body
}
```

- **`template <typename T>`**: Introduces a template parameter `T`.
- **`T`**: Represents a generic data type.

### Example: Generic Swap Function

```cpp
template <typename T>
void swapValues(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}
```

**Usage:**

```cpp
int main() {
    int x = 10, y = 20;
    swapValues(x, y);

    double a = 1.5, b = 2.5;
    swapValues(a, b);

    return 0;
}
```

### Function Templates with Multiple Parameters

You can have multiple template parameters.

```cpp
template <typename T1, typename T2>
auto add(T1 a, T2 b) -> decltype(a + b) {
    return a + b;
}
```

**Usage:**

```cpp
int main() {
    auto result = add(5, 3.2); // result is of type double
    return 0;
}
```

### Template Argument Deduction

The compiler automatically deduces the template arguments based on the function arguments.

**Explicit Template Arguments:**

```cpp
swapValues<int>(x, y);
```

- Usually not necessary unless deduction fails.

## Class Templates

Class templates allow you to define a class with generic types.

### Basic Syntax

```cpp
template <typename T>
class ClassName {
public:
    // Member functions and variables using T
};
```

### Example: Generic Array Class

```cpp
template <typename T, size_t N>
class Array {
private:
    T data[N];

public:
    void set(size_t index, const T& value) {
        if (index < N) {
            data[index] = value;
        }
    }

    T& get(size_t index) {
        if (index < N) {
            return data[index];
        }
        throw std::out_of_range("Index out of range");
    }

    size_t size() const {
        return N;
    }
};
```

**Usage:**

```cpp
int main() {
    Array<int, 5> intArray;
    intArray.set(0, 10);
    intArray.set(1, 20);

    std::cout << intArray.get(0) << std::endl; // Outputs 10
    std::cout << intArray.get(1) << std::endl; // Outputs 20

    return 0;
}
```

### Member Function Definitions Outside the Class

When defining member functions outside the class, include the template parameters.

```cpp
template <typename T, size_t N>
void Array<T, N>::set(size_t index, const T& value) {
    // Function body
}
```

## Template Specialization

Template specialization allows you to define a custom implementation of a template for a specific type.

### Full Specialization

Providing a completely different implementation for a specific type.

**Example:**

```cpp
template <typename T>
class TypeInfo {
public:
    static std::string name() {
        return "Unknown";
    }
};

// Specialization for int
template <>
class TypeInfo<int> {
public:
    static std::string name() {
        return "Integer";
    }
};

// Specialization for double
template <>
class TypeInfo<double> {
public:
    static std::string name() {
        return "Double";
    }
};
```

**Usage:**

```cpp
int main() {
    std::cout << TypeInfo<char>::name() << std::endl;    // Outputs "Unknown"
    std::cout << TypeInfo<int>::name() << std::endl;     // Outputs "Integer"
    std::cout << TypeInfo<double>::name() << std::endl;  // Outputs "Double"

    return 0;
}
```

### Partial Specialization

Specializing a template for a subset of types.

**Example:**

```cpp
template <typename T, typename U>
class Pair {
public:
    T first;
    U second;
};

// Partial specialization when both types are the same
template <typename T>
class Pair<T, T> {
public:
    T first;
    T second;

    void display() {
        std::cout << "Pair of " << typeid(T).name() << std::endl;
    }
};
```

**Usage:**

```cpp
int main() {
    Pair<int, double> p1;
    Pair<int, int> p2;
    p2.display(); // Uses the specialized version

    return 0;
}
```

## Variadic Templates

Variadic templates allow functions and classes to accept an arbitrary number of template parameters.

### Function Variadic Templates

**Example: Print Function**

```cpp
void print() {
    std::cout << std::endl;
}

template <typename T, typename... Args>
void print(T first, Args... args) {
    std::cout << first << " ";
    print(args...);
}
```

**Usage:**

```cpp
int main() {
    print(1, 2.5, "Hello", 'A'); // Outputs: 1 2.5 Hello A

    return 0;
}
```

**Explanation:**

- The `print` function recursively unpacks the arguments.
- The base case is the `print()` function with no parameters.

### Class Variadic Templates

**Example: Tuple Class**

```cpp
template <typename... Types>
class Tuple {
    // Implementation
};
```

**Using `std::tuple`**

The Standard Library provides `std::tuple`, a variadic template class.

```cpp
#include <tuple>

int main() {
    std::tuple<int, double, std::string> t(1, 2.5, "Hello");

    int i = std::get<0>(t);
    double d = std::get<1>(t);
    std::string s = std::get<2>(t);

    return 0;
}
```

## Concepts (C++20)

Concepts provide a way to specify template requirements, improving readability and error messages.

### Basic Syntax

```cpp
template <typename T>
concept ConceptName = requires(T a) {
    // Expressions and requirements
};
```

### Example: Numeric Concept

```cpp
#include <concepts>

template <typename T>
concept Numeric = std::is_arithmetic_v<T>;

template <Numeric T>
T add(T a, T b) {
    return a + b;
}
```

**Usage:**

```cpp
int main() {
    int result = add(5, 10);       // OK
    // std::string s = add("a", "b"); // Error: std::string is not Numeric

    return 0;
}
```

### Using `requires` Clauses

```cpp
template <typename T>
requires std::is_integral_v<T>
T factorial(T n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}
```

### Standard Library Concepts

- **`std::integral`**
- **`std::floating_point`**
- **`std::signed_integral`**
- **`std::unsigned_integral`**
- **`std::default_initializable`**

**Example:**

```cpp
#include <concepts>

template <std::integral T>
T gcd(T a, T b) {
    while (b != 0) {
        T temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
```

## Practical Example: Generic Sorting Function

Let's create a generic sorting function using templates.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

template <typename T>
void sortVector(std::vector<T>& vec) {
    std::sort(vec.begin(), vec.end());
}

int main() {
    std::vector<int> intVec = {5, 2, 9, 1, 5};
    sortVector(intVec);

    for (const auto& val : intVec) {
        std::cout << val << " "; // Outputs: 1 2 5 5 9
    }
    std::cout << std::endl;

    std::vector<std::string> strVec = {"apple", "orange", "banana"};
    sortVector(strVec);

    for (const auto& val : strVec) {
        std::cout << val << " "; // Outputs: apple banana orange
    }
    std::cout << std::endl;

    return 0;
}
```

## Exercises

1. **Generic Max Function**

   Write a function template `maxValue` that returns the maximum of two values.

   ```cpp
   template <typename T>
   T maxValue(const T& a, const T& b) {
       return (a > b) ? a : b;
   }
   ```

2. **Stack Class Template**

   Implement a simple stack class template.

   ```cpp
   template <typename T>
   class Stack {
   private:
       std::vector<T> elements;

   public:
       void push(const T& item) {
           elements.push_back(item);
       }

       void pop() {
           if (!elements.empty()) {
               elements.pop_back();
           }
       }

       T& top() {
           return elements.back();
       }

       bool isEmpty() const {
           return elements.empty();
       }
   };
   ```

   **Usage:**

   ```cpp
   int main() {
       Stack<int> intStack;
       intStack.push(1);
       intStack.push(2);
       intStack.push(3);

       while (!intStack.isEmpty()) {
           std::cout << intStack.top() << " ";
           intStack.pop();
       }
       // Outputs: 3 2 1

       return 0;
   }
   ```

3. **Function Variadic Template**

   Create a variadic template function `sum` that calculates the sum of all its arguments.

   ```cpp
   template <typename T>
   T sum(T value) {
       return value;
   }

   template <typename T, typename... Args>
   T sum(T first, Args... args) {
       return first + sum(args...);
   }
   ```

   **Usage:**

   ```cpp
   int main() {
       auto result = sum(1, 2, 3, 4, 5); // result = 15

       std::cout << "Sum: " << result << std::endl;

       return 0;
   }
   ```

## Summary

In this chapter, you've learned about:

- **Function Templates:**
  - Writing generic functions that work with any data type.
  - Template argument deduction and multiple template parameters.

- **Class Templates:**
  - Creating generic classes to handle data of any type.
  - Implementing member functions inside and outside the class.

- **Template Specialization:**
  - Customizing templates for specific types using full and partial specialization.

- **Variadic Templates:**
  - Writing functions and classes that accept an arbitrary number of template arguments.
  - Implementing recursive functions to process variadic arguments.

- **Concepts (C++20):**
  - Defining template requirements using concepts.
  - Using standard library concepts and `requires` clauses for constraints.

Templates and generic programming enable you to write flexible and reusable code, reducing redundancy and improving maintainability. Mastery of these features allows you to create powerful abstractions and efficient libraries.

---

In the next chapter, we'll explore **Modern C++ Features**, including type deduction, range-based loops, and other enhancements that make C++ programming more expressive and safer.

Next chapter: [Modern C++ Features](/2024/09/27/cpp-unleash/02h-mdncppftr)
