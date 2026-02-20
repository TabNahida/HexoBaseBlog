---
title: nanozhgpt-dev
date: 2026-02-19 22:43:54
tags:
    - Python
    - C/C++
    - AI
    - LLM
    - NLP
    - Model Training
    - PyTorch
categories: Dev Journal
---

看了篇知乎文章，讲他自己训练了一个3M左右参数的中文大模型，效果还可以，我就想自己也训练一个。我最开始订下的是10M左右，后续把标准定到100M，数据集是C4的ZH部分，数据总量在67GB的样子。

最开始的是确定的词表，我选择了Byte level BPE，大小定在50K，算大词表。训练词表的时候就踩了坑，本来是准备用HF的Datasets配合Tokenizer的Trainer，结果跑很久都无法完成对如此海量数据的预处理，折腾了很久，最后还是下定决心自己写了一个面对这种情况的C++ trainer，很快就把问题解决了。

然后就是训练部分，因为开始做这个项目的时候还不知道lightning之类的框架，只能自己写一套训练框架，有很多细节处理的不是很好。第一波训练的loss还可以，但是不知道为什么我把token处理换成C++的版本后就不太行了，最后17000反而是几次训练里loss最低的，但是实际效果其实一般。后续我还训练了v2和10M的版本，还租用GPU训练了一个300M的上下文长度更长的。

现在只做了Pretrain就踩了不少坑，后需Post Train应该是不用做了，但是大概知道该怎么训练了，我在想后面再来一个项目做更好的只针对英文文本的模型，然后改进一下结构。



# Training NanoZhGPT: My Journey Building a 100M Parameter Chinese Language Model

A few weeks ago, I came across a Zhihu article where someone trained a 3M parameter Chinese LLM with decent results. That sparked an idea: why not try training my own? What started as a modest 10M parameter goal eventually evolved into a 100M parameter model.

<!--more-->

## Dataset and Tokenizer

**Dataset**: C4 Chinese portion, ~67GB  
**Tokenizer**: Byte-level BPE, 50K vocabulary

I spent a long time debugging HF's Tokenizer Trainer. Every run ended the same way: either out of memory or stuck indefinitely during preprocessing. The HF Datasets pipeline would consume massive RAM and never complete on 67GB of data.

After countless failed attempts, I finally decided to write a C++ trainer from scratch—pure vibe coding session. The result: a custom Byte-Level BPE trainer that handles large-scale data efficiently.

**Technical details of the C++ trainer:**
- Uses `xmake` build system with zlib compression support
- Reads data paths from `.env` file (supports json/json.gz glob patterns)
- Implements chunk-based processing for resume capability
- Outputs per-chunk files to `chunks/` directory
- Configurable chunk grouping via `--chunk-files N`
- Force rebuild option with `--no-resume`

```cpp
// Custom C++ Byte-Level BPE Trainer
// Build: xmake f -m release && xmake
// Run: xmake run byte_bpe_train --output tokenizer.json
// Resume support: chunks/ directory stores intermediate state
```

The C++ version completed in a fraction of the time with minimal memory footprint.

## Training Framework

When I started this project, I wasn't familiar with frameworks like PyTorch Lightning. This meant implementing everything from scratch: the training loop, checkpoint saving/loading, gradient accumulation, mixed precision, and validation logic.

Building the framework myself gave me deep insights into how these systems work, but it also consumed significant engineering time. The implementation includes:
- Checkpoint management with metadata tracking
- Gradient checkpointing for memory efficiency
- Automatic OOM recovery with batch size reduction
- XPU/CUDA memory monitoring and logging
- Streaming data loader with prefetching and RAM caching

```bash
# Training command example
python train/train_xpu.py \
  --data-dir data/tokens \
  --out-dir checkpoints/gpt100m \
  --seq-len 1024 \
  --n-layer 14 --n-head 10 --n-embd 640 \
  --batch-size 2 --grad-accum 16 \
  --gradient-checkpointing --oom-auto-reduce
```

## Training Time and Compute

All models were trained on local XPU except the 300M model, which I'm currently training on rented AutoDL GPU cloud compute.

| Model  | Params | Seq Len | Training Time | Compute    |
|--------|--------|---------|---------------|------------|
| 10M    | ~10M   | 1024    | ~8 hours      | Local XPU  |
| 100M   | ~100M  | 1024    | ~24 hours     | Local XPU  |
| 100M v2| ~100M  | 2048    | ~36 hours     | Local XPU  |
| 300M   | ~300M  | 2048    | ~82 hours*    | AutoDL GPU |

*Still in progress

The 300M model features extended context length and is my largest training experiment so far.

## Training Results

### 100M Model (seq_len=1024)

