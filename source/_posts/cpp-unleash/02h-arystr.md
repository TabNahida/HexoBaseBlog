---
title: "C++ Unleashed: Arrays and Strings"
date: 2024-09-26 15:41:06
tags:
    - C/C++
    - Modern C++
    - C++ Unleashed
    - Zero to Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Functions](/2024/09/26/cpp-unleash/02h-func)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Arrays and Strings

Arrays and strings are fundamental data structures in C++ that allow you to store and manipulate collections of data. Understanding how to work with them is crucial for effective programming.

In this chapter, we'll cover:

- **Arrays**
  - C-Style Arrays
    - Declaration and Initialization
    - Accessing Elements
    - Multidimensional Arrays
    - Arrays and Functions
    - Limitations of C-Style Arrays
  - **`std::array`**
    - Introduction
    - Declaration and Initialization
    - Accessing Elements
    - Iterating Over `std::array`
    - Passing `std::array` to Functions
- **C-Style Strings**
  - Character Arrays
  - Common Functions
- **The `std::string` Class**
  - Basic Usage
  - String Operations
  - Converting Between Strings and Numbers

<!--more-->

## Arrays

An array is a collection of elements of the same data type stored in contiguous memory locations. Arrays provide a way to store multiple values under a single variable name.

### C-Style Arrays

#### Declaration and Initialization

**Syntax:**

```cpp
data_type array_name[array_size];
```

- **data_type**: The type of elements the array will hold.
- **array_name**: The name of the array.
- **array_size**: The number of elements in the array.

**Examples:**

**Declaration without Initialization:**

```cpp
int numbers[5]; // An array of 5 integers
```

**Declaration with Initialization:**

```cpp
int numbers[5] = {1, 2, 3, 4, 5};
```

**Omitting the Size:**

```cpp
int numbers[] = {1, 2, 3, 4, 5}; // Size deduced from the number of elements
```

**Partial Initialization:**

```cpp
int numbers[5] = {1, 2}; // Remaining elements initialized to 0
```

#### Accessing Elements

Array elements are accessed using zero-based indexing.

**Syntax:**

```cpp
array_name[index];
```

- **index**: An integer representing the position of the element (starting from 0).

**Example:**

```cpp
#include <iostream>

int main() {
    int numbers[] = {10, 20, 30, 40, 50};

    std::cout << "First element: " << numbers[0] << std::endl; // Outputs 10
    std::cout << "Third element: " << numbers[2] << std::endl; // Outputs 30

    // Modifying an element
    numbers[1] = 25;
    std::cout << "Modified second element: " << numbers[1] << std::endl; // Outputs 25

    return 0;
}
```

#### Iterating Over Arrays

You can use loops to iterate over array elements.

**Using a `for` Loop:**

```cpp
int numbers[] = {10, 20, 30, 40, 50};
int size = sizeof(numbers) / sizeof(numbers[0]);

for (int i = 0; i < size; ++i) {
    std::cout << "Element at index " << i << ": " << numbers[i] << std::endl;
}
```

**Using a Range-Based `for` Loop (C++11 and later):**

C-style arrays can be iterated over using range-based for loops.

```cpp
for (int num : numbers) {
    std::cout << "Element: " << num << std::endl;
}
```

#### Multidimensional Arrays

Arrays can have more than one dimension, such as two-dimensional arrays (matrices).

##### Declaration

```cpp
data_type array_name[size1][size2];
```

**Example:**

```cpp
int matrix[3][4]; // 3 rows and 4 columns
```

##### Initialization

```cpp
int matrix[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
```

##### Accessing Elements

```cpp
int value = matrix[1][2]; // Accesses element in second row, third column
```

##### Iterating Over Multidimensional Arrays

```cpp
for (int i = 0; i < 2; ++i) {
    for (int j = 0; j < 3; ++j) {
        std::cout << "Element at [" << i << "][" << j << "]: " << matrix[i][j] << std::endl;
    }
}
```

#### Arrays and Functions

##### Passing Arrays to Functions

