---
title: "C++ Unleashed: Pointers and References"
date: 2024-09-26 16:08:11
tags:
    - c-cpp
    - modern-cpp
    - cpp-unleash
    - 02Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Arrays and Strings](/2024/09/26/cpp-unleash/02h-arystr)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Pointers and References

Pointers and references are fundamental concepts in C++ that provide powerful ways to manipulate memory and data. They are essential for understanding how variables are stored and accessed, enabling efficient programming techniques such as dynamic memory allocation, passing large objects without copying, and implementing data structures like linked lists and trees.

In this chapter, we'll cover:

- Basics of Pointers
  - Pointer Declaration and Initialization
  - Dereferencing and Pointer Arithmetic
  - Null Pointers
- References and Their Uses
  - Reference Declaration and Initialization
  - Differences Between Pointers and References
- Dynamic Memory Allocation
  - `new` and `delete`
  - Arrays and Dynamic Allocation
- Smart Pointers (`unique_ptr`, `shared_ptr`, `weak_ptr`)
  - Introduction to Smart Pointers
  - Using `std::unique_ptr`
  - Using `std::shared_ptr` and `std::weak_ptr`
- Practical Examples
  - Swapping Variables Using Pointers and References
  - Implementing a Simple Dynamic Array

<!--more-->

## Basics of Pointers

A **pointer** is a variable that holds the memory address of another variable. Pointers provide direct access to memory and allow for powerful programming techniques.

### Pointer Declaration and Initialization

#### Syntax

```cpp
data_type* pointer_name;
```

- **data_type**: The type of the variable the pointer will point to.
- **pointer_name**: The name of the pointer variable.

#### Examples

**Declaration without Initialization:**

```cpp
int* ptr; // Pointer to an integer
```

**Declaration with Initialization:**

```cpp
int value = 42;
int* ptr = &value; // ptr holds the address of value
```

- The `&` operator is the **address-of** operator, which gives the memory address of a variable.

### Dereferencing Pointers

The **dereference** operator `*` is used to access or modify the value at the memory address the pointer points to.

**Example:**

```cpp
int value = 42;
int* ptr = &value;

std::cout << "Value: " << value << std::endl;       // Outputs 42
std::cout << "Pointer Address: " << ptr << std::endl; // Outputs the memory address
std::cout << "Dereferenced Value: " << *ptr << std::endl; // Outputs 42

// Modifying the value via the pointer
*ptr = 100;
std::cout << "Modified Value: " << value << std::endl; // Outputs 100
```

### Pointer Arithmetic

Pointers can be incremented or decremented to traverse arrays.

**Example:**

```cpp
int arr[] = {10, 20, 30, 40, 50};
int* ptr = arr; // Points to the first element

for (int i = 0; i < 5; ++i) {
    std::cout << "Element " << i << ": " << *(ptr + i) << std::endl;
}
```

- When you add `i` to a pointer, it moves `i` elements forward, considering the size of the data type it points to.

### Null Pointers

A null pointer is a pointer that doesn't point to any valid memory address.

#### Declaration

```cpp
int* ptr = nullptr; // C++11 and later
```

- `nullptr` is a keyword introduced in C++11 to represent a null pointer.

**Pre-C++11:**

```cpp
int* ptr = 0;
int* ptr = NULL; // Requires including <cstddef>
```

#### Checking for Null Pointers

Always check if a pointer is null before dereferencing to avoid undefined behavior.

```cpp
if (ptr != nullptr) {
    // Safe to dereference ptr
}
```

## References and Their Uses

A **reference** is an alias for another variable. Once a reference is initialized to a variable, it cannot be changed to refer to another variable.

### Reference Declaration and Initialization

#### Syntax

```cpp
data_type& reference_name = variable_name;
```

- **data_type**: The type of the variable.
- **reference_name**: The name of the reference.
- **variable_name**: The variable being referenced.

#### Example

```cpp
int value = 42;
int& ref = value; // ref is a reference to value

std::cout << "Value: " << value << std::endl; // Outputs 42
std::cout << "Reference: " << ref << std::endl; // Outputs 42

// Modifying the value via the reference
ref = 100;
std::cout << "Modified Value: " << value << std::endl; // Outputs 100
```

### References as Function Parameters

References are commonly used to pass variables to functions without copying.

**Example:**

```cpp
void increment(int& num) {
    num += 1;
}

int main() {
    int number = 5;
    increment(number);
    std::cout << "Number: " << number << std::endl; // Outputs 6
    return 0;
}
```

### Differences Between Pointers and References

- **Nullability:**
  - Pointers can be null; references must be bound to a valid object upon initialization.
- **Reassignment:**
  - Pointers can be reassigned to point to different objects; references cannot be reseated.
- **Syntax:**
  - Accessing the value pointed to by a pointer requires dereferencing (`*ptr`); references can be used directly as the variable.
- **Memory Address:**
  - A pointer holds a memory address; a reference is an alias for an existing variable.

**Example of Pointer Reassignment:**

