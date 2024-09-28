---
title: "C++ Unleashed: Functions"
date: 2024-09-26 15:10:57
tags:
    - c-cpp
    - modern-cpp
    - cpp-unleash
    - 02Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Control Structures](/2024/09/26/cpp-unleash/02h-ctrlstruct)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Functions

Functions are fundamental building blocks in C++ programming that allow you to organize your code into reusable pieces. They help break down complex problems into smaller, manageable tasks, improve code readability, and facilitate code reuse.

In this chapter, we'll cover:

- Function Definition and Calls
- Parameter Passing
- Return Values
- Default Arguments
- Function Overloading
- Recursive Functions
- Lambda Expressions

<!--more-->

## Function Definition and Calls

A function is a block of code that performs a specific task. In C++, you define a function once and can call it multiple times throughout your program.

### Function Syntax

The basic syntax for defining a function:

```cpp
return_type function_name(parameter_list) {
    // Function body
}
```

- **return_type**: The data type of the value the function returns. Use `void` if it doesn't return a value.
- **function_name**: The name you give to the function.
- **parameter_list**: A comma-separated list of parameters (can be empty).

### Example: Simple Function

**Definition:**

```cpp
// Function that prints a greeting message
void greet() {
    std::cout << "Hello from the function!" << std::endl;
}
```

**Calling the Function:**

```cpp
int main() {
    greet(); // Function call
    return 0;
}
```

### Function Declaration vs. Definition

- **Declaration (Prototype):** Tells the compiler about a function's name, return type, and parameters.
- **Definition:** Provides the actual body of the function.

**Example:**

```cpp
// Function declaration (prototype)
int add(int a, int b);

// Function definition
int add(int a, int b) {
    return a + b;
}
```

### Why Separate Declaration and Definition?

- **Organization:** Declarations are often placed in header files (`.h`), and definitions in source files (`.cpp`).
- **Multiple Files:** Allows functions to be used across multiple files.

## Parameter Passing

Parameters allow functions to accept inputs, making them more flexible and reusable.

### Pass by Value

By default, arguments are passed by value, meaning a copy is made.

**Example:**

```cpp
void increment(int num) {
    num += 1; // This change won't affect the original variable
}

int main() {
    int number = 5;
    increment(number);
    std::cout << "Number: " << number << std::endl; // Outputs 5
    return 0;
}
```

### Pass by Reference

Passing by reference allows the function to modify the original variable.

**Syntax:**

```cpp
void function_name(data_type& parameter_name) {
    // Function body
}
```

**Example:**

```cpp
void increment(int& num) {
    num += 1; // This change will affect the original variable
}

int main() {
    int number = 5;
    increment(number);
    std::cout << "Number: " << number << std::endl; // Outputs 6
    return 0;
}
```

### Pass by Pointer

You can also pass arguments by pointer.

**Example:**

```cpp
void increment(int* num) {
    (*num) += 1;
}

int main() {
    int number = 5;
    increment(&number);
    std::cout << "Number: " << number << std::endl; // Outputs 6
    return 0;
}
```

### Choosing Parameter Passing Method

- **Pass by Value:** Use when you don't need to modify the original data.
- **Pass by Reference:** Use when you need to modify the original data or for efficiency with large objects.
- **Pass by Pointer:** Similar to pass by reference but can accept `nullptr` and can be reassigned within the function.

## Return Values

Functions can return values to the caller.

### Returning a Single Value

**Example:**

```cpp
int add(int a, int b) {
    return a + b;
}

int main() {
    int sum = add(5, 3);
    std::cout << "Sum: " << sum << std::endl; // Outputs 8
    return 0;
}
```

### Returning Multiple Values

C++ doesn't support returning multiple values directly, but you can use several techniques:

#### Using References or Pointers

Modify multiple output variables passed by reference or pointer.

**Example:**

```cpp
void getMinMax(int a, int b, int& min, int& max) {
    if (a < b) {
        min = a;
        max = b;
    } else {
        min = b;
        max = a;
    }
}

int main() {
    int min, max;
    getMinMax(10, 20, min, max);
    std::cout << "Min: " << min << ", Max: " << max << std::endl; // Outputs: Min: 10, Max: 20
    return 0;
}
```

#### Using Structures or Classes

Return a struct or class containing multiple values.

**Example:**

```cpp
struct MinMax {
    int min;
    int max;
};

MinMax getMinMax(int a, int b) {
    MinMax result;
    if (a < b) {
        result.min = a;
        result.max = b;
    } else {
        result.min = b;
        result.max = a;
    }
    return result;
}

int main() {
    MinMax result = getMinMax(10, 20);
    std::cout << "Min: " << result.min << ", Max: " << result.max << std::endl; // Outputs: Min: 10, Max: 20
    return 0;
}
```

#### Using `std::pair` or `std::tuple`

Standard library classes `std::pair` and `std::tuple` can be used to return multiple values.

**Using `std::pair`:**