You can pass arrays to functions by specifying the array parameter.

**Example:**

```cpp
void printArray(int arr[], int size) {
    for (int i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);

    printArray(numbers, size);

    return 0;
}
```

##### Returning Arrays from Functions

C++ does not allow returning arrays directly from functions, but you can return pointers or use `std::array` or `std::vector` (covered later) for safer alternatives.

#### Limitations of C-Style Arrays

- **Fixed Size:** The size of C-style arrays must be known at compile-time (unless using dynamic allocation).
- **No Bounds Checking:** Accessing out-of-bounds elements leads to undefined behavior.
- **Limited Functionality:** Lacks built-in methods for common operations.
- **Cannot Be Copied or Assigned Easily:** Assigning one array to another is not straightforward.

**Note:** Due to these limitations, it's recommended to use `std::array` or `std::vector` from the Standard Library for safer and more flexible array usage.

### `std::array`

The `std::array` class template (defined in the `<array>` header) provides a fixed-size array with additional functionalities and safety compared to C-style arrays. It is a container that encapsulates fixed-size arrays.

#### Introduction

- **Fixed Size:** The size is fixed at compile-time.
- **Type Safe:** Strongly typed and supports member functions.
- **Standard Library Integration:** Works well with other Standard Library components.

#### Declaration and Initialization

**Syntax:**

```cpp
std::array<data_type, array_size> array_name;
```

- **data_type:** The type of elements the array will hold.
- **array_size:** The number of elements in the array.

**Examples:**

**Declaration without Initialization:**

```cpp
#include <array>

std::array<int, 5> numbers;
```

**Declaration with Initialization:**

```cpp
std::array<int, 5> numbers = {1, 2, 3, 4, 5};
```

**Using Uniform Initialization (C++11 and later):**

```cpp
std::array<int, 5> numbers{1, 2, 3, 4, 5};
```

#### Accessing Elements

Elements can be accessed similarly to C-style arrays using the subscript operator `[]`.

**Example:**

```cpp
#include <iostream>
#include <array>

int main() {
    std::array<int, 5> numbers = {10, 20, 30, 40, 50};

    std::cout << "First element: " << numbers[0] << std::endl; // Outputs 10
    std::cout << "Third element: " << numbers[2] << std::endl; // Outputs 30

    // Modifying an element
    numbers[1] = 25;
    std::cout << "Modified second element: " << numbers[1] << std::endl; // Outputs 25

    return 0;
}
```

#### Bounds Checking with `at()`

Unlike C-style arrays, `std::array` provides the `at()` member function that performs bounds checking and throws an exception if the index is out of range.

**Example:**

```cpp
try {
    int value = numbers.at(10); // Throws std::out_of_range
} catch (const std::out_of_range& e) {
    std::cerr << "Out of range error: " << e.what() << std::endl;
}
```

#### Accessing Size

Use the `size()` member function to get the number of elements.

```cpp
size_t size = numbers.size(); // Returns 5
```

#### Iterating Over `std::array`

**Using a Range-Based `for` Loop:**

```cpp
for (int num : numbers) {
    std::cout << "Element: " << num << std::endl;
}
```

**Using Iterators:**

```cpp
for (auto it = numbers.begin(); it != numbers.end(); ++it) {
    std::cout << "Element: " << *it << std::endl;
}
```

#### Passing `std::array` to Functions

When passing `std::array` to functions, you can pass it by reference or value.

**Example:**

```cpp
void printArray(const std::array<int, 5>& arr) {
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::array<int, 5> numbers = {1, 2, 3, 4, 5};
    printArray(numbers);
    return 0;
}
```

#### Multidimensional `std::array`

You can create multidimensional arrays by nesting `std::array`.

**Example:**

```cpp
std::array<std::array<int, 3>, 2> matrix = {{
    {1, 2, 3},
    {4, 5, 6}
}};
```

**Accessing Elements:**

```cpp
int value = matrix[1][2]; // Accesses element in second row, third column
```

## C-Style Strings