```cpp
int a = 10;
int b = 20;
int* ptr = &a;
ptr = &b; // Now ptr points to b
```

**References Cannot Be Reassigned:**

```cpp
int a = 10;
int b = 20;
int& ref = a;
// ref = &b; // Error: Cannot rebind a reference
ref = b; // Assigns the value of b to a
```

## Dynamic Memory Allocation

Dynamic memory allocation allows you to allocate memory at runtime, which is essential when the size of data structures cannot be determined at compile-time.

### `new` and `delete`

- **`new` Operator:** Allocates memory on the heap and returns a pointer to it.
- **`delete` Operator:** Deallocates memory previously allocated with `new`.

#### Allocating and Deallocating Single Variables

**Allocation:**

```cpp
int* ptr = new int;       // Allocates an integer
*ptr = 42;

int* ptrWithValue = new int(42); // Allocates and initializes an integer
```

**Deallocation:**

```cpp
delete ptr;
```

#### Allocating and Deallocating Arrays

**Allocation:**

```cpp
int* arr = new int[5]; // Allocates an array of 5 integers
```

**Deallocation:**

```cpp
delete[] arr;
```

- **Important:** Use `delete[]` when deallocating memory allocated with `new[]`.

#### Example

```cpp
int main() {
    int* numbers = new int[5];
    for (int i = 0; i < 5; ++i) {
        numbers[i] = i * 10;
    }

    for (int i = 0; i < 5; ++i) {
        std::cout << numbers[i] << " ";
    }
    std::cout << std::endl;

    delete[] numbers; // Free the allocated memory
    return 0;
}
```

### Memory Leaks

Failing to deallocate memory with `delete` or `delete[]` leads to memory leaks, which can exhaust system memory over time.

**Example of Memory Leak:**

```cpp
void leakMemory() {
    int* ptr = new int(42);
    // Forgot to delete ptr
}
```

## Smart Pointers

Manual memory management with `new` and `delete` is error-prone. C++ provides smart pointers in the `<memory>` header to automate memory management.

### Introduction to Smart Pointers

Smart pointers are classes that behave like pointers but manage the memory automatically.

- **`std::unique_ptr`:** Owns an object exclusively.
- **`std::shared_ptr`:** Allows multiple pointers to share ownership of an object.
- **`std::weak_ptr`:** Holds a non-owning reference to an object managed by `std::shared_ptr`.

### Using `std::unique_ptr`

- Defined in `<memory>`.
- Cannot be copied, only moved.
- Automatically deletes the object when it goes out of scope.

#### Syntax

```cpp
std::unique_ptr<data_type> ptr(new data_type);
```

**Example:**

```cpp
#include <iostream>
#include <memory>

int main() {
    std::unique_ptr<int> ptr(new int(42));
    std::cout << "Value: " << *ptr << std::endl;

    // No need to delete; ptr will automatically clean up
    return 0;
}
```

**Prefer `make_unique` (C++14 and later):**

```cpp
auto ptr = std::make_unique<int>(42);
```

#### Transferring Ownership

```cpp
std::unique_ptr<int> ptr1 = std::make_unique<int>(42);
std::unique_ptr<int> ptr2 = std::move(ptr1); // ptr1 is now null
```

### Using `std::shared_ptr` and `std::weak_ptr`

#### `std::shared_ptr`

- Allows multiple pointers to own the same object.
- The object is deleted when the last `std::shared_ptr` owning it is destroyed.

**Example:**

```cpp
#include <iostream>
#include <memory>

int main() {
    std::shared_ptr<int> ptr1 = std::make_shared<int>(42);
    {
        std::shared_ptr<int> ptr2 = ptr1;
        std::cout << "Use count inside block: " << ptr1.use_count() << std::endl; // Outputs 2
    }
    std::cout << "Use count after block: " << ptr1.use_count() << std::endl; // Outputs 1

    // Object is deleted when use_count reaches zero
    return 0;
}
```

#### `std::weak_ptr`

- Provides a weak reference to an object managed by `std::shared_ptr`.
- Does not contribute to the reference count.
- Must be converted to `std::shared_ptr` to access the object.

**Example:**

```cpp
#include <iostream>
#include <memory>

int main() {
    std::shared_ptr<int> sharedPtr = std::make_shared<int>(42);
    std::weak_ptr<int> weakPtr = sharedPtr;

    if (auto lockedPtr = weakPtr.lock()) {
        std::cout << "Value: " << *lockedPtr << std::endl;
    } else {
        std::cout << "Object has been destroyed." << std::endl;
    }

    return 0;
}
```

**Use Case:** Avoiding cyclic references in data structures.

## Practical Examples

### Swapping Variables Using Pointers and References

#### Using Pointers

```cpp
void swap(int* a, int* b) {
    if (a && b) { // Check for null pointers
        int temp = *a;
        *a = *b;
        *b = temp;
    }
}

int main() {
    int x = 10;
    int y = 20;
    swap(&x, &y);
    std::cout << "x: " << x << ", y: " << y << std::endl; // Outputs x: 20, y: 10
    return 0;
}
```

