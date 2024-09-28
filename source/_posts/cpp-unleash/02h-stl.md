---
title: "C++ Unleashed: Standard Template Library (STL)"
date: 2024-09-27 01:27:48
tags:
    - C/C++
    - Modern C++
    - C++ Unleashed
    - Zero to Hero
categories: Tutorial
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Modern C++ Features](/2024/09/27/cpp-unleash/02h-mdncppftr)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Standard Template Library (STL)

The Standard Template Library (STL) is a powerful feature of C++ that provides a collection of template classes and functions for managing data. It includes a wide range of data structures (containers), algorithms, and iterators that allow for efficient data manipulation and storage. In this chapter, we will explore the key components of the STL.

In this chapter, we will cover:

- Containers
  - Sequence Containers
  - Associative Containers
  - Unordered Containers
  - Container Adaptors
- Iterators
- Algorithms
- Function Objects (Functors)

<!--more-->

## Containers

Containers are data structures that store objects and provide member functions to manipulate them. The STL provides several types of containers, each designed for specific use cases.

### Sequence Containers

Sequence containers maintain the order of elements. The primary sequence containers are:

- **`std::vector`**
- **`std::deque`**
- **`std::list`**

#### `std::vector`

A dynamic array that can resize itself. It provides fast random access to elements.

