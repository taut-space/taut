## scratch-projects
#### http server for saving & retrieving scratch assets.

[![Build Status](https://travis-ci.com/LLK/scratch-assets.svg?token=xzzHj4ct3SyBTpeqxnx1&branch=develop)](https://travis-ci.com/LLK/scratch-assets)
[![Greenkeeper badge](https://badges.greenkeeper.io/LLK/scratch-assets.svg?token=60538b212e62273e32ba817c779892fede97dd6575a84826f7205bea69338d02&ts=1526475781390)](https://greenkeeper.io/)

## Overview

#### Architecture
![](https://github.com/colbygk/scratch-assets/blob/4aad8750544d500099dea303570016575b69839c/architecture.png)

#### Workflow

##### Set/Post
- Assets AWS App Cluster
    - Throttle
    - Limit payload size (10 MB)
    - Unpack cookies
      - Is valid session
- Validate request body
    - Is valid MD5
    - Is valid asset type
- Respond
- Queue Upload to storage (S3)
    - Already exists?
      - Underlying MD5 hashes match?
      - pixel dimensions not crazy?
      - other media dimensions not crazy?
    - Store

##### Get
- Fastly
- S3
- Respond

## Routes
| Method | Path      | Description                                                 |
| ------ | --------- | ----------------------------------------------------------- |
| `GET`  | `/health` | Returns basic health information (used for load balancing)  |
| `POST` | `/:id`    | Store an asset with the specified id                        |
| `GET`  | `/:id`    | Get an existing asset with the specified id                 |

* Note that the `id` is the md5 hash of the contents of the asset appended with the media type of `png|svg|wav|json|...`

## Configuration
| Variable                   | Type     | Description                                 |
| -------------------------- | -------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`        | `String` | AWS access key                              |
| `AWS_SECRET_ACCESS_KEY`    | `String` | AWS secret key                              |
| `AWS_S3_BUCKET`            | `String` | S3 bucket for saving / getting objects      |
|                            |          |                                             |
| `EB_AWS_ACCESS_KEY_ID`     | `String` | AWS access key for deployment               |
| `EB_AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key for deployment               |

* Note that the EB application service runs with IAM Role based permissions and therefore **does not** make use of `AWS_ACCESS_KEY_ID` nor `AWS_SECRET_ACCESS_KEY` when running in production or staging environments. These values are only used if run with `NODE_ENV=testing`

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