```cpp
#include <iostream>
#include <utility> // For std::pair

std::pair<int, int> getMinMax(int a, int b) {
    if (a < b)
        return std::make_pair(a, b);
    else
        return std::make_pair(b, a);
}

int main() {
    std::pair<int, int> result = getMinMax(10, 20);
    std::cout << "Min: " << result.first << ", Max: " << result.second << std::endl; // Outputs: Min: 10, Max: 20
    return 0;
}
```

Alternatively, with C++17 structured bindings:

```cpp
#include <iostream>
#include <utility> // For std::pair

std::pair<int, int> getMinMax(int a, int b) {
    if (a < b)
        return {a, b};
    else
        return {b, a};
}

int main() {
    auto [min, max] = getMinMax(10, 20); // Structured binding (C++17)
    std::cout << "Min: " << min << ", Max: " << max << std::endl; // Outputs: Min: 10, Max: 20
    return 0;
}
```

**Using `std::tuple`:**

```cpp
#include <iostream>
#include <tuple> // For std::tuple

std::tuple<int, int, int> getStats(int a, int b, int c) {
    int min = std::min({a, b, c});
    int max = std::max({a, b, c});
    int sum = a + b + c;
    return std::make_tuple(min, max, sum);
}

int main() {
    auto [min, max, sum] = getStats(5, 10, 15); // Structured binding (C++17)
    std::cout << "Min: " << min << ", Max: " << max << ", Sum: " << sum << std::endl; // Outputs: Min: 5, Max: 15, Sum: 30
    return 0;
}
```

**Note:** Structured bindings require C++17 or newer. If you are using an older standard, you can access tuple elements using `std::get`.

Example without structured bindings:

```cpp
#include <iostream>
#include <tuple> // For std::tuple

std::tuple<int, int, int> getStats(int a, int b, int c) {
    int min = std::min({a, b, c});
    int max = std::max({a, b, c});
    int sum = a + b + c;
    return std::make_tuple(min, max, sum);
}

int main() {
    std::tuple<int, int, int> result = getStats(5, 10, 15);
    int min = std::get<0>(result);
    int max = std::get<1>(result);
    int sum = std::get<2>(result);
    std::cout << "Min: " << min << ", Max: " << max << ", Sum: " << sum << std::endl; // Outputs: Min: 5, Max: 15, Sum: 30
    return 0;
}
```

## Default Arguments

Functions can have default parameter values, which are used if no argument is provided for that parameter.

**Example:**

```cpp
void display(int a = 0, int b = 0) {
    std::cout << "a: " << a << ", b: " << b << std::endl;
}

int main() {
    display();          // Outputs: a: 0, b: 0
    display(5);         // Outputs: a: 5, b: 0
    display(5, 10);     // Outputs: a: 5, b: 10
    return 0;
}
```

**Rules:**

- Default values must be specified in the function declaration (prototype), not in the definition if they are separate.
- Once a parameter is given a default value, all subsequent parameters must also have default values.

## Function Overloading

C++ allows multiple functions with the same name but different parameter lists (number or types of parameters). This is called function overloading.

**Example:**

```cpp
void print(int i) {
    std::cout << "Integer: " << i << std::endl;
}

void print(double f) {
    std::cout << "Double: " << f << std::endl;
}

void print(const std::string& s) {
    std::cout << "String: " << s << std::endl;
}

int main() {
    print(10);            // Calls print(int)
    print(3.14);          // Calls print(double)
    print("Hello");       // Calls print(const std::string&)
    return 0;
}
```

## Recursive Functions

A function that calls itself is known as a recursive function. Recursion is a powerful tool but should be used with care to avoid infinite loops or stack overflows.

**Example: Factorial Calculation**

```cpp
int factorial(int n) {
    if (n <= 1)
        return 1; // Base case
    else
        return n * factorial(n - 1); // Recursive call
}

int main() {
    int num = 5;
    std::cout << "Factorial of " << num << " is " << factorial(num) << std::endl; // Outputs: Factorial of 5 is 120
    return 0;
}
```

**Note:** Always ensure that there is a base case to terminate recursion.

## Lambda Expressions

Lambda expressions (also known as closures) are anonymous functions that you can define in-place. They are useful for short snippets of code, especially when working with algorithms.

### Syntax

```cpp
[capture_list](parameter_list) -> return_type {
    // Function body
};
```

- **capture_list**: Specifies which variables are captured from the surrounding scope.
- **parameter_list**: Parameters passed to the lambda.
- **return_type**: (Optional) The return type of the lambda (often deduced automatically).

### Examples

#### Basic Lambda

```cpp
auto greet = []() {
    std::cout << "Hello from lambda!" << std::endl;
};

int main() {
    greet(); // Outputs: Hello from lambda!
    return 0;
}
```

#### Lambda with Parameters

```cpp
auto add = [](int a, int b) {
    return a + b;
};

int main() {
    int sum = add(5, 3);
    std::cout << "Sum: " << sum << std::endl; // Outputs: Sum: 8
    return 0;
}
```

#### Capturing Variables

```cpp
int main() {
    int factor = 2;
    auto multiply = [factor](int x) {
        return x * factor;
    };

    int result = multiply(5);
    std::cout << "Result: " << result << std::endl; // Outputs: Result: 10
    return 0;
}
```