```mermaid
xychart-beta
    title "100M Model: Validation Loss vs Iterations"
    x-axis [500, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 17000]
    y-axis "Validation Loss" 2.5 --> 7.0
    line [6.47, 4.70, 3.86, 3.55, 3.33, 3.24, 3.15, 3.08, 3.02, 3.01]
```

**Best checkpoint**: Iteration 17,000  
**Best val_loss**: 3.007 (ppl: 20.23)

### 100M v2 Model (seq_len=2048)

```mermaid
xychart-beta
    title "100M v2 Model: Validation Loss vs Iterations"
    x-axis [500, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 19000, 20000]
    y-axis "Validation Loss" 3.5 --> 7.5
    line [7.23, 5.66, 4.38, 4.12, 4.03, 3.93, 3.84, 3.79, 3.77, 3.74, 3.73, 3.72]
```

**Best checkpoint**: Iteration 19,000  
**Best val_loss**: 3.728 (ppl: 41.59)

**Note**: Training showed instability with NaN losses at iterations 4,500 and 7,500. Despite doubled sequence length (2048 vs 1024), the model achieved higher validation loss than the original 100M, suggesting training instability or different data sampling affected convergence.

### 10M Model (seq_len=1024)

```mermaid
xychart-beta
    title "10M Model: Validation Loss vs Iterations"
    x-axis [500, 2000, 5000, 8000, 10000, 12000, 15000, 17000, 20000]
    y-axis "Validation Loss" 4.0 --> 8.5
    line [8.06, 6.60, 5.41, 5.00, 4.89, 4.81, 4.76, 4.74, 4.72]
```

**Best checkpoint**: Iteration 20,000  
**Best val_loss**: 4.715 (ppl: 111.65)

### Model Comparison

| Model  | Params | Seq Len | Best Iter | Val Loss | Perplexity |
|--------|--------|---------|-----------|----------|------------|
| 100M   | ~100M  | 1024    | 17,000    | 3.007    | 20.23      |
| 100M v2| ~100M  | 2048    | 19,000    | 3.728    | 41.59      |
| 10M    | ~10M   | 1024    | 20,000    | 4.715    | 111.65     |

## Key Observations

1. **Sequence length trade-off**: 100M v2 (seq_len=2048) achieved worse loss (3.728) than 100M (seq_len=1024, loss 3.007). Training instability with NaN losses at iterations 4.5K and 7.5K suggests longer sequences may require different hyperparameters.

2. **C++ tokenization issue**: After switching to C++ token processing, training performance degraded despite faster data loading.

3. **Loss vs quality gap**: Good validation loss didn't translate to impressive generation quality.

4. **Training dynamics**: The 10M model showed smoother, more predictable convergence than 100M variants.

## Lessons Learned

**Data preprocessing is critical** - The tokenizer training bottleneck was my first major obstacle. HF's abstractions that work well for small datasets become bottlenecks at scale. Sometimes you need to drop to a lower level.

**Vibe coding works** - When conventional tools fail, sometimes you just need to sit down and code your way out. The C++ trainer was born from frustration and a "let me just try this" mindset.

**Metrics aren't everything** - Validation loss on C4 doesn't guarantee good generative quality, especially for small models. The gap between metrics and real-world performance is real.

**Framework trade-offs** - Building from scratch gave me deep insights into training infrastructure (checkpointing, gradient accumulation, mixed precision), but consumed time that could have gone to model improvements. Now I understand why Lightning exists.

**Scale brings complexity** - Larger models need more careful tuning. The 10M model trained smoothly in 8 hours, while 100M v2 took 36 hours and showed training instability. My current 300M experiment on AutoDL (82+ hours) is teaching me even more about scaling challenges.

**Cloud compute is valuable** - Renting GPU time on AutoDL allowed me to experiment with larger models (300M) that wouldn't be feasible on local hardware.

## What's Next

Planning an English-only model with architectural improvements:
- Different attention mechanisms
- Better normalization strategies  
- Longer context lengths
- Learning from Lightning and other frameworks

The 100M milestone is a good stopping point for this iteration. The 300M model training on AutoDL will provide more insights into scaling. The process of building everything from scratch—from tokenizer to trainer to evaluation—has been incredibly educational.

Sometimes the best way to understand how something works is to build it yourself, bugs and all.

The 100M milestone is a good stopping point. The model won't win benchmarks, but building it—from tokenizer to trainer to evaluation—taught me more than any tutorial could.

---

**Technical Stack**:
- Tokenizer: Custom C++ Byte-level BPE (50K vocab)
- Training: PyTorch on XPU, bfloat16, gradient checkpointing
- Dataset: C4 Chinese (~67GB)
- Code: Available on GitHub

