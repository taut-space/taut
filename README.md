## scratch-assets
#### http server for saving & retrieving scratch assets.

[![Build Status](https://travis-ci.com/LLK/scratch-assets.svg?token=xzzHj4ct3SyBTpeqxnx1&branch=develop)](https://travis-ci.com/LLK/scratch-assets)
[![Greenkeeper badge](https://badges.greenkeeper.io/LLK/scratch-assets.svg?token=4282dc28abec63c0c9db8f799091dbc1f0e0309bdc1967fe8146ec86b849b5c2&ts=1507571352230)](https://greenkeeper.io/)

## Overview

#### Architecture
![](https://github.com/colbygk/scratch-assets/blob/4aad8750544d500099dea303570016575b69839c/architecture.png)

#### Workflow

##### Post
- Assets AWS App Cluster
    - Throttle
    - Unpack cookies
      - Is valid session
- Stream into storage (S3)
    - Store under temporary name
    - Detects asset type
        - Sets mime type
    - Already exists?
        - Existing asset's MD5 matches filename?
        - Respond OK
    - Limit streaming size (10 MB)
        - > limit, respond with BadRequest
    - Is valid MD5
        - ETag/MD5 hash matches filename?
        - If not respond with BadRequest
    - All good?
        - Rename to final hash.ext form
    - Respond

##### Get
- Fastly
- S3
- Try backend assets if S3 miss
- Respond

## Routes
| Method | Path      | Description                                                 |
| ------ | --------- | ----------------------------------------------------------- |
| `GET`  | `/health` | Returns basic health information (used for load balancing)  |
| `POST` | `/:hashname`    | Store an asset with the specified hashname            |
| `POST` | `/internalapi/asset/:hashname/set`    | Legacy API (deprecated)         |
| `GET`  | `/:hashname`    | Get an existing asset with the specified hashname     |
| `GET`  | `/internalapi/asset/:hashname/get`    | Legacy API (deprecated)         |

* Note that the `id` is the md5 hash of the contents of the asset appended with the media type of `png|svg|wav|json|...`

## Configuration
| Variable                   | Type     | Description                                 |
| -------------------------- | -------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`        | `String` | AWS access key                              |
| `AWS_SECRET_ACCESS_KEY`    | `String` | AWS secret key                              |
| `AWS_S3_BUCKET`            | `String` | S3 bucket for saving / getting objects      |
| `CONNECT_TIMEOUT`          | `number` | S3 connection timeout (1.5 seconds)         |
| `DATA_TIMEOUT`             | `number` | No streaming data timeout (15 seconds)      |
| `MAX_OBJECT_SIZE_BYTES`    | `number` | Maximum size of objects uploaded in bytes   |
|                            |          |                                             |
| `EB_AWS_ACCESS_KEY_ID`     | `String` | AWS access key for deployment               |
| `EB_AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key for deployment               |
|                            |          |                                             |
| `FASTLY_EDGE_HEADER`       | `String` | Allow access to backend Fastly              |
| `SCRATCH_EDGE_HEADER`      | `String` | Allow access through Scratch Edge           |
| `BACKEND_HOST`             | `String` | Used for authorization/session management   |
| `BACKEND_ASSETS_STORE`     | `String` | Ye Olde storage system/legacy api           |




* Note that the EB application service runs with IAM Role based permissions and therefore **does not** make use of `AWS_ACCESS_KEY_ID` nor `AWS_SECRET_ACCESS_KEY` when running in production or staging environments. These values are only used if run with `NODE_ENV=testing`

## Docker usage
This repository ships with a `.env` file that defines testing credentials that only allow access to `scratch2-assets-test` when spun up into a standalone docker container.
For more tips see:  [Working with docker and Scratch development](https://github.com/LLK/scratch-ops/wiki/Working-with-Docker-and-Scratch-Development)

### Start up

```bash
docker-compose up
```

### Tear down

```bash
docker-compose down -v
```

### Examples Accessing

```bash
curl http://localhost:8557/health
curl -H "Content-type: application/octet-stream" -H "Cookie: session..."--data-binary @a.png http://localhost:8557/eed459aa6ca84d7403768731519d60d3.png
curl http://localhost:8557/eed459aa6ca84d7403768731519d60d3.png
```

You can attach to the running docker container and run the tests:

```bash
docker exec -it scratch-assets bash
npm test
```

## Running (non-docker)
```bash
npm start
```

## Testing (in docker container or outside of it)
```bash
npm test
```

```bash
make coverage
```
