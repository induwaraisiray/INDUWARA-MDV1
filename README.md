<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Black+Ops+One&size=100&pause=1000&color=FF0000&center=true&width=1000&height=200&lines=INDUWARA-MD-V1" alt="Typing SVG" /></a>
  </p>
  
---  

> **`Updated To` The Version 0.1**
---

```
name: Node.js CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Clean dependencies and install specific versions
        run: |
          rm -rf node_modules package-lock.json
          npm install cheerio@1.0.0-rc.12 css-select@5.1.0 --legacy-peer-deps

      - name: Install remaining dependencies
        run: npm install --legacy-peer-deps

      - name: Start application
        run: npm start

```

--- 

<a><img src='https://i.ibb.co/srSNWLW/w-Clr-IIGJFm.jpg'/></a>

---

<p align="center">
  <a href="https://github.com/XdTechPro"><img title="Developer" src="https://img.shields.io/badge/Author-Jawad%20TechX-FF7604.svg?style=big-square&logo=github" /></a>
</p>

