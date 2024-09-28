---
title: "C++ Unleashed: Concurrency and Multithreading"
date: 2024-09-27 21:12:49
tags:
    - C/C++
    - Modern C++
    - C++ Unleashed
    - Zero to Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Error Handling and Exceptions](/2024/09/27/cpp-unleash/02h-excpt)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Concurrency and Multithreading

Concurrency and multithreading are essential concepts in modern C++ programming, enabling developers to build applications that can perform multiple operations simultaneously. This chapter delves into the fundamentals of concurrency, explores the C++ Standard Library's threading facilities, and provides practical examples to illustrate how to implement and manage concurrent operations effectively.

<!--more-->

## Table of Contents for This Chapter

1. [Introduction to Concurrency](#introduction-to-concurrency)
2. [Threads and `std::thread`](#threads-and-stdthread)
3. [Mutexes and Locks (`std::mutex`, `std::lock_guard`)](#mutexes-and-locks-stdmutex-stdlock_guard)
4. [Condition Variables (`std::condition_variable`)](#condition-variables-stdcondition_variable)
5. [Atomic Operations (`std::atomic`)](#atomic-operations-stdatomic)
6. [Futures and Promises (`std::future`, `std::promise`)](#futures-and-promises-stdfuture-stdpromise)
7. [Asynchronous Programming (`std::async`)](#asynchronous-programming-stdasync)

---

## Introduction to Concurrency

### What is Concurrency?

Concurrency refers to the ability of a system to handle multiple tasks simultaneously. In programming, it allows different parts of a program to execute out of order or in partial order without affecting the final outcome. This is particularly useful for improving the performance and responsiveness of applications, especially those that perform I/O operations or require parallel processing.

### Why Use Concurrency?

- **Performance Improvement**: Utilize multiple CPU cores to perform tasks in parallel, reducing overall execution time.
- **Responsiveness**: Keep applications responsive by performing time-consuming tasks in the background.
- **Resource Optimization**: Efficiently manage system resources by overlapping I/O and computation.

### Challenges in Concurrent Programming

- **Data Races**: Occur when two or more threads access shared data simultaneously, and at least one thread modifies the data.
- **Deadlocks**: Happen when two or more threads are waiting indefinitely for resources held by each other.
- **Complexity**: Managing multiple threads and ensuring thread-safe operations can make the code more complex and harder to debug.

---

## Threads and `std::thread`

### Understanding Threads

A thread is the smallest unit of processing that can be scheduled by an operating system. In C++, the `<thread>` library provides facilities to create and manage threads, allowing concurrent execution of code.

### Creating and Managing Threads

To create a thread in C++, instantiate a `std::thread` object, passing a callable entity (function, lambda, or functor) as its argument.

**Example: Creating a Simple Thread**

```cpp
#include <iostream>
#include <thread>

// Function to be executed by the thread
void greet() {
    std::cout << "Hello from thread!" << std::endl;
}

int main() {
    // Create a thread that runs the greet function
    std::thread t(greet);
    
    // Wait for the thread to finish execution
    t.join();
    
    std::cout << "Thread has finished execution." << std::endl;
    return 0;
}
```

**Output:**
```
Hello from thread!
Thread has finished execution.
```

### Passing Arguments to Threads

Threads can accept arguments by passing them to the constructor of `std::thread`.

**Example: Passing Arguments**

```cpp
#include <iostream>
#include <thread>

// Function that takes two integers and prints their sum
void add(int a, int b) {
    std::cout << "Sum: " << (a + b) << std::endl;
}

int main() {
    // Create a thread that runs the add function with arguments 5 and 10
    std::thread t(add, 5, 10);
    
    // Wait for the thread to finish execution
    t.join();
    
    return 0;
}
```

**Output:**
```
Sum: 15
```

### Detaching Threads

A thread can be detached from the main thread, allowing it to run independently. However, once detached, it cannot be joined, and its resources are released automatically upon completion.

**Example: Detaching a Thread**

```cpp
#include <iostream>
#include <thread>
#include <chrono>

void backgroundTask() {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "Background task completed." << std::endl;
}

int main() {
    // Create and detach the thread
    std::thread t(backgroundTask);
    t.detach();
    
    std::cout << "Main thread continues execution." << std::endl;
    
    // Wait to observe the detached thread's output
    std::this_thread::sleep_for(std::chrono::seconds(3));
    return 0;
}
```

**Output:**
```
Main thread continues execution.
Background task completed.
```

**Caution:** Detached threads should be used carefully to avoid issues such as accessing invalidated resources.

### Lambda Expressions with Threads

Lambda expressions provide a concise way to define inline functions, making them ideal for thread creation.

**Example: Using Lambda with `std::thread`**

```cpp
#include <iostream>
#include <thread>

int main() {
    int count = 0;
    
    // Create a thread using a lambda expression
    std::thread t([&count]() {
        for(int i = 0; i < 5; ++i) {
            ++count;
            std::cout << "Thread count: " << count << std::endl;
        }
    });
    
    // Wait for the thread to finish execution
    t.join();
    
    std::cout << "Final count: " << count << std::endl;
    return 0;
}
```

**Output:**
```
Thread count: 1
Thread count: 2
Thread count: 3
Thread count: 4
Thread count: 5
Final count: 5
```

---

## Mutexes and Locks (`std::mutex`, `std::lock_guard`)

### Ensuring Thread Safety

When multiple threads access shared data, it's crucial to synchronize access to prevent data races. Mutexes (mutual exclusions) are synchronization primitives that protect shared data by allowing only one thread to access the data at a time.

### Using `std::mutex`

A `std::mutex` object can be locked and unlocked to control access to shared resources.

**Example: Protecting Shared Data with `std::mutex`**

```cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx; // Mutex to protect shared data
int sharedCounter = 0;

void increment() {
    mtx.lock(); // Lock the mutex
    ++sharedCounter;
    std::cout << "Shared Counter: " << sharedCounter << std::endl;
    mtx.unlock(); // Unlock the mutex
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    
    t1.join();
    t2.join();
    
    std::cout << "Final Shared Counter: " << sharedCounter << std::endl;
    return 0;
}
```

**Output:**
```
Shared Counter: 1
Shared Counter: 2
Final Shared Counter: 2
```

### Using `std::lock_guard`

Manually locking and unlocking mutexes can be error-prone, especially in the presence of exceptions. `std::lock_guard` is a RAII (Resource Acquisition Is Initialization) wrapper that automatically manages mutex locking and unlocking.

**Example: Using `std::lock_guard`**

```cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx; // Mutex to protect shared data
int sharedCounter = 0;

void increment() {
    std::lock_guard<std::mutex> lock(mtx); // Lock the mutex automatically
    ++sharedCounter;
    std::cout << "Shared Counter: " << sharedCounter << std::endl;
    // Mutex is automatically unlocked when lock goes out of scope
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    
    t1.join();
    t2.join();
    
    std::cout << "Final Shared Counter: " << sharedCounter << std::endl;
    return 0;
}
```

**Output:**
```
Shared Counter: 1
Shared Counter: 2
Final Shared Counter: 2
```

### Best Practices with Mutexes

1. **Use RAII Wrappers**: Prefer `std::lock_guard` or `std::unique_lock` to manage mutexes automatically.
2. **Minimize Lock Scope**: Keep the locked section as short as possible to reduce contention.
3. **Avoid Deadlocks**: Be consistent in the order of locking multiple mutexes and avoid nested locks when possible.
4. **Prefer Mutexes Over Atomic Variables for Complex Data**: While `std::atomic` is suitable for simple data types, mutexes are better for protecting complex data structures.

---

## Condition Variables (`std::condition_variable`)

### Synchronizing Threads

Condition variables allow threads to wait for certain conditions to be met before proceeding. They are used in conjunction with mutexes to synchronize thread execution based on shared data states.

### Using `std::condition_variable`

A `std::condition_variable` object can block a thread until notified by another thread that a condition has been met.

**Example: Producer-Consumer Problem Using `std::condition_variable`**

```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>

std::mutex mtx;
std::condition_variable cv;
std::queue<int> dataQueue;
bool finished = false;

// Producer thread function
void producer(int items) {
    for(int i = 1; i <= items; ++i) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            dataQueue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
        cv.notify_one(); // Notify consumer
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    {
        std::lock_guard<std::mutex> lock(mtx);
        finished = true;
    }
    cv.notify_all(); // Notify all consumers that production is finished
}

// Consumer thread function
void consumer(int id) {
    while(true) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, []{ return !dataQueue.empty() || finished; }); // Wait for data or finish
        
        while(!dataQueue.empty()) {
            int value = dataQueue.front();
            dataQueue.pop();
            lock.unlock(); // Unlock before processing
            std::cout << "Consumer " << id << " consumed: " << value << std::endl;
            lock.lock(); // Lock again to check the queue
        }
        
        if(finished) break;
    }
    std::cout << "Consumer " << id << " finished." << std::endl;
}

int main() {
    std::thread prod(producer, 5);
    std::thread cons1(consumer, 1);
    std::thread cons2(consumer, 2);
    
    prod.join();
    cons1.join();
    cons2.join();
    
    std::cout << "All threads have finished." << std::endl;
    return 0;
}
```

**Output:**
```
Produced: 1
Consumer 1 consumed: 1
Produced: 2
Consumer 2 consumed: 2
Produced: 3
Consumer 1 consumed: 3
Produced: 4
Consumer 2 consumed: 4
Produced: 5
Consumer 1 consumed: 5
Consumer 2 finished.
Consumer 1 finished.
All threads have finished.
```

### Explanation

- **Producer**: Generates items and adds them to the `dataQueue`, notifying consumers after each addition.
- **Consumers**: Wait for items to be available in the `dataQueue` and consume them. They exit once the producer signals that production is finished.
- **Synchronization**: `std::mutex` protects access to the shared `dataQueue`, and `std::condition_variable` synchronizes the producer and consumers.

### Best Practices with Condition Variables

1. **Always Use a Predicate**: When calling `wait`, use a predicate to prevent spurious wake-ups.
2. **Avoid Holding Locks While Processing**: Unlock the mutex before performing time-consuming operations to allow other threads to proceed.
3. **Ensure Proper Notification**: Use `notify_one` or `notify_all` appropriately to wake up waiting threads.

---

## Atomic Operations (`std::atomic`)

### Understanding Atomicity

Atomic operations are indivisible operations that complete without the possibility of interference from other threads. They are essential for ensuring data integrity when multiple threads access shared variables without using mutexes.

### Using `std::atomic`

The `<atomic>` library provides atomic types that can be used safely across multiple threads without additional synchronization.

**Example: Using `std::atomic<int>`**

```cpp
#include <iostream>
#include <thread>
#include <atomic>

std::atomic<int> atomicCounter(0);

void increment() {
    for(int i = 0; i < 1000; ++i) {
        ++atomicCounter; // Atomic increment
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    
    t1.join();
    t2.join();
    
    std::cout << "Final Atomic Counter: " << atomicCounter.load() << std::endl; // Outputs: 2000
    return 0;
}
```

**Output:**
```
Final Atomic Counter: 2000
```

### Atomic Operations on Complex Types

While `std::atomic` is primarily used with fundamental types, it can also be used with user-defined types if they meet certain requirements (trivially copyable).

**Example: Using `std::atomic<bool>`**

```cpp
#include <iostream>
#include <thread>
#include <atomic>

std::atomic<bool> flag(false);

void setFlag() {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    flag.store(true);
    std::cout << "Flag set to true." << std::endl;
}

int main() {
    std::thread t(setFlag);
    
    while(!flag.load()) {
        std::cout << "Waiting for flag..." << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }
    
    t.join();
    std::cout << "Flag detected as true." << std::endl;
    return 0;
}
```

**Output:**
```
Waiting for flag...
Waiting for flag...
Waiting for flag...
Flag set to true.
Flag detected as true.
```

### Best Practices with Atomic Operations

1. **Use Atomics for Simple Flags and Counters**: For simple synchronization needs, atomics can be more efficient than mutexes.
2. **Avoid Complex Operations**: For complex data structures or multiple related operations, prefer mutexes to ensure consistency.
3. **Understand Memory Order**: By default, `std::atomic` operations use sequential consistency, but understanding and utilizing different memory orders can optimize performance.

---

## Futures and Promises (`std::future`, `std::promise`)

### Asynchronous Result Retrieval

Futures and promises facilitate communication between threads, allowing one thread to set a value (promise) that another thread can retrieve (future) once it's ready.

### Using `std::promise` and `std::future`

**Example: Using `std::promise` and `std::future`**

```cpp
#include <iostream>
#include <thread>
#include <future>

// Function that sets a value after some processing
void compute(std::promise<int> prom) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    prom.set_value(42);
    std::cout << "Value set to promise." << std::endl;
}

int main() {
    std::promise<int> prom; // Create a promise
    std::future<int> fut = prom.get_future(); // Get the future associated with the promise
    
    std::thread t(compute, std::move(prom)); // Start the thread and pass the promise
    
    std::cout << "Waiting for value..." << std::endl;
    int result = fut.get(); // Wait for the value to be set
    std::cout << "Received value: " << result << std::endl;
    
    t.join();
    return 0;
}
```

**Output:**
```
Waiting for value...
Value set to promise.
Received value: 42
```

### Using `std::future` with `std::async`

`std::async` provides a higher-level abstraction for asynchronous operations, returning a `std::future` that can be used to retrieve the result.

**Example: Using `std::async`**

```cpp
#include <iostream>
#include <future>

// Function to perform a computation
int computeSum(int a, int b) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    return a + b;
}

int main() {
    // Launch computeSum asynchronously
    std::future<int> fut = std::async(std::launch::async, computeSum, 10, 20);
    
    std::cout << "Doing other work..." << std::endl;
    
    // Retrieve the result
    int sum = fut.get();
    std::cout << "Sum: " << sum << std::endl;
    
    return 0;
}
```

**Output:**
```
Doing other work...
Sum: 30
```

### Best Practices with Futures and Promises

1. **Avoid Blocking Operations**: Calling `get()` on a `std::future` blocks the calling thread until the result is ready. Use this judiciously to prevent performance bottlenecks.
2. **Handle Exceptions**: If the asynchronous operation throws an exception, it will be rethrown when `get()` is called. Ensure proper exception handling.
3. **Use `std::async` for Simplicity**: For simple asynchronous tasks, `std::async` provides a straightforward way to launch tasks without managing threads manually.

---

## Asynchronous Programming (`std::async`)

### Leveraging Asynchronous Tasks

Asynchronous programming allows tasks to run independently of the main program flow, improving performance and responsiveness. C++ provides the `std::async` facility to execute functions asynchronously.

### Using `std::async`

`std::async` launches a function asynchronously (potentially in a new thread) and returns a `std::future` to retrieve the result.

**Example: Parallel Execution with `std::async`**

```cpp
#include <iostream>
#include <future>

// Function to perform a task
int heavyComputation(int n) {
    std::cout << "Starting heavy computation for n = " << n << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(3)); // Simulate heavy work
    std::cout << "Finished heavy computation for n = " << n << std::endl;
    return n * n;
}

int main() {
    // Launch two asynchronous tasks
    std::future<int> fut1 = std::async(std::launch::async, heavyComputation, 5);
    std::future<int> fut2 = std::async(std::launch::async, heavyComputation, 10);
    
    std::cout << "Doing other work while computations are running..." << std::endl;
    
    // Retrieve the results
    int result1 = fut1.get();
    int result2 = fut2.get();
    
    std::cout << "Result of first computation: " << result1 << std::endl;
    std::cout << "Result of second computation: " << result2 << std::endl;
    
    return 0;
}
```

**Output:**
```
Starting heavy computation for n = 5
Starting heavy computation for n = 10
Doing other work while computations are running...
Finished heavy computation for n = 5
Finished heavy computation for n = 10
Result of first computation: 25
Result of second computation: 100
```

### Deferred Execution

`std::async` can also launch tasks with deferred execution, meaning the task starts only when the result is requested via `get()` or `wait()`.

**Example: Deferred Execution**

```cpp
#include <iostream>
#include <future>

// Function to perform a task
int compute(int a, int b) {
    std::cout << "Computing " << a << " + " << b << std::endl;
    return a + b;
}

int main() {
    // Launch asynchronously with deferred execution
    std::future<int> fut = std::async(std::launch::deferred, compute, 3, 4);
    
    std::cout << "Before calling get()" << std::endl;
    
    // Task is not executed yet
    std::cout << "Result: " << fut.get() << std::endl; // Task is executed here
    
    return 0;
}
```

**Output:**
```
Before calling get()
Computing 3 + 4
Result: 7
```

### Best Practices with `std::async`

1. **Specify Launch Policy**: Use `std::launch::async` to ensure the task runs on a new thread or `std::launch::deferred` for deferred execution.
2. **Manage Dependencies**: Ensure that dependencies between asynchronous tasks are well-defined to prevent race conditions.
3. **Handle Exceptions**: Be prepared to handle exceptions that may be thrown by asynchronous tasks when calling `get()`.

---

## Summary

In this chapter, you've explored the foundational aspects of **Concurrency and Multithreading** in C++:

- **Introduction to Concurrency**: Understood the importance of concurrency, its benefits, and the challenges it presents.
- **Threads and `std::thread`**: Learned how to create and manage threads, pass arguments, detach threads, and use lambda expressions for thread functions.
- **Mutexes and Locks (`std::mutex`, `std::lock_guard`)**: Explored how to protect shared data using mutexes and RAII-based lock guards to ensure thread safety.
- **Condition Variables (`std::condition_variable`)**: Delved into synchronizing threads based on specific conditions, implementing producer-consumer scenarios.
- **Atomic Operations (`std::atomic`)**: Utilized atomic types to perform thread-safe operations without explicit locking, enhancing performance for simple tasks.
- **Futures and Promises (`std::future`, `std::promise`)**: Facilitated communication between threads by passing results asynchronously using futures and promises.
- **Asynchronous Programming (`std::async`)**: Leveraged `std::async` to execute tasks asynchronously, improving application responsiveness and performance.

Mastering these concurrency and multithreading concepts is crucial for building efficient, high-performance C++ applications that can handle multiple tasks simultaneously. As you continue your programming journey, these skills will enable you to design robust systems capable of leveraging modern multi-core processors effectively.

---

Now you're ready to move on to **Advanced Template Programming**, where you'll delve deeper into the powerful features of C++ templates for creating highly flexible and reusable code.

Next chapter: [Advanced Template Programming](/2024/09/27/cpp-unleash/02h-advtemplate)