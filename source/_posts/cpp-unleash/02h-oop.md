---
title: "C++ Unleashed: Object-Oriented Programming"
date: 2024-09-27 00:28:58
tags:
    - c-cpp
    - modern-cpp
    - cpp-unleash
    - 02Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Pointers and References](/2024/09/26/cpp-unleash/02h-arystr)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Object-Oriented Programming

**Object-Oriented Programming (OOP)** is a cornerstone of C++ programming, enabling developers to model complex systems through classes and objects. This chapter delves into the essential principles of OOP, providing a solid foundation for building robust and maintainable applications.

## Table of Contents for This Chapter

1. [Classes and Objects](#classes-and-objects)
2. [Constructors and Destructors](#constructors-and-destructors)
3. [Copy and Move Semantics](#copy-and-move-semantics)
4. [Inheritance and Polymorphism](#inheritance-and-polymorphism)
5. [Operator Overloading](#operator-overloading)
6. [Union and Struct as Special Classes](#union-and-struct-as-special-classes)
7. [Type Conversions](#type-conversions)
8. [Variable Modifiers (`const`, `static`, `mutable`, `volatile`)](#variable-modifiers-const-static-mutable-volatile)
9. [Virtual Functions and Abstract Classes](#virtual-functions-and-abstract-classes)

---

## Classes and Objects

### What Are Classes and Objects?

- **Class**: A blueprint for creating objects. It encapsulates data for the object and methods to manipulate that data.
- **Object**: An instance of a class. It represents a specific entity with its own state and behavior as defined by the class.

### Defining a Class

To define a class in C++, use the `class` keyword followed by the class name and a pair of curly braces `{}` enclosing its members.

**Syntax:**
```cpp
class ClassName {
public:
    // Public members
private:
    // Private members
protected:
    // Protected members
};
```

### Example: Defining and Using a Class

```cpp
#include <iostream>
#include <string>

// Definition of the Person class
class Person {
public:
    // Public member variables
    std::string name;
    int age;

    // Public member function
    void introduce() const {
        std::cout << "Hello, my name is " << name 
                  << " and I am " << age << " years old." << std::endl;
    }

private:
    // Private member variable
    std::string secret;
};

int main() {
    // Creating an object of the Person class
    Person person1;
    person1.name = "Alice";
    person1.age = 30;
    
    // Calling a member function
    person1.introduce();

    return 0;
}
```

**Output:**
```
Hello, my name is Alice and I am 30 years old.
```

### Access Specifiers

- **public**: Members are accessible from outside the class.
- **private**: Members are accessible only within the class.
- **protected**: Members are accessible within the class and by derived classes.

**Example:**
```cpp
class Example {
public:
    int publicVar; // Accessible from anywhere

private:
    int privateVar; // Accessible only within the class

protected:
    int protectedVar; // Accessible within the class and derived classes
};
```

---

## Constructors and Destructors

### Constructors

Constructors are special member functions that are called when an object is created. They initialize the object's data members and allocate resources if necessary.

**Types of Constructors:**

1. **Default Constructor**: Takes no arguments.
2. **Parameterized Constructor**: Takes parameters to initialize the object.
3. **Copy Constructor**: Creates a new object as a copy of an existing object.
4. **Move Constructor**: Transfers resources from a temporary object to a new object.

**Example:**

```cpp
#include <iostream>
#include <string>

class Person {
public:
    // Default constructor
    Person() : name("Unknown"), age(0) {
        std::cout << "Default constructor called." << std::endl;
    }

    // Parameterized constructor
    Person(const std::string& personName, int personAge) 
        : name(personName), age(personAge) {
        std::cout << "Parameterized constructor called." << std::endl;
    }

    // Copy constructor
    Person(const Person& other) 
        : name(other.name), age(other.age) {
        std::cout << "Copy constructor called." << std::endl;
    }

    // Move constructor
    Person(Person&& other) noexcept 
        : name(std::move(other.name)), age(other.age) {
        std::cout << "Move constructor called." << std::endl;
    }

    // Display information
    void display() const {
        std::cout << "Name: " << name << ", Age: " << age << std::endl;
    }

private:
    std::string name;
    int age;
};

int main() {
    Person p1; // Default constructor
    p1.display();

    Person p2("Alice", 30); // Parameterized constructor
    p2.display();

    Person p3 = p2; // Copy constructor
    p3.display();

    Person p4 = std::move(p2); // Move constructor
    p4.display();

    return 0;
}
```

**Output:**
```
Default constructor called.
Name: Unknown, Age: 0
Parameterized constructor called.
Name: Alice, Age: 30
Copy constructor called.
Name: Alice, Age: 30
Move constructor called.
Name: Alice, Age: 30
```

### Destructors

Destructors are special member functions that are called when an object is destroyed. They are used to release resources allocated to the object and perform any necessary cleanup.

**Syntax:**
```cpp
~ClassName() {
    // Cleanup code
}
```

**Example:**

```cpp
#include <iostream>
#include <string>

class Resource {
public:
    // Constructor
    Resource(const std::string& resourceName) : name(resourceName) {
        std::cout << "Resource " << name << " acquired." << std::endl;
    }

    // Destructor
    ~Resource() {
        std::cout << "Resource " << name << " released." << std::endl;
    }

private:
    std::string name;
};

int main() {
    {
        Resource res1("FileHandle");
        Resource res2("NetworkSocket");
    } // res1 and res2 go out of scope here

    return 0;
}
```

**Output:**
```
Resource FileHandle acquired.
Resource NetworkSocket acquired.
Resource NetworkSocket released.
Resource FileHandle released.
```

---

## Copy and Move Semantics

### Copy Semantics

Copy semantics involve creating a new object as a copy of an existing object. This is typically handled by the copy constructor and copy assignment operator.

**Copy Constructor:**
```cpp
ClassName(const ClassName& other);
```

**Copy Assignment Operator:**
```cpp
ClassName& operator=(const ClassName& other);
```

**Example:**

```cpp
#include <iostream>
#include <string>

class Box {
public:
    // Parameterized constructor
    Box(double w, double h, double d) : width(w), height(h), depth(d) {}

    // Copy constructor
    Box(const Box& other) 
        : width(other.width), height(other.height), depth(other.depth) {
        std::cout << "Copy constructor called." << std::endl;
    }

    // Display dimensions
    void display() const {
        std::cout << "Box(" << width << " x " 
                  << height << " x " << depth << ")" << std::endl;
    }

private:
    double width;
    double height;
    double depth;
};

int main() {
    Box box1(3.0, 4.0, 5.0);
    box1.display();

    Box box2 = box1; // Invokes copy constructor
    box2.display();

    return 0;
}
```

**Output:**
```
Box(3 x 4 x 5)
Copy constructor called.
Box(3 x 4 x 5)
```

### Move Semantics

Move semantics allow the resources of a temporary object to be transferred rather than copied, enhancing performance, especially for objects with dynamic memory allocation.

**Move Constructor:**
```cpp
ClassName(ClassName&& other) noexcept;
```

**Move Assignment Operator:**
```cpp
ClassName& operator=(ClassName&& other) noexcept;
```

**Example:**

```cpp
#include <iostream>
#include <string>

class Buffer {
public:
    // Default constructor
    Buffer() : data(nullptr), size(0) {}

    // Parameterized constructor
    Buffer(size_t sz) : size(sz) {
        data = new int[size];
        std::cout << "Buffer of size " << size << " created." << std::endl;
    }

    // Copy constructor
    Buffer(const Buffer& other) : size(other.size) {
        data = new int[size];
        std::copy(other.data, other.data + size, data);
        std::cout << "Buffer copied." << std::endl;
    }

    // Move constructor
    Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        std::cout << "Buffer moved." << std::endl;
    }

    // Destructor
    ~Buffer() {
        delete[] data;
        if (size > 0) {
            std::cout << "Buffer of size " << size << " destroyed." << std::endl;
        }
    }

    // Display buffer info
    void display() const {
        std::cout << "Buffer size: " << size << ", Data pointer: " 
                  << data << std::endl;
    }

private:
    int* data;
    size_t size;
};

int main() {
    Buffer buf1(10);
    buf1.display();

    Buffer buf2 = std::move(buf1); // Invokes move constructor
    buf2.display();
    buf1.display(); // buf1 is now in a valid but unspecified state

    return 0;
}
```

**Output:**
```
Buffer of size 10 created.
Buffer size: 10, Data pointer: 0x7ffeefbff5c0
Buffer moved.
Buffer size: 10, Data pointer: 0x7ffeefbff5c0
Buffer size: 0, Data pointer: 0
Buffer of size 10 destroyed.
```

**Explanation:**

- **Move Constructor**: Transfers ownership of resources from `buf1` to `buf2`. After the move, `buf1` no longer owns the data.
- **Performance Benefit**: Avoids unnecessary deep copies, especially beneficial for large or resource-intensive objects.

---

## Inheritance and Polymorphism

### Inheritance

Inheritance allows a class (derived class) to inherit properties and behaviors from another class (base class). This promotes code reuse and establishes a hierarchical relationship between classes.

**Syntax:**
```cpp
class BaseClass {
public:
    void baseFunction() {
        // Base class function
    }
};

class DerivedClass : public BaseClass {
public:
    void derivedFunction() {
        // Derived class function
    }
};
```

**Example:**

```cpp
#include <iostream>
#include <string>

// Base class
class Animal {
public:
    void eat() const {
        std::cout << "This animal eats food." << std::endl;
    }
};

// Derived class
class Dog : public Animal {
public:
    void bark() const {
        std::cout << "The dog barks." << std::endl;
    }
};

int main() {
    Dog myDog;
    myDog.eat();   // Inherited from Animal
    myDog.bark();  // Defined in Dog

    return 0;
}
```

**Output:**
```
This animal eats food.
The dog barks.
```

### Polymorphism

Polymorphism allows objects of different classes to be treated as objects of a common base class. It enables one interface to be used for a general class of actions, with specific actions determined by the exact nature of the situation.

There are two types of polymorphism in C++:

1. **Compile-Time Polymorphism**: Achieved through function overloading and templates.
2. **Run-Time Polymorphism**: Achieved through inheritance and virtual functions.

#### Virtual Functions

A virtual function is a member function that you expect to be redefined in derived classes. When you refer to a derived class object using a pointer or a reference to the base class, you can call a virtual function for that object and execute the derived class's version of the function.

**Example:**

```cpp
#include <iostream>
#include <string>

// Base class
class Shape {
public:
    virtual void draw() const { // Virtual function
        std::cout << "Drawing a generic shape." << std::endl;
    }
};

// Derived class
class Circle : public Shape {
public:
    void draw() const override { // Override keyword for clarity
        std::cout << "Drawing a circle." << std::endl;
    }
};

// Another derived class
class Square : public Shape {
public:
    void draw() const override {
        std::cout << "Drawing a square." << std::endl;
    }
};

int main() {
    Shape* shape1 = new Circle();
    Shape* shape2 = new Square();

    shape1->draw(); // Outputs: Drawing a circle.
    shape2->draw(); // Outputs: Drawing a square.

    delete shape1;
    delete shape2;

    return 0;
}
```

**Output:**
```
Drawing a circle.
Drawing a square.
```

#### Abstract Classes

An abstract class is a class that cannot be instantiated and is designed to be subclassed. It typically contains at least one pure virtual function, which must be overridden by derived classes.

**Syntax:**
```cpp
class AbstractClass {
public:
    virtual void pureVirtualFunction() = 0; // Pure virtual function
};
```

**Example:**

```cpp
#include <iostream>
#include <string>

// Abstract base class
class Vehicle {
public:
    virtual void move() const = 0; // Pure virtual function
};

// Derived class
class Car : public Vehicle {
public:
    void move() const override {
        std::cout << "The car drives on the road." << std::endl;
    }
};

// Another derived class
class Boat : public Vehicle {
public:
    void move() const override {
        std::cout << "The boat sails on the water." << std::endl;
    }
};

int main() {
    // Vehicle v; // Error: Cannot instantiate abstract class

    Vehicle* car = new Car();
    Vehicle* boat = new Boat();

    car->move();   // Outputs: The car drives on the road.
    boat->move();  // Outputs: The boat sails on the water.

    delete car;
    delete boat;

    return 0;
}
```

**Output:**
```
The car drives on the road.
The boat sails on the water.
```

**Explanation:**

- **Abstract Class (`Vehicle`)**: Defines a common interface (`move`) for all vehicles.
- **Derived Classes (`Car`, `Boat`)**: Provide specific implementations of the `move` function.
- **Polymorphism**: Allows treating different vehicles uniformly through base class pointers.

---

## Operator Overloading

Operator overloading allows you to redefine the way operators work for user-defined types (classes and structs). This enhances the readability and intuitiveness of your classes by enabling natural syntax for operations.

### Why Overload Operators?

- **Intuitiveness**: Makes objects behave like built-in types.
- **Readability**: Simplifies code by allowing concise expressions.
- **Functionality**: Enables complex operations to be performed seamlessly.

### How to Overload Operators

Operators can be overloaded as member functions or as friend functions. Not all operators can be overloaded, and care must be taken to maintain code clarity.

**Syntax:**
```cpp
// Member function
ReturnType operatorOp(Parameters) {
    // Implementation
}

// Friend function
friend ReturnType operatorOp(const ClassName& lhs, const ClassName& rhs) {
    // Implementation
}
```

### Example: Overloading the `+` Operator

```cpp
#include <iostream>

class Vector {
public:
    Vector(int x, int y) : x_(x), y_(y) {}

    // Overload the + operator as a member function
    Vector operator+(const Vector& other) const {
        return Vector(x_ + other.x_, y_ + other.y_);
    }

    // Display vector components
    void display() const {
        std::cout << "(" << x_ << ", " << y_ << ")" << std::endl;
    }

private:
    int x_;
    int y_;
};

int main() {
    Vector v1(1, 2);
    Vector v2(3, 4);
    Vector v3 = v1 + v2; // Uses overloaded + operator

    v3.display(); // Outputs: (4, 6)

    return 0;
}
```

**Output:**
```
(4, 6)
```

### Example: Overloading the `<<` Operator for Output

```cpp
#include <iostream>

class Point {
public:
    Point(int x, int y) : x_(x), y_(y) {}

    // Overload the << operator as a friend function
    friend std::ostream& operator<<(std::ostream& os, const Point& pt) {
        os << "(" << pt.x_ << ", " << pt.y_ << ")";
        return os;
    }

private:
    int x_;
    int y_;
};

int main() {
    Point p(5, 10);
    std::cout << "Point p: " << p << std::endl; // Uses overloaded << operator
    return 0;
}
```

**Output:**
```
Point p: (5, 10)
```

### Best Practices for Operator Overloading

1. **Maintain Intuitive Behavior**: Overloaded operators should behave as expected to avoid confusing users.
2. **Consistency**: Ensure that operator overloads are consistent with their traditional meanings.
3. **Avoid Overloading Unrelated Operators**: Only overload operators that make logical sense for the class.
4. **Prefer Member Functions for Symmetric Operators**: For operators like `+`, member functions are often more appropriate.
5. **Use Friend Functions When Necessary**: For operators that require access to private members of multiple classes.

---

## Union and Struct as Special Classes

In C++, `struct` and `union` are special types of classes with unique characteristics and use cases.

### Structs

A `struct` is similar to a `class` but has default public access specifiers. It is primarily used for passive objects that carry data.

**Syntax:**
```cpp
struct StructName {
    // Public members by default
    int member1;
    double member2;

    void display() const {
        std::cout << "Member1: " << member1 
                  << ", Member2: " << member2 << std::endl;
    }
};
```

**Example:**

```cpp
#include <iostream>

struct Point {
    int x;
    int y;

    void display() const {
        std::cout << "Point(" << x << ", " << y << ")" << std::endl;
    }
};

int main() {
    Point p = {10, 20};
    p.display(); // Outputs: Point(10, 20)
    return 0;
}
```

### Unions

A `union` allows storing different data types in the same memory location. Only one member can hold a value at any given time.

**Syntax:**
```cpp
union UnionName {
    int intVal;
    float floatVal;
    char charVal;
};
```

**Example:**

```cpp
#include <iostream>
#include <cstring>

union Data {
    int intVal;
    float floatVal;
    char charVal;
};

int main() {
    Data data;
    data.intVal = 100;
    std::cout << "data.intVal: " << data.intVal << std::endl;

    data.floatVal = 98.6f;
    std::cout << "data.floatVal: " << data.floatVal << std::endl;

    data.charVal = 'A';
    std::cout << "data.charVal: " << data.charVal << std::endl;

    return 0;
}
```

**Output:**
```
data.intVal: 100
data.floatVal: 98.6
data.charVal: A
```

**Note:** Assigning to one member overwrites the others since all members share the same memory.

---

## Type Conversions

Type conversions, also known as type casting, allow you to convert a value from one data type to another. Understanding type conversions is crucial for operations involving different data types, function calls, and more, especially within the context of OOP.

### Implicit Type Conversion

Implicit type conversion occurs automatically when converting from a smaller to a larger type or between compatible types. The compiler handles this conversion without explicit instructions.

**Example:**

```cpp
#include <iostream>

int main() {
    int a = 10;
    double b = a; // Implicitly converts int to double
    std::cout << "b = " << b << std::endl; // Outputs: b = 10.0
    return 0;
}
```

**Key Points:**

- Safe and lossless when converting to a type that can represent all possible values of the original type.
- Can lead to precision loss when converting from a floating-point to an integer type.

### Explicit Type Conversion

Explicit type conversion, or casting, is performed manually using casting operators. It is necessary when implicit conversion is not possible or could lead to data loss.

**C++ Casting Operators:**

1. **`static_cast`**
2. **`dynamic_cast`**
3. **`const_cast`**
4. **`reinterpret_cast`**

#### `static_cast`

Used for well-defined and safe conversions, such as between numeric types or upcasting in inheritance hierarchies.

**Example:**

```cpp
#include <iostream>

int main() {
    double pi = 3.14159;
    int intPi = static_cast<int>(pi); // Explicitly converts double to int
    std::cout << "intPi = " << intPi << std::endl; // Outputs: intPi = 3
    return 0;
}
```

#### `dynamic_cast`

Used primarily for downcasting in inheritance hierarchies, ensuring that the cast is safe at runtime. Requires the base class to have at least one virtual function.

**Example:**

```cpp
#include <iostream>

class Base {
public:
    virtual void speak() const { std::cout << "Base speaking." << std::endl; }
};

class Derived : public Base {
public:
    void speak() const override { std::cout << "Derived speaking." << std::endl; }
};

int main() {
    Base* basePtr = new Derived();
    Derived* derivedPtr = dynamic_cast<Derived*>(basePtr);
    
    if (derivedPtr) {
        derivedPtr->speak(); // Outputs: Derived speaking.
    } else {
        std::cout << "Cast failed." << std::endl;
    }

    delete basePtr;
    return 0;
}
```

#### `const_cast`

Used to add or remove the `const` qualifier from a variable. It should be used cautiously, as modifying a `const` variable after removing `const` can lead to undefined behavior.

**Example:**

```cpp
#include <iostream>

void printNumber(const int* num) {
    int* modifiableNum = const_cast<int*>(num);
    *modifiableNum = 20; // Undefined behavior if num was originally const
    std::cout << "Number: " << *modifiableNum << std::endl;
}

int main() {
    int value = 10;
    printNumber(&value); // Outputs: Number: 20
    return 0;
}
```

#### `reinterpret_cast`

Used for low-level, unsafe conversions, such as converting between pointer types or between pointers and integers. It should be used sparingly and only when absolutely necessary.

**Example:**

```cpp
#include <iostream>

int main() {
    int a = 65;
    char* charPtr = reinterpret_cast<char*>(&a);
    std::cout << "Character: " << *charPtr << std::endl; // May output: 'A'
    return 0;
}
```

**Caution:** `reinterpret_cast` can lead to platform-dependent behavior and should be avoided unless you have a clear understanding of the implications.

### Best Practices for Type Conversion

1. **Prefer Implicit Conversions When Safe:**
   - Use implicit conversions when they are safe and do not lead to data loss or unexpected behavior.

2. **Use `static_cast` for Clear Intentions:**
   - When you need to convert between compatible types, `static_cast` makes your intentions explicit.

3. **Minimize the Use of `reinterpret_cast`:**
   - Avoid `reinterpret_cast` unless absolutely necessary due to its unsafe nature.

4. **Ensure Safe Downcasting with `dynamic_cast`:**
   - When downcasting in an inheritance hierarchy, use `dynamic_cast` to ensure the cast is valid at runtime.

5. **Maintain Const-Correctness:**
   - Use `const_cast` judiciously to maintain the integrity of `const` variables.

6. **Avoid Unnecessary Casts:**
   - Unnecessary type casts can make code harder to read and maintain. Only cast when required.

### Using Type Conversions in Code

Understanding when and how to perform type conversions is essential for writing flexible and error-free C++ programs. Let's modify our program to include examples of type conversions.

#### Step 1: Update `main.cpp`

Open `src/main.cpp` and replace its contents with the following code:

```cpp
#include <iostream>
#include <string>

int main() {
    // Implicit Type Conversion
    int integer = 42;
    double floating = integer; // Implicitly converts int to double
    std::cout << "Floating: " << floating << std::endl; // Outputs: Floating: 42.0

    // Explicit Type Conversion using static_cast
    double pi = 3.14159;
    int intPi = static_cast<int>(pi); // Explicitly converts double to int
    std::cout << "intPi: " << intPi << std::endl; // Outputs: intPi: 3

    // Explicit Type Conversion using reinterpret_cast
    int a = 65;
    char* charPtr = reinterpret_cast<char*>(&a);
    std::cout << "Character: " << *charPtr << std::endl; // May output: Character: 'A'

    // Using const_cast
    const int value = 100;
    int* modifiableValue = const_cast<int*>(&value);
    *modifiableValue = 200; // Undefined behavior if value was originally const
    std::cout << "Modified Value: " << value << std::endl; // Outputs: Modified Value: 200

    return 0;
}
```

#### Step 2: Build and Run the Program

In the terminal, build the project:

```bash
xmake
```

Run the program:

```bash
xmake run
```

#### Expected Output

```
Floating: 42
intPi: 3
Character: A
Modified Value: 200
```

**Note:** Modifying a `const` variable using `const_cast` leads to undefined behavior if the original variable was declared as `const`. In this example, `value` is modified after being cast, which is generally unsafe and should be avoided in real-world applications.

#### Explanation

- **Implicit Conversion:**
  - `int` to `double` is performed automatically without explicit casting.

- **Explicit Conversion (`static_cast`):**
  - Converts `double` to `int`, truncating the decimal part.

- **Explicit Conversion (`reinterpret_cast`):**
  - Treats the memory address of an `int` as a `char*` to access individual bytes. This is useful for low-level programming but should be used with caution.

- **Explicit Conversion (`const_cast`):**
  - Removes the `const` qualifier from a variable, allowing modification. This can lead to undefined behavior if not used carefully.

---

## Operator Overloading

Operator overloading allows you to redefine the way operators work for user-defined types (classes and structs). This enhances the readability and intuitiveness of your classes by enabling natural syntax for operations.

### Why Overload Operators?

- **Intuitiveness**: Makes objects behave like built-in types.
- **Readability**: Simplifies code by allowing concise expressions.
- **Functionality**: Enables complex operations to be performed seamlessly.

### How to Overload Operators

Operators can be overloaded as member functions or as friend functions. Not all operators can be overloaded, and care must be taken to maintain code clarity.

**Syntax:**
```cpp
// Member function
ReturnType operatorOp(Parameters) {
    // Implementation
}

// Friend function
friend ReturnType operatorOp(const ClassName& lhs, const ClassName& rhs) {
    // Implementation
}
```

### Example: Overloading the `+` Operator

```cpp
#include <iostream>

class Vector {
public:
    Vector(int x, int y) : x_(x), y_(y) {}

    // Overload the + operator as a member function
    Vector operator+(const Vector& other) const {
        return Vector(x_ + other.x_, y_ + other.y_);
    }

    // Display vector components
    void display() const {
        std::cout << "(" << x_ << ", " << y_ << ")" << std::endl;
    }

private:
    int x_;
    int y_;
};

int main() {
    Vector v1(1, 2);
    Vector v2(3, 4);
    Vector v3 = v1 + v2; // Uses overloaded + operator

    v3.display(); // Outputs: (4, 6)

    return 0;
}
```

**Output:**
```
(4, 6)
```

### Example: Overloading the `<<` Operator for Output

```cpp
#include <iostream>

class Point {
public:
    Point(int x, int y) : x_(x), y_(y) {}

    // Overload the << operator as a friend function
    friend std::ostream& operator<<(std::ostream& os, const Point& pt) {
        os << "(" << pt.x_ << ", " << pt.y_ << ")";
        return os;
    }

private:
    int x_;
    int y_;
};

int main() {
    Point p(5, 10);
    std::cout << "Point p: " << p << std::endl; // Uses overloaded << operator
    return 0;
}
```

**Output:**
```
Point p: (5, 10)
```

### Best Practices for Operator Overloading

1. **Maintain Intuitive Behavior**: Overloaded operators should behave as expected to avoid confusing users.
2. **Consistency**: Ensure that operator overloads are consistent with their traditional meanings.
3. **Avoid Overloading Unrelated Operators**: Only overload operators that make logical sense for the class.
4. **Prefer Member Functions for Symmetric Operators**: For operators like `+`, member functions are often more appropriate.
5. **Use Friend Functions When Necessary**: For operators that require access to private members of multiple classes.

---

## Union and Struct as Special Classes

In C++, `struct` and `union` are special types of classes with unique characteristics and use cases.

### Structs

A `struct` is similar to a `class` but has default public access specifiers. It is primarily used for passive objects that carry data.

**Syntax:**
```cpp
struct StructName {
    // Public members by default
    int member1;
    double member2;

    void display() const {
        std::cout << "Member1: " << member1 
                  << ", Member2: " << member2 << std::endl;
    }
};
```

**Example:**

```cpp
#include <iostream>

struct Point {
    int x;
    int y;

    void display() const {
        std::cout << "Point(" << x << ", " << y << ")" << std::endl;
    }
};

int main() {
    Point p = {10, 20};
    p.display(); // Outputs: Point(10, 20)
    return 0;
}
```

### Unions

A `union` allows storing different data types in the same memory location. Only one member can hold a value at any given time.

**Syntax:**
```cpp
union UnionName {
    int intVal;
    float floatVal;
    char charVal;
};
```

**Example:**

```cpp
#include <iostream>
#include <cstring>

union Data {
    int intVal;
    float floatVal;
    char charVal;
};

int main() {
    Data data;
    data.intVal = 100;
    std::cout << "data.intVal: " << data.intVal << std::endl;

    data.floatVal = 98.6f;
    std::cout << "data.floatVal: " << data.floatVal << std::endl;

    data.charVal = 'A';
    std::cout << "data.charVal: " << data.charVal << std::endl;

    return 0;
}
```

**Output:**
```
data.intVal: 100
data.floatVal: 98.6
data.charVal: A
```

**Note:** Assigning to one member overwrites the others since all members share the same memory.

---

## Type Conversions

Type conversions, also known as type casting, allow you to convert a value from one data type to another. Understanding type conversions is crucial for operations involving different data types, function calls, and more, especially within the context of OOP.

### Implicit Type Conversion

Implicit type conversion occurs automatically when converting from a smaller to a larger type or between compatible types. The compiler handles this conversion without explicit instructions.

**Example:**

```cpp
#include <iostream>

int main() {
    int a = 10;
    double b = a; // Implicitly converts int to double
    std::cout << "b = " << b << std::endl; // Outputs: b = 10.0
    return 0;
}
```

**Key Points:**

- Safe and lossless when converting to a type that can represent all possible values of the original type.
- Can lead to precision loss when converting from a floating-point to an integer type.

### Explicit Type Conversion

Explicit type conversion, or casting, is performed manually using casting operators. It is necessary when implicit conversion is not possible or could lead to data loss.

**C++ Casting Operators:**

1. **`static_cast`**
2. **`dynamic_cast`**
3. **`const_cast`**
4. **`reinterpret_cast`**

#### `static_cast`

Used for well-defined and safe conversions, such as between numeric types or upcasting in inheritance hierarchies.

**Example:**

```cpp
#include <iostream>

int main() {
    double pi = 3.14159;
    int intPi = static_cast<int>(pi); // Explicitly converts double to int
    std::cout << "intPi = " << intPi << std::endl; // Outputs: intPi = 3
    return 0;
}
```

#### `dynamic_cast`

Used primarily for downcasting in inheritance hierarchies, ensuring that the cast is safe at runtime. Requires the base class to have at least one virtual function.

**Example:**

```cpp
#include <iostream>

class Base {
public:
    virtual void speak() const { std::cout << "Base speaking." << std::endl; }
};

class Derived : public Base {
public:
    void speak() const override { std::cout << "Derived speaking." << std::endl; }
};

int main() {
    Base* basePtr = new Derived();
    Derived* derivedPtr = dynamic_cast<Derived*>(basePtr);
    
    if (derivedPtr) {
        derivedPtr->speak(); // Outputs: Derived speaking.
    } else {
        std::cout << "Cast failed." << std::endl;
    }

    delete basePtr;
    return 0;
}
```

#### `const_cast`

Used to add or remove the `const` qualifier from a variable. It should be used cautiously, as modifying a `const` variable after removing `const` can lead to undefined behavior.

**Example:**

```cpp
#include <iostream>

void printNumber(const int* num) {
    int* modifiableNum = const_cast<int*>(num);
    *modifiableNum = 20; // Undefined behavior if num was originally const
    std::cout << "Number: " << *modifiableNum << std::endl;
}

int main() {
    int value = 10;
    printNumber(&value); // Outputs: Number: 20
    return 0;
}
```

#### `reinterpret_cast`

Used for low-level, unsafe conversions, such as converting between pointer types or between pointers and integers. It should be used sparingly and only when absolutely necessary.

**Example:**

```cpp
#include <iostream>

int main() {
    int a = 65;
    char* charPtr = reinterpret_cast<char*>(&a);
    std::cout << "Character: " << *charPtr << std::endl; // May output: 'A'
    return 0;
}
```

**Caution:** `reinterpret_cast` can lead to platform-dependent behavior and should be avoided unless you have a clear understanding of the implications.

### Best Practices for Type Conversion

1. **Prefer Implicit Conversions When Safe:**
   - Use implicit conversions when they are safe and do not lead to data loss or unexpected behavior.

2. **Use `static_cast` for Clear Intentions:**
   - When you need to convert between compatible types, `static_cast` makes your intentions explicit.

3. **Minimize the Use of `reinterpret_cast`:**
   - Avoid `reinterpret_cast` unless absolutely necessary due to its unsafe nature.

4. **Ensure Safe Downcasting with `dynamic_cast`:**
   - When downcasting in an inheritance hierarchy, use `dynamic_cast` to ensure the cast is valid at runtime.

5. **Maintain Const-Correctness:**
   - Use `const_cast` judiciously to maintain the integrity of `const` variables.

6. **Avoid Unnecessary Casts:**
   - Unnecessary type casts can make code harder to read and maintain. Only cast when required.

### Using Type Conversions in Code

Understanding when and how to perform type conversions is essential for writing flexible and error-free C++ programs. Let's modify our program to include examples of type conversions.

#### Step 1: Update `main.cpp`

Open `src/main.cpp` and replace its contents with the following code:

```cpp
#include <iostream>
#include <string>

int main() {
    // Implicit Type Conversion
    int integer = 42;
    double floating = integer; // Implicitly converts int to double
    std::cout << "Floating: " << floating << std::endl; // Outputs: Floating: 42.0

    // Explicit Type Conversion using static_cast
    double pi = 3.14159;
    int intPi = static_cast<int>(pi); // Explicitly converts double to int
    std::cout << "intPi: " << intPi << std::endl; // Outputs: intPi: 3

    // Explicit Type Conversion using reinterpret_cast
    int a = 65;
    char* charPtr = reinterpret_cast<char*>(&a);
    std::cout << "Character: " << *charPtr << std::endl; // May output: Character: 'A'

    // Using const_cast
    const int value = 100;
    int* modifiableValue = const_cast<int*>(&value);
    *modifiableValue = 200; // Undefined behavior if value was originally const
    std::cout << "Modified Value: " << value << std::endl; // Outputs: Modified Value: 200

    return 0;
}
```

#### Step 2: Build and Run the Program

In the terminal, build the project:

```bash
xmake
```

Run the program:

```bash
xmake run
```

#### Expected Output

```
Floating: 42
intPi: 3
Character: A
Modified Value: 200
```

**Note:** Modifying a `const` variable using `const_cast` leads to undefined behavior if the original variable was declared as `const`. In this example, `value` is modified after being cast, which is generally unsafe and should be avoided in real-world applications.

#### Explanation

- **Implicit Conversion:**
  - `int` to `double` is performed automatically without explicit casting.

- **Explicit Conversion (`static_cast`):**
  - Converts `double` to `int`, truncating the decimal part.

- **Explicit Conversion (`reinterpret_cast`):**
  - Treats the memory address of an `int` as a `char*` to access individual bytes. This is useful for low-level programming but should be used with caution.

- **Explicit Conversion (`const_cast`):**
  - Removes the `const` qualifier from a variable, allowing modification. This can lead to undefined behavior if not used carefully.

---

## Variable Modifiers (`const`, `static`, `mutable`, `volatile`)

Variable modifiers in C++ alter the behavior or characteristics of variables. Within the context of OOP, these modifiers are often used to control access, manage memory, and enforce const-correctness.

### `const`

The `const` keyword makes a variable read-only after its initialization. Attempting to modify a `const` variable will result in a compile-time error.

**Usage in Classes:**

- **Constant Member Functions**: Functions that do not modify the state of the object.

  ```cpp
  class Rectangle {
  public:
      Rectangle(double w, double h) : width(w), height(h) {}

      double area() const { // const member function
          return width * height;
      }

  private:
      double width;
      double height;
  };
  ```

- **Constant Data Members**: Data members that cannot be modified after initialization.

  ```cpp
  class Circle {
  public:
      Circle(double r) : radius(r) {}

      double getRadius() const {
          return radius;
      }

  private:
      const double radius; // Constant data member
  };
  ```

### `static`

The `static` keyword has different meanings depending on the context within a class:

- **Static Data Members**: Shared among all instances of the class. They are not tied to any specific object.

  ```cpp
  class Counter {
  public:
      Counter() { ++count; }
      static int getCount() { return count; }

  private:
      static int count; // Declaration
  };

  // Definition and initialization
  int Counter::count = 0;

  int main() {
      Counter c1;
      Counter c2;
      std::cout << "Number of Counter instances: " << Counter::getCount() << std::endl; // Outputs: 2
      return 0;
  }
  ```

- **Static Member Functions**: Can be called without creating an instance of the class. They can only access static data members.

  ```cpp
  class MathUtils {
  public:
      static double pi() {
          return 3.14159;
      }
  };

  int main() {
      std::cout << "Pi: " << MathUtils::pi() << std::endl; // Outputs: Pi: 3.14159
      return 0;
  }
  ```

### `mutable`

The `mutable` keyword allows a member of an object to be modified even if the object is declared as `const`. This is useful for fields that are logically not part of the object's state, such as caching or logging information.

**Example:**

```cpp
#include <iostream>
#include <string>

class Logger {
public:
    Logger(const std::string& msg) : message(msg), logCount(0) {}

    void log() const {
        ++logCount; // Allowed because logCount is mutable
        std::cout << "Log: " << message << " (Log Count: " << logCount << ")" << std::endl;
    }

private:
    std::string message;
    mutable int logCount; // Mutable member
};

int main() {
    const Logger logger("Starting application");
    logger.log(); // Log Count: 1
    logger.log(); // Log Count: 2

    return 0;
}
```

**Output:**
```
Log: Starting application (Log Count: 1)
Log: Starting application (Log Count: 2)
```

### `volatile`

The `volatile` keyword indicates that a variable's value may be changed by something outside the control of the program, such as hardware or a different thread. It prevents the compiler from applying certain optimizations that assume values do not change unexpectedly.

**Usage in Classes:**

- **Volatile Member Variables**: Useful in scenarios where variables can be modified by external factors, such as memory-mapped hardware registers or signal handlers.

  ```cpp
  class HardwareRegister {
  public:
      volatile int status; // Status register that can change unexpectedly

      HardwareRegister() : status(0) {}

      void updateStatus(int newStatus) {
          status = newStatus;
      }

      void checkStatus() const {
          if (status & 0x1) {
              std::cout << "Status bit 0 is set." << std::endl;
          }
      }
  };

  int main() {
      HardwareRegister reg;
      reg.updateStatus(1);
      reg.checkStatus(); // Outputs: Status bit 0 is set.

      return 0;
  }
  ```

**Important Considerations:**

- **Limited Use Cases**: The `volatile` keyword has specific use cases and is not commonly needed in typical application development.
- **Not a Substitute for Synchronization**: `volatile` does not provide any thread synchronization or memory ordering guarantees. For multithreading, prefer using atomic types and synchronization primitives from `<atomic>` and `<mutex>`.

**Example with Multithreading:**

```cpp
#include <iostream>
#include <thread>
#include <atomic>

class SharedCounter {
public:
    SharedCounter() : count(0) {}

    void increment() {
        ++count; // Atomic operation
    }

    int getCount() const {
        return count.load();
    }

private:
    std::atomic<int> count; // Atomic variable for thread-safe operations
};

int main() {
    SharedCounter counter;
    std::thread t1([&counter]() {
        for(int i = 0; i < 1000; ++i) {
            counter.increment();
        }
    });

    std::thread t2([&counter]() {
        for(int i = 0; i < 1000; ++i) {
            counter.increment();
        }
    });

    t1.join();
    t2.join();

    std::cout << "Final count: " << counter.getCount() << std::endl; // Outputs: Final count: 2000

    return 0;
}
```

In this example, using `std::atomic<int>` ensures that increments are thread-safe without needing the `volatile` keyword.

---

## Summary

In this chapter, you've explored the foundational principles of **Object-Oriented Programming (OOP)** in C++:

- **Classes and Objects**: Learned how to define classes as blueprints for objects and create instances from them.
- **Constructors and Destructors**: Gained insights into object initialization and cleanup through various types of constructors and destructors.
- **Copy and Move Semantics**: Learned how to efficiently copy and move objects, optimizing performance and resource management.
- **Inheritance and Polymorphism**: Discovered how to create hierarchical relationships between classes and enable run-time polymorphism using virtual functions.
- **Operator Overloading**: Understood how to redefine operators for user-defined types to enhance code readability and intuitiveness.
- **Union and Struct as Special Classes**: Explored the unique characteristics and use cases of `union` and `struct` in C++.
- **Type Conversions**: Mastered implicit and explicit type conversions, utilizing casting operators to ensure safe and efficient type handling.
- **Variable Modifiers (`const`, `static`, `mutable`, `volatile`)**: Understood how these modifiers control variable behavior within classes.
- **Virtual Functions and Abstract Classes**: Delved into creating abstract interfaces and leveraging polymorphism for flexible and reusable code.

Mastering these OOP concepts is crucial for building complex, maintainable, and scalable C++ applications. As you progress, you'll apply these principles to design robust software systems that effectively model real-world scenarios.

---

Now you're ready to move on to **Templates and Generic Programming** where you'll learn how to create flexible and reusable code components using templates.

Next chapter: [Templates and Generic Programming](/2024/09/27/cpp-unleash/02h-tplgenpgm)