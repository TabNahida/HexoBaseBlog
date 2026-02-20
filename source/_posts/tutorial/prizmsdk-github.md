---
title: "Using PrizmSDK to Build Programs for Casio Graphing Calculators"
date: 2024-09-29 11:54:45
tags:
    - Embedded
    - Compiler
    - Toolchain
    - Library
    - SetUp
categories: Tutorial
---

# Using PrizmSDK to Build Programs for Casio Graphing Calculators

### Introduction

If you're a developer who loves coding or is interested in running custom programs on Casio graphing calculators, you may have heard of **PrizmSDK**. PrizmSDK is a software development kit (SDK) designed for developing programs that run on Casio graphing calculators, such as the fx-CG series. In this article, we will walk you through how to use **PrizmSDK**, which integrates `libfxcg`, `mkg3a`, `gcc`, and `binutils` into a complete SDK toolchain.

<!--more-->

### Components of PrizmSDK

Your PrizmSDK is built upon the following toolchain components:
- **libfxcg**: A library that facilitates hardware interactions with the Casio fx-CG series calculators, providing an abstraction of the calculator's API and hardware operations.
- **mkg3a**: A tool for packaging and generating executable files in the G3A format, which is the format required by Casio calculators.
- **gcc (GNU Compiler Collection)**: The compiler that translates C or C++ source code into machine code.
- **binutils**: A suite of tools for handling object files, including the linker and other utilities.

By combining these tools, PrizmSDK allows you to easily compile, package, and run programs on Casio calculators.

### Installing PrizmSDK

First, make sure you’ve cloned the [PrizmSDK repository](https://github.com/TabNahida/PrizmSDK). You can do this by running the following commands:

```bash
git clone https://github.com/TabNahida/PrizmSDK.git
cd PrizmSDK
```

Before proceeding, you need to install some dependencies like `gcc`, `make`, and `binutils`. On Linux or macOS, you can install them using the following command:

```bash
sudo apt-get install gcc make binutils
```
Then you can run following commad to clone `gcc` `binutils` `libfxcg` and `mkg3a`:

```bash
git clone https://github.com/Jonimoose/libfxcg.git
git clone https://gitlab.com/taricorp/mkg3a.git
git clone git://gcc.gnu.org/git/gcc.git
git clone git://sourceware.org/git/binutils-gdb.git
chmod +x build.sh
./build.sh
```

If you're using Windows, it's recommended to use [PrizmSDK prebuild by libfxcg](https://github.com/Jonimoose/libfxcg/releases).

### Building Your First Program

Once the installation is complete, let’s create and build a simple "Hello, World!" program.

#### 1. Writing C Source Code

Create a new directory and navigate into it:

```bash
mkdir hello_world
cd hello_world
```

Next, create a file called `main.c` and insert the following code:

```c
#include <fxcg/display.h>

int main(void) {
    // Clear the screen and display "Hello, World!"
    Bdisp_AllClr_VRAM();
    PrintXY(5, 5, "Hello, World!", 0);
    
    // Wait for user input
    while (1) {
        int key;
        GetKey(&key);
        if (key == KEY_CTRL_EXIT) {
            break;
        }
    }
    
    return 0;
}
```

#### 2. Compiling the Program

Ensure you’ve set up your environment variables to include PrizmSDK’s toolchain in your `$PATH`. For example:

```bash
export PATH=/path/to/PrizmSDK/bin:$PATH
```

Then, use `make` to compile the program. You can utilize the Makefile from PrizmSDK to simplify the process. Run the following command:

```bash
make
```

After compiling, you will see a `.g3a` file, which is the executable format that you can run on the Casio calculator.

#### 3. Uploading the Program to the Calculator

To upload the generated `.g3a` file to your calculator, connect your calculator via USB and transfer the file to the "Applications" folder on the calculator.

### Additional Features

PrizmSDK offers a rich set of APIs, enabling you to perform more complex tasks on the calculator, such as:
- **Graphics Drawing**: You can draw graphics and even create simple games.
- **File Operations**: Read and write files directly.
- **Hardware Interaction**: Interact with the calculator’s hardware, such as the keyboard and display.

### Conclusion

With PrizmSDK, you can leverage the hardware capabilities of Casio graphing calculators to develop rich custom programs and applications. This article walked you through installing the SDK, writing a simple "Hello, World!" program, and deploying it to the calculator. As you continue exploring the SDK, you’ll be able to create more complex and exciting applications.