**Example:**

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    numbers.push_back(6); // Adding an element
    numbers.pop_back();   // Removing the last element

    for (const auto& num : numbers) {
        std::cout << num << " "; // Outputs: 1 2 3 4 5
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::deque`

A double-ended queue that allows fast insertion and deletion at both ends.

**Example:**

```cpp
#include <iostream>
#include <deque>

int main() {
    std::deque<int> d = {1, 2, 3};

    d.push_front(0); // Add to the front
    d.push_back(4);  // Add to the back

    for (const auto& num : d) {
        std::cout << num << " "; // Outputs: 0 1 2 3 4
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::list`

A doubly linked list that allows fast insertion and deletion from any position.

**Example:**

```cpp
#include <iostream>
#include <list>

int main() {
    std::list<int> l = {1, 2, 3};

    l.push_back(4); // Add to the back
    l.push_front(0); // Add to the front

    for (const auto& num : l) {
        std::cout << num << " "; // Outputs: 0 1 2 3 4
    }
    std::cout << std::endl;

    return 0;
}
```

### Associative Containers

Associative containers store elements in a way that allows for fast retrieval based on keys. The primary associative containers are:

- **`std::set`**
- **`std::map`**
- **`std::multiset`**
- **`std::multimap`**

#### `std::set`

A collection of unique elements stored in a specific order.

**Example:**

```cpp
#include <iostream>
#include <set>

int main() {
    std::set<int> s = {3, 1, 4, 2};

    s.insert(5); // Adding an element
    s.erase(2);  // Removing an element

    for (const auto& num : s) {
        std::cout << num << " "; // Outputs: 1 3 4 5
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::map`

A collection of key-value pairs, where keys are unique and stored in a specific order.

**Example:**

```cpp
#include <iostream>
#include <map>

int main() {
    std::map<std::string, int> age;
    age["Alice"] = 30;
    age["Bob"] = 25;

    for (const auto& [name, ageValue] : age) {
        std::cout << name << ": " << ageValue << std::endl; // Outputs: Alice: 30, Bob: 25
    }

    return 0;
}
```

### Unordered Containers

Unordered containers allow for fast retrieval but do not maintain any particular order. The primary unordered containers are:

- **`std::unordered_set`**
- **`std::unordered_map`**

#### `std::unordered_set`

A collection of unique elements with no specific order.

**Example:**

```cpp
#include <iostream>
#include <unordered_set>

int main() {
    std::unordered_set<int> us = {1, 2, 3};

    us.insert(4); // Adding an element
    us.erase(1);  // Removing an element

    for (const auto& num : us) {
        std::cout << num << " "; // Outputs: 2 3 4 (order may vary)
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::unordered_map`

A collection of key-value pairs with no specific order.

**Example:**

```cpp
#include <iostream>
#include <unordered_map>

int main() {
    std::unordered_map<std::string, int> um;
    um["Alice"] = 30;
    um["Bob"] = 25;

    for (const auto& [name, ageValue] : um) {
        std::cout << name << ": " << ageValue << std::endl; // Outputs: Alice: 30, Bob: 25 (order may vary)
    }

    return 0;
}
```

### Container Adaptors

Container adaptors provide a different interface for existing containers. The primary adaptors are:

- **`std::stack`**
- **`std::queue`**
- **`std::priority_queue`**

#### `std::stack`

A last-in-first-out (LIFO) data structure.

**Example:**

```cpp
#include <iostream>
#include <stack>

int main() {
    std::stack<int> s;

    s.push(1);
    s.push(2);
    s.push(3);

    while (!s.empty()) {
        std::cout << s.top() << " "; // Outputs: 3 2 1
        s.pop();
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::queue`

A first-in-first-out (FIFO) data structure.

**Example:**

```cpp
#include <iostream>
#include <queue>

int main() {
    std::queue<int> q;

    q.push(1);
    q.push(2);
    q.push(3);

    while (!q.empty()) {
        std::cout << q.front() << " "; // Outputs: 1 2 3
        q.pop();
    }
    std::cout << std::endl;

    return 0;
}
```

#### `std::priority_queue`

A queue where the highest priority elements are served before others.

**Example:**

```cpp
#include <iostream>
#include <queue>

int main() {
    std::priority_queue<int> pq;

    pq.push(3);
    pq.push(5);
    pq.push(1);

    while (!pq.empty()) {
        std::cout << pq.top() << " "; // Outputs: 5 3 1 (highest priority first)
        pq.pop();
    }
    std::cout << std::endl;

    return 0;
}
```

## Iterators

Iterators are used to traverse the elements of a container. They provide a uniform interface to access the elements in different types of containers.

### Types of Iterators

- **Input Iterators**: Can read data in a single-pass.
- **Output Iterators**: Can write data in a single-pass.
- **Forward Iterators**: Can read/write data and can be used in multiple passes.
- **Bidirectional Iterators**: Can move in both directions.
- **Random Access Iterators**: Can access elements with arbitrary index.

### Example:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // Using an iterator to traverse the vector
    for (auto it = numbers.begin(); it != numbers.end(); ++it) {
        std::cout << *it << " "; // Outputs: 1 2 3 4 5
    }
    std::cout << std::endl;

    return 0;
}
```

## Algorithms

STL provides a rich set of algorithms for operations like searching, sorting, and manipulating data. Common algorithms include:

- **Sorting**: `std::sort`
- **Searching**: `std::find`, `std::binary_search`
- **Transforming**: `std::transform`
- **Manipulating**: `std::for_each`, `std::count_if`

### Example: Sorting and Searching

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 3, 1, 4, 2};

    // Sorting the vector
    std::sort(numbers.begin(), numbers.end());

    // Searching for an element
    if (std::find(numbers.begin(), numbers.end(), 3) != numbers.end()) {
        std::cout << "3 is found in the vector." << std::endl

;
    }

    for (const auto& num : numbers) {
        std::cout << num << " "; // Outputs: 1 2 3 4 5
    }
    std::cout << std::endl;

    return 0;
}
```

## Function Objects (Functors)

Function objects, or functors, are objects that can be called as if they were functions. They can store state and be passed to algorithms as parameters.

### Example:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

class GreaterThan {
public:
    GreaterThan(int value) : value_(value) {}

    bool operator()(int num) const {
        return num > value_;
    }

private:
    int value_;
};

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    int count = std::count_if(numbers.begin(), numbers.end(), GreaterThan(2));
    std::cout << "Count of numbers greater than 2: " << count << std::endl; // Outputs: 3

    return 0;
}
```

## Summary

In this chapter, you learned about the Standard Template Library (STL), which provides a wealth of powerful tools for managing data in C++. We covered:

- **Containers**: Different types of data structures for storing elements, including sequence, associative, unordered containers, and container adaptors.
- **Iterators**: A uniform interface for traversing containers.
- **Algorithms**: A rich set of functions for manipulating data.
- **Function Objects (Functors)**: Objects that can be called as functions, allowing for more flexible programming.

In the next chapter, we will explore **Error Handling and Exceptions**, where you will learn how to manage errors gracefully in your C++ programs.

Next chapter: [Exception Handling](/2024/09/27/cpp-unleash/02h-excpt)