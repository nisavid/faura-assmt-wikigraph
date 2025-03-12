# 📚 Wikipedia Link Graph API

**Author**: Ivan D Vasin

**Context**: This project is a technical assessment for Faura.

<!--toc:start-->

- [ℹ️ Overview](#overview)
- [☑️ Features](#features)
- [🏗️ Tech Stack](#tech-stack)
- [▶️ Getting Started](#getting-started)
- [✅ Testing](#testing)
- [⌨️ Manual API Usage](#manual-testing)
- [🚦 Encore Dashboard](#encore-dashboard)
- [🚀 Potential Enhancements](#enhancements)

<!--toc:end-->

<a id="overview"></a>

## ℹ️ Overview

**Wikipedia Link Graph** is a REST API built with TypeScript and Encore.ts. It fetches Wikipedia article links recursively up to a user-defined depth and returns the resulting network as structured JSON. This showcases external API integration, recursion handling, structured error management, input validation, and test-driven development practices.

<a id="features"></a>

## ☑️ Features

- **Recursive Graph Generation**:  
  Fetches Wikipedia article links recursively up to a specified depth, while gracefully handling cycles and duplicate nodes.

- **Input Validation**:  
  Sensible validation constraints on input values, leveraging Encore's built-in validation types.

- **Structured Error Handling**:  
  Robust, informative errors using Encore's structured API errors.

- **Comprehensive Automated Testing**:  
  Extensive tests covering recursive traversal, cycles, duplicate nodes, and failure propagation.

<a id="tech-stack"></a>

## 🏗️ Tech Stack

- **TypeScript**: Language choice for robust typing and readability.
- **Encore.ts**: Backend framework providing structured APIs, automatic validation, and structured errors.
- **Vitest**: Fast, intuitive, Vite-based unit testing framework.

External APIs:

- **Wikipedia API**: Fetches article link data from Wikipedia.

<a id="getting-started"></a>

## ▶️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- [Encore CLI](https://encore.dev/docs/ts/installation)

### Clone and Install

```sh
git clone https://github.com/nisavid/faura-assmt-wikigraph wikigraph
cd wikigraph
npm install
```

### Run the API Locally

```sh
encore run
```

This will start the API and automatically open `http://localhost:9400` in your default web browser.

<a id="testing"></a>

## ✅ Running Tests

Run automated tests with:

```sh
encore test
```

Test scenarios include:

- Recursive fetching at varying depths.
- Handling cycles (self-referential links, two-page loops, three-page loops).
- Robust error propagation.

<a id="manual-testing"></a>

## ⌨️ Manual API Testing

Use `curl` for quick manual checks:

```sh
curl -s 'http://localhost:4000/graph/Albert_Einstein?depth=1' | jq
```

<a id="encore-dashboard"></a>

## 🚦 Encore Development Dashboard

Encore provides a local development dashboard for API documentation and tracing.

Once running, visit:

```
http://localhost:9400
```

<a id="enhancements"></a>

## 🚀 Potential Enhancements

- **Visual Graph Generation**: Generate graph visualizations using **viz.js**.
- **Performance Improvements**: Implement caching for retrieved Wikipedia data.
- **Asynchronous Tasks**: Queue deep traversal tasks for long-running processing and later retrieval.
