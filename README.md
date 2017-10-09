## scratch-projects
#### HTTP server for saving & retrieving Scratch projects.

[![Greenkeeper badge](https://badges.greenkeeper.io/LLK/scratch-projects.svg?token=4282dc28abec63c0c9db8f799091dbc1f0e0309bdc1967fe8146ec86b849b5c2&ts=1507571352230)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.com/LLK/scratch-projects.svg?token=xzzHj4ct3SyBTpeqxnx1&branch=develop)](https://travis-ci.com/LLK/scratch-projects)

## Overview

#### Architecture
![](https://cloud.githubusercontent.com/assets/747641/23216546/52ee39ec-f8e4-11e6-9dbf-9cc29aa8fc62.png)

#### Workflow
- Protect
    - Throttle
    - Limit payload size (2.5 MB)
- Unpack cookies
- Validate request body
    - Is JSON
    - Is valid project object
- Create new project with backend
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
| Variable                   | Type     | Description                                 |
| -------------------------- | -------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`        | `String` | AWS access key                              |
| `AWS_SECRET_ACCESS_KEY`    | `String` | AWS secret key                              |
| `AWS_S3_BUCKET`            | `String` | S3 bucket for saving / getting objects      |
|                            |          |                                             |
| `BACKEND_HOST`             | `String` | Host for backend auth and project creation  |
|                            |          |                                             |
| `EB_AWS_ACCESS_KEY_ID`     | `String` | AWS access key for deployment               |
| `EB_AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key for deployment               |

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
