## scratch-projects
#### HTTP server for saving & retrieving Scratch projects.

[![Build Status](https://travis-ci.com/LLK/scratch-projects.svg?token=xzzHj4ct3SyBTpeqxnx1&branch=develop)](https://travis-ci.com/LLK/scratch-projects)

## Overview

#### Architecture
![](https://cloud.githubusercontent.com/assets/747641/15540611/5c77a7b0-2256-11e6-807c-8cc13d5d2544.png)

#### Workflow
- Protect
    - Throttle
    - Limit payload size (2.5 MB)
- Authenticate against API
- Validate request body
    - Is JSON
    - Is valid project object
- Create new "empty" project with API
- Upload to storage (S3)
- Log to research DB (via SQS)
- Respond

## Routes
| Method | Path   | Description                                                |
| ------ | ------ | ---------------------------------------------------------- |
| `POST` | `/`    | Create a new project                                       |
| `PUT`  | `/:id` | Update an existing project with the specified project ID   |
| `GET`  | `/:id` | Get an existing project with the specified project ID      |

## Configuration
| Variable                | Default  | Description                             |
| ----------------------- | -------- | --------------------------------------- |
| `AWS_S3_BUCKET`         | `String` | S3 bucket for saving / getting objects  |
| `AWS_ACCESS_KEY_ID`     | `String` | AWS access key                          |
| `AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key                          |

## Running
```bash
npm start
```

## Testing
```bash
npm test
```

```bash
make coverage
```