C-style strings are arrays of characters terminated by a null character `'\0'`.

### Character Arrays

#### Declaration and Initialization

```cpp
char greeting[] = "Hello";
```

- The array `greeting` has 6 elements: `'H'`, `'e'`, `'l'`, `'l'`, `'o'`, `'\0'`.

#### Accessing Characters

```cpp
char firstChar = greeting[0]; // 'H'
```

### Common Functions

Functions for handling C-style strings are in the `<cstring>` header.

#### `strlen`

Returns the length of the string (excluding the null terminator).

```cpp
#include <cstring>

size_t length = std::strlen(greeting); // Returns 5
```

#### `strcpy`

Copies one string to another.

```cpp
char source[] = "World";
char destination[10];

std::strcpy(destination, source); // destination now contains "World"
```

#### `strcat`

Concatenates two strings.

```cpp
char s1[20] = "Hello ";
char s2[] = "World";

std::strcat(s1, s2); // s1 now contains "Hello World"
```

#### `strcmp`

Compares two strings.

```cpp
if (std::strcmp(s1, s2) == 0) {
    std::cout << "Strings are equal." << std::endl;
}
```

**Warning:** Be cautious with buffer sizes to avoid overruns. Prefer using safer alternatives like `strncpy`, `strncat`, or better yet, `std::string`.

## The `std::string` Class

The `std::string` class (from the `<string>` header) provides a safer and more convenient way to work with strings.

### Basic Usage

#### Declaration and Initialization

```cpp
#include <string>

std::string greeting = "Hello";
```

#### Input and Output

```cpp
std::string name;

std::cout << "Enter your name: ";
std::cin >> name; // Reads input until the first whitespace

std::cout << "Hello, " << name << "!" << std::endl;
```

**Reading Full Lines:**

```cpp
std::string line;

std::cout << "Enter a line: ";
std::getline(std::cin, line);

std::cout << "You entered: " << line << std::endl;
```

### String Operations

#### Concatenation

```cpp
std::string s1 = "Hello";
std::string s2 = "World";
std::string s3 = s1 + " " + s2; // "Hello World"
```

#### Length

```cpp
size_t length = s1.length(); // or s1.size()
```

#### Accessing Characters

```cpp
char firstChar = s1[0]; // 'H'
s1[0] = 'h';            // s1 is now "hello"
```

#### Substrings

```cpp
std::string s = "Hello World";
std::string sub = s.substr(6, 5); // "World"
```

#### Insertion and Erasure

```cpp
s.insert(5, ",");      // "Hello, World"
s.erase(5, 1);         // "Hello World"
```

#### Finding Substrings

```cpp
size_t pos = s.find("World"); // Returns index where "World" starts
```

#### Comparison

```cpp
if (s1 == s2) {
    std::cout << "Strings are equal." << std::endl;
}
```

### Converting Between Strings and Numbers

#### String to Number

- **`std::stoi`**: Convert string to `int`.
- **`std::stod`**: Convert string to `double`.

```cpp
#include <string>

std::string s = "123";
int num = std::stoi(s); // num = 123
```

#### Number to String

- **`std::to_string`**: Convert number to string.

```cpp
int num = 456;
std::string s = std::to_string(num); // s = "456"
```

**Example:**

```cpp
double pi = 3.14159;
std::string s = "The value of pi is " + std::to_string(pi);
```

## Practical Example: Word Counter

Let's create a program that counts the number of words in a sentence entered by the user.

```cpp
#include <iostream>
#include <string>
#include <sstream>

int main() {
    std::string sentence;
    
    std::cout << "Enter a sentence: ";
    std::getline(std::cin, sentence);

    std::istringstream stream(sentence);
    std::string word;
    int wordCount = 0;

    while (stream >> word) {
        ++wordCount;
    }

    std::cout << "Number of words: " << wordCount << std::endl;

    return 0;
}
```

**Explanation:**

- **`std::getline`**: Reads the full line entered by the user.
- **`std::istringstream`**: Allows us to treat the string as a stream to extract words.
- **`stream >> word`**: Extracts words separated by whitespace.

