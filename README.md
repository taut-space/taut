## scratch-projects
#### HTTP server for saving & retrieving Scratch projects.

## Overview

#### Workflow
- Protect (throttle and limit payload size)
- Authenticate against API
- Create new "empty" project with API
- Validate request body
    - Is JSON
    - Is valid project object
- Upload to storage (S3)
- Log to research DB
- Respond
```

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