- **Capture by Value (`[factor]`)**: Captures a copy of `factor`.
- **Capture by Reference (`[&factor]`)**: Captures `factor` by reference, allowing modification.
- **Capture All by Value (`[=]`)**: Captures all automatic variables (local variables) by value.
- **Capture All by Reference (`[&]`)**: Captures all automatic variables by reference.

#### Modifying Captured Variables

To modify a captured variable in a lambda, you must capture it by reference.

```cpp
int main() {
    int count = 0;
    auto increment = [&count]() {
        count++;
    };

    increment();
    increment();
    std::cout << "Count: " << count << std::endl; // Outputs: Count: 2
    return 0;
}
```

### Lambdas in Algorithms

Lambdas are often used with Standard Template Library (STL) algorithms.

```cpp
#include <algorithm>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 3};

    // Sort in ascending order using a lambda
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {
        return a < b;
    });

    for (int num : numbers) {
        std::cout << num << " "; // Outputs: 1 2 3 5 8
    }

    std::cout << std::endl;
    return 0;
}
```

## Inline Functions

The `inline` keyword suggests to the compiler to insert the function's body where the function call is, potentially reducing the overhead of a function call.

**Syntax:**

```cpp
inline int add(int a, int b) {
    return a + b;
}
```

**Note:** Modern compilers optimize function calls efficiently, so the `inline` keyword is often unnecessary. It is generally used for very small, frequently called functions.

## Practical Example: Calculator with Functions

Let's refactor the calculator example from the previous chapter using functions.

```cpp
#include <iostream>

double add(double a, double b) {
    return a + b;
}

double subtract(double a, double b) {
    return a - b;
}

double multiply(double a, double b) {
    return a * b;
}

double divide(double a, double b) {
    if (b != 0.0)
        return a / b;
    else {
        std::cerr << "Error: Division by zero." << std::endl;
        return 0.0;
    }
}

int main() {
    double num1, num2;
    char operation;
    bool valid = true;

    std::cout << "Enter first number: ";
    std::cin >> num1;

    std::cout << "Enter an operator (+, -, *, /): ";
    std::cin >> operation;

    std::cout << "Enter second number: ";
    std::cin >> num2;

    double result;

    switch (operation) {
        case '+':
            result = add(num1, num2);
            break;
        case '-':
            result = subtract(num1, num2);
            break;
        case '*':
            result = multiply(num1, num2);
            break;
        case '/':
            result = divide(num1, num2);
            break;
        default:
            std::cerr << "Invalid operator." << std::endl;
            valid = false;
    }

    if (valid) {
        std::cout << "Result: " << result << std::endl;
    }

    return 0;
}
```

## Exercises

1. **Temperature Conversion**

   Write functions that convert temperatures between Celsius and Fahrenheit.

   ```cpp
   double toFahrenheit(double celsius);
   double toCelsius(double fahrenheit);
   ```

   **Example Implementation:**

   ```cpp
   double toFahrenheit(double celsius) {
       return (celsius * 9.0 / 5.0) + 32.0;
   }

   double toCelsius(double fahrenheit) {
       return (fahrenheit - 32.0) * 5.0 / 9.0;
   }
   ```

2. **Find Maximum**

   Create a function template `maxValue` that returns the maximum of two values.

   ```cpp
   template <typename T>
   T maxValue(T a, T b) {
       return (a > b) ? a : b;
   }
   ```

   **Example Usage:**

   ```cpp
   int main() {
       std::cout << "Max of 10 and 20 is " << maxValue(10, 20) << std::endl; // Outputs: Max of 10 and 20 is 20
       std::cout << "Max of 3.14 and 2.72 is " << maxValue(3.14, 2.72) << std::endl; // Outputs: Max of 3.14 and 2.72 is 3.14
       return 0;
   }
   ```

3. **Palindrome Check**

   Write a function that checks if a given `std::string` is a palindrome.

   ```cpp
   #include <string>
   #include <algorithm>

   bool isPalindrome(const std::string& str) {
       std::string reversed = str;
       std::reverse(reversed.begin(), reversed.end());
       return str == reversed;
   }

   int main() {
       std::string word = "radar";
       if (isPalindrome(word)) {
           std::cout << word << " is a palindrome." << std::endl;
       } else {
           std::cout << word << " is not a palindrome." << std::endl;
       }
       return 0;
   }
   ```

## Summary

In this chapter, you've learned about:

- **Function Definition and Calls:** How to define and invoke functions.
- **Parameter Passing:** The difference between passing by value, reference, and pointer.
- **Return Values:** Techniques to return single and multiple values from functions.
- **Default Arguments:** How to use default parameter values.
- **Function Overloading:** Using the same function name with different parameter lists.
- **Recursive Functions:** Functions that call themselves.
- **Lambda Expressions:** Creating and using anonymous functions for concise code.

Functions are essential for writing modular, maintainable, and reusable code. Understanding how to effectively use functions will greatly enhance your ability to develop complex applications.

---

Next, we'll explore **Arrays and Strings**, diving into how to manage collections of data in C++.

Next chapter: [Arrays and Strings](/2024/09/26/cpp-unleash/02h-arystr)
