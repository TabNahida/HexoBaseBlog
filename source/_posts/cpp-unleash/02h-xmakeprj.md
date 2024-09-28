---
title: "C++ Unleashed: Using xmake to Build Projects"
date: 2024-09-27 01:55:38
tags:
    - c-cpp
    - modern-cpp
    - cpp-unleash
    - 02Hero
categories: tutor
---

___C++ Unleashed: From Zero to Hero___

Previous chapter: [Testing, Debugging, and Building](/2024/09/27/cpp-unleash/02h-testing)

[Go to Table of Contents](/2024/09/26/cpp-unleash/02h-menu)

# Using xmake to Build Projects

In this chapter, we will learn how to use **xmake**, a cross-platform build utility that simplifies the building and managing of C++ projects. With xmake, you can easily configure your build environment and manage dependencies without hassle. 

<!--more-->

## Creating the `xmake.lua` File

The configuration for your xmake project is defined in a file named `xmake.lua`. This file contains all the necessary information for building your application, including source files, target settings, and dependencies.

### Basic Structure of `xmake.lua`

Here’s a minimal example of a `xmake.lua` file for a console application:

```lua
-- Set the project name
set_project("MyApp")

-- Set the version
set_version("1.0.0")

-- Set the target type
target("myapp")
    set_kind("binary")
    
    -- Add source files
    add_files("src/*.cpp")

    -- Include directories
    add_includedirs("include")

    -- Link libraries
    add_links("mylib")
```

### Explanation

- **set_project**: Define the project name.
- **set_version**: Specify the version of the project.
- **target**: Create a target (e.g., a binary named `myapp`).
- **set_kind**: Indicate the type of target (binary, shared, static).
- **add_files**: Specify the source files to include in the build.
- **add_includedirs**: Define directories for header files.
- **add_links**: Link against any external libraries.

## Building the Project

Once your `xmake.lua` file is ready, building your project is straightforward. Open a terminal, navigate to your project directory, and run:

```bash
xmake
```

This command will compile your project according to the specifications defined in the `xmake.lua` file.

### Building in Release Mode

To compile your project in release mode, you can configure it with:

```bash
xmake f -m release
```

Then run the build command again:

```bash
xmake
```

## Managing Dependencies

xmake makes it easy to manage dependencies, allowing you to integrate third-party libraries seamlessly. You can specify required dependencies directly in your `xmake.lua` file.

### Adding Dependencies

For example, if you want to use the `boost` library, modify your `xmake.lua` as follows:

```lua
add_requires("boost")

target("myapp")
    set_kind("binary")
    add_files("src/*.cpp")
    add_packages("boost")
```

### Installing Dependencies

Before building your project, ensure that all required dependencies are installed. Use the following command:

```bash
xmake install
```

This will automatically download and install the specified packages.

## Running the Application

Once the build process is complete, you can run your application directly from the command line:

```bash
xmake run myapp
```

## Summary

In this chapter, we have covered how to use **xmake** to build C++ projects efficiently. We discussed the creation of the `xmake.lua` configuration file, the process of building your project, and how to manage dependencies with ease. By using xmake, you can streamline your development workflow and focus more on coding.

In the next chapter, we will dive into **Practical Projects**, where you'll apply your newfound knowledge to real-world programming challenges and best practices.

For more information, visit the official [xmake website](https://xmake.io).

Next chapter: [Practical Projects](/2024/09/27/cpp-unleash/02h-prctlprj)
