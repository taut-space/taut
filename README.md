## scratch-projects
#### HTTP server for saving & retrieving Scratch projects.

[![Build Status](https://travis-ci.com/LLK/scratch-projects.svg?token=xzzHj4ct3SyBTpeqxnx1&branch=develop)](https://travis-ci.com/LLK/scratch-projects)

## Overview

#### Architecture
![](https://cloud.githubusercontent.com/assets/747641/15540768/31db0654-2257-11e6-8239-be894677323b.png)

#### Workflow
- Protect
    - Throttle
    - Limit payload size (2.5 MB)
- Unsign session cookie
- Authenticate against API
- Validate request body
    - Is JSON
    - Is valid project object
- Create new "empty" project with API
- Upload to storage (S3)
- Respond

## Routes
| Method | Path      | Description                                                 |
| ------ | --------- | ----------------------------------------------------------- |
| `GET`  | `/health` | Returns basic health information (used for load balancing)  |
| `POST` | `/`       | Create a new project                                        |
| `PUT`  | `/:id`    | Update an existing project with the specified project ID    |
| `GET`  | `/:id`    | Get an existing project with the specified project ID       |


## Configuration
| Variable                | Type     | Description                                 |
| ----------------------- | -------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | `String` | AWS access key                              |
| `AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key                              |
| `AWS_S3_BUCKET`         | `String` | S3 bucket for saving / getting objects      |
|                         |          |                                             |
| `API_HOST`              | `String` | API host for user auth and project creation |
|                         |          |                                             |
| `SESSION_SALT`          | `String` | Salt for session cookie cryptography        |
| `SESSION_SECRET`        | `String` | Secret key for session cookie cryptography  |

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