## Exercises

1. **Array Sum with `std::array`**

   Rewrite the array sum program using `std::array`.

   **Solution:**

   ```cpp
   #include <iostream>
   #include <array>

   int main() {
       std::array<int, 5> numbers = {5, 10, 15, 20, 25};
       int sum = 0;

       for (int num : numbers) {
           sum += num;
       }

       double average = static_cast<double>(sum) / numbers.size();

       std::cout << "Sum: " << sum << std::endl;
       std::cout << "Average: " << average << std::endl;

       return 0;
   }
   ```

2. **Matrix Addition with `std::array`**

   Create a program that adds two 2x2 matrices using `std::array` and displays the result.

   **Solution:**

   ```cpp
   #include <iostream>
   #include <array>

   int main() {
       std::array<std::array<int, 2>, 2> matrix1 = {{{1, 2}, {3, 4}}};
       std::array<std::array<int, 2>, 2> matrix2 = {{{5, 6}, {7, 8}}};
       std::array<std::array<int, 2>, 2> result;

       for (size_t i = 0; i < matrix1.size(); ++i) {
           for (size_t j = 0; j < matrix1[i].size(); ++j) {
               result[i][j] = matrix1[i][j] + matrix2[i][j];
           }
       }

       std::cout << "Resultant Matrix:" << std::endl;
       for (const auto& row : result) {
           for (int elem : row) {
               std::cout << elem << " ";
           }
           std::cout << std::endl;
       }

       return 0;
   }
   ```

3. **String Reversal**

   Write a function that reverses a `std::string`.

   **Solution:**

   ```cpp
   #include <iostream>
   #include <string>
   #include <algorithm>

   std::string reverseString(const std::string& str) {
       std::string reversed = str;
       std::reverse(reversed.begin(), reversed.end());
       return reversed;
   }

   int main() {
       std::string original = "Hello World";
       std::string reversed = reverseString(original);

       std::cout << "Original: " << original << std::endl;
       std::cout << "Reversed: " << reversed << std::endl;

       return 0;
   }
   ```

4. **Palindromic Strings**

   Modify the palindrome check function from the previous chapter to ignore case and spaces.

   **Solution:**

   ```cpp
   #include <iostream>
   #include <string>
   #include <algorithm>
   #include <cctype>

   bool isPalindrome(const std::string& str) {
       std::string filtered;

       // Remove non-alphanumeric characters and convert to lowercase
       for (char ch : str) {
           if (std::isalnum(static_cast<unsigned char>(ch))) {
               filtered += std::tolower(static_cast<unsigned char>(ch));
           }
       }

       std::string reversed = filtered;
       std::reverse(reversed.begin(), reversed.end());

       return filtered == reversed;
   }

   int main() {
       std::string text = "A man, a plan, a canal, Panama";
       if (isPalindrome(text)) {
           std::cout << "\"" << text << "\" is a palindrome." << std::endl;
       } else {
           std::cout << "\"" << text << "\" is not a palindrome." << std::endl;
       }

       return 0;
   }
   ```

## Summary

In this chapter, you've learned about:

- **Arrays:**
  - **C-Style Arrays:** How to declare, initialize, and use single and multidimensional arrays.
  - **Limitations of C-Style Arrays:** Fixed size, lack of bounds checking, and limited functionality.
- **`std::array`:** A safer and more functional alternative to C-style arrays for fixed-size collections.
- **C-Style Strings:** Working with character arrays and common string functions.
- **`std::string`:** Utilizing the string class for safer and more efficient string manipulation.
- **String and Array Operations:** Common techniques for processing and manipulating arrays and strings.

Understanding arrays and strings is essential for handling collections of data and text processing in your programs. They are foundational concepts that will recur throughout your programming journey.

---

In the next chapter, we'll delve into **Pointers and References**, exploring more advanced ways to manage memory and data in C++.

Next chapter: [Pointers and References](/2024/09/26/cpp-unleash/02h-ptrref)