#### Using References

```cpp
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10;
    int y = 20;
    swap(x, y);
    std::cout << "x: " << x << ", y: " << y << std::endl; // Outputs x: 20, y: 10
    return 0;
}
```

### Implementing a Simple Dynamic Array

Let's create a simple dynamic array class that manages its own memory.

```cpp
#include <iostream>

class DynamicArray {
private:
    int* data;
    size_t size;

public:
    DynamicArray(size_t size) : size(size) {
        data = new int[size];
    }

    ~DynamicArray() {
        delete[] data;
    }

    int& operator[](size_t index) {
        if (index >= size) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }

    size_t getSize() const {
        return size;
    }
};

int main() {
    DynamicArray arr(5);

    for (size_t i = 0; i < arr.getSize(); ++i) {
        arr[i] = static_cast<int>(i * 10);
    }

    for (size_t i = 0; i < arr.getSize(); ++i) {
        std::cout << "Element " << i << ": " << arr[i] << std::endl;
    }

    return 0;
}
```

**Explanation:**

- **Constructor:** Allocates memory for the array.
- **Destructor:** Deallocates memory to prevent memory leaks.
- **Operator Overloading (`operator[]`):** Allows array-style access with bounds checking.
- **Exception Handling:** Throws an exception if the index is out of range.

## Exercises

1. **Pointer Basics**

   Write a program that declares an integer variable, a pointer to it, and uses the pointer to modify the variable's value.

   **Solution:**

   ```cpp
   #include <iostream>

   int main() {
       int value = 10;
       int* ptr = &value;

       std::cout << "Original Value: " << value << std::endl;

       *ptr = 20;

       std::cout << "Modified Value: " << value << std::endl;

       return 0;
   }
   ```

2. **Dynamic Memory Allocation**

   Create a program that allocates memory for an array of integers at runtime, fills it with values, and then deallocates the memory.

   **Solution:**

   ```cpp
   #include <iostream>

   int main() {
       size_t size;

       std::cout << "Enter the size of the array: ";
       std::cin >> size;

       int* arr = new int[size];

       for (size_t i = 0; i < size; ++i) {
           arr[i] = static_cast<int>(i * i);
       }

       std::cout << "Array Elements:" << std::endl;
       for (size_t i = 0; i < size; ++i) {
           std::cout << arr[i] << " ";
       }
       std::cout << std::endl;

       delete[] arr;

       return 0;
   }
   ```

3. **Using Smart Pointers**

   Modify the previous program to use `std::unique_ptr` instead of raw pointers.

   **Solution:**

   ```cpp
   #include <iostream>
   #include <memory>

   int main() {
       size_t size;

       std::cout << "Enter the size of the array: ";
       std::cin >> size;

       std::unique_ptr<int[]> arr(new int[size]);

       for (size_t i = 0; i < size; ++i) {
           arr[i] = static_cast<int>(i * i);
       }

       std::cout << "Array Elements:" << std::endl;
       for (size_t i = 0; i < size; ++i) {
           std::cout << arr[i] << " ";
       }
       std::cout << std::endl;

       // Memory is automatically deallocated

       return 0;
   }
   ```

4. **Reference Parameters**

   Write a function that calculates the area and perimeter of a rectangle and returns the results via reference parameters.

   **Solution:**

   ```cpp
   #include <iostream>

   void calculateRectangle(double width, double height, double& area, double& perimeter) {
       area = width * height;
       perimeter = 2 * (width + height);
   }

   int main() {
       double width = 5.0;
       double height = 3.0;
       double area, perimeter;

       calculateRectangle(width, height, area, perimeter);

       std::cout << "Area: " << area << std::endl;
       std::cout << "Perimeter: " << perimeter << std::endl;

       return 0;
   }
   ```

## Summary

In this chapter, you've learned about:

- **Pointers:**
  - How to declare and initialize pointers.
  - Dereferencing pointers and pointer arithmetic.
  - Handling null pointers and avoiding undefined behavior.
- **References:**
  - Declaring references and using them to alias variables.
  - Differences between pointers and references.
- **Dynamic Memory Allocation:**
  - Using `new` and `delete` to manage memory at runtime.
  - Allocating and deallocating arrays dynamically.
  - Avoiding memory leaks through proper deallocation.
- **Smart Pointers:**
  - Introduction to `std::unique_ptr`, `std::shared_ptr`, and `std::weak_ptr`.
  - Automating memory management and preventing resource leaks.
- **Practical Applications:**
  - Swapping variables using pointers and references.
  - Implementing a simple dynamic array class.

Understanding pointers and references is crucial in C++ programming, as they provide the foundation for dynamic memory management, efficient data manipulation, and advanced programming techniques. Mastery of these concepts will greatly enhance your ability to write robust and efficient C++ programs.

---

In the next chapter, we'll explore **Object-Oriented Programming**, delving into classes, objects, and the principles that enable modular and reusable code.

Next chapter: [Object-Oriented Programming](/2024/09/27/cpp-unleash/02h-oop)