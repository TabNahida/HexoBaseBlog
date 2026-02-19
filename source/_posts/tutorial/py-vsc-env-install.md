---
title: "Python VSCode Environment Install"
date: 2024-09-22 23:33:32
tags:
    - Python
    - VSCode
    - SetUp
categories: Tutorial
---

# Python and VSCode Install tutorial
In this tutorial, you will learn how to install ``VSCode`` the most popular code editor and ``Python`` the most popular programming language.

<!--more-->

## Install VSCode
1. Please download ``VSCode`` install packages from the offical website.
    - [VSCode for Windows]("https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user")
    - [VSCode for Mac]("https://code.visualstudio.com/sha/download?build=stable&os=darwin-universal")
    - [Other VSCode versions]("https://code.visualstudio.com/Download")
    _If you are linux, windows on arm or other platforms please use this link_

    After download,
    - for windows users, it is an exe file. Just click it and follow its installation guide.
    - for mac users, it is  zip file. Unzip the zip file and click the VSCode icon to start the app.
    - for linux users, it is a package file. Install the package with your package mananger.

2. After install VSCode, you can open the extension markets by click the extension icon or press ``Ctrl+Shift+X`` in the same time.

## Install Python
1. Please download ``Python`` install packages from the offical website.
    - [Python for Windows]("https://www.python.org/ftp/python/3.12.6/python-3.12.6-amd64.exe")
    - [Python for Mac]("https://www.python.org/ftp/python/3.12.6/python-3.12.6-macos11.pkg")
    - [Other Python versions]("https://www.python.org/downloads/release/python-3126/")
    _If you are using a operating system with package manager, please install Python from the package manager_

    After download,
    - for windows user, it is an exe file. Click it and follow the installation guide. I highly recommand you to **ADD PYTHON INTO ``PATH``**
    - for mac user, it is a pkg file. Click it and follow the installation guide.

2. Change ``PyPi`` source to a local mirror to better download python packages.

    For chinese user, here are three ``PyPi`` mirror.

    - [Tuna Tsinghua]("https://mirrors.tuna.tsinghua.edu.cn/help/pypi/")
    - [Aliyun]("https://developer.aliyun.com/mirror/pypi?spm=a2c6h.13651102.0.0.514f1b11JxB4w1")
    - [USTC]("https://mirrors.ustc.edu.cn/help/pypi.html")
    - [Other mirrors]("https://lug.org.cn/doku.php?id=china-edu-open-source-mirrors")

    In this tutorial, I will show how to change into ``Tuna`` mirror. Open the terminal and type in two lines of commands as below
    ```bash
    python -m pip install -i https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple --upgrade pip
    pip config set global.index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple
    ```

## Setup Python in VSCode

1. Install Python extension in VSCode. First open the extension market and search ``python``. You could install all needed python package by installing the ``Python Extension Pack``.

2. This tutorial recommand you to install Jupyter Notebook as a better way to use Python. To install Jupyter Notebook, please search ``Jupyter`` and install ``Jupyter``.

3. Install ``ipykernel`` with pip, type in this command
```bash
pip install ipykernel
```

4. Open a new ``.ipynb`` format file and start your coding.